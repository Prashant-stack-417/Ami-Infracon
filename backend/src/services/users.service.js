import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import User, { BCRYPT_SALT_ROUNDS } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/sendEmail.js";

const googleClient = new OAuth2Client(process.env.CLIENT_ID);

class UsersService {
  async register(data) {
    const { name, phone, password, coordinates, email } = data;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email,
      phone: phone.trim(),
      password: hashedPassword,
      coordinates: coordinates || undefined,
      role: "user",
    });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");

    if (!user) {
      await bcrypt.hash("dummy", BCRYPT_SALT_ROUNDS);
      throw new ApiError(401, "Invalid email or password");
    }

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new ApiError(423, `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`);
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated. Please contact support.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw new ApiError(401, "Invalid email or password");
    }

    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  }

  async googleAuth(data) {
    const { credential, email, name, accessToken } = data;
    let userEmail, userName;

    try {
      if (credential) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        userEmail = payload.email;
        userName = payload.name;
      } else if (email && accessToken) {
        const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new ApiError(401, "Invalid Google access token");
        }

        const googleUser = await response.json();
        userEmail = googleUser.email;
        userName = name || googleUser.name;
      } else {
        throw new ApiError(400, "Google credential or access token is required");
      }

      if (!userEmail) {
        throw new ApiError(400, "Email not provided by Google");
      }

      let user = await User.findOne({ email: userEmail.toLowerCase() });

      if (user) {
        if (!user.isActive) {
          throw new ApiError(403, "Account is deactivated. Please contact support.");
        }
      } else {
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-8) + Date.now().toString(),
          BCRYPT_SALT_ROUNDS,
        );

        user = await User.create({
          name: userName || userEmail.split("@")[0],
          email: userEmail.toLowerCase().trim(),
          phone: `+91${Date.now().toString().slice(-10)}`, 
          password: randomPassword,
          role: "user",
          isActive: true,
        });
      }

      const jwtAccessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save();

      return {
        user: user.toJSON(),
        accessToken: jwtAccessToken,
        refreshToken,
        isNew: user.createdAt.getTime() === user.updatedAt.getTime()
      };
    } catch (error) {
      if (error.name === "ApiError") throw error;
      throw new ApiError(401, "Invalid Google token");
    }
  }

  async refreshToken(userId, tokenFromCookie) {
    const user = await User.findById(userId).select("+refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!tokenFromCookie || user.refreshToken !== tokenFromCookie) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }, { new: true });
    }
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!user.isActive) {
      throw new ApiError(403, "Account is deactivated");
    }
    return user.toJSON();
  }

  async updateProfile(userId, data) {
    const { name, phone, defaultAddress } = data;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (defaultAddress) {
      user.defaultAddress = { ...user.defaultAddress, ...defaultAddress };
    }

    await user.save();
    return user.toJSON();
  }

  async getAllUsers() {
    return await User.find().select("-password -refreshToken").lean();
  }

  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    await User.findByIdAndDelete(id);
  }

  async toggleUserStatus(id, isActive) {
    const user = await User.findById(id).select("+refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.isActive = isActive;
    if (!isActive) {
      user.refreshToken = undefined;
    }
    await user.save();
    return user;
  }

  async forgotPassword(email, clientUrl) {
    const user = await User.findOne({ email });

    if (user && user.isActive) {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">We received a request to reset the password for the Ami Infracon account associated with <strong>${email}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">If you made this request, please click the button below to securely set a new password. This link will expire in 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ami Infracon LLP</p>
        </div>
      `;

      sendEmail({
        to: email,
        subject: "Ami Infracon - Password Reset Request",
        html: emailHtml
      });
    }
  }

  async resetPassword(token, password) {
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    user.password = hashedPassword;
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
  }
}

export const usersService = new UsersService();
