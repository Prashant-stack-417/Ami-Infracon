import bcrypt from "bcryptjs";
import Admin from "../models/Admin.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import { ApiError } from "../utils/apiError.js";
import { BCRYPT_SALT_ROUNDS } from "../models/User.model.js";

class AdminService {
  /**
   * Register a new admin
   */
  async registerAdmin({ name, email, password, role, permissions }) {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new ApiError(409, "Admin with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const admin = await Admin.create({
      name: name?.trim(),
      email,
      password: hashedPassword,
      role: role || "admin",
      permissions: permissions || [],
    });

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    return { admin: admin.toJSON(), accessToken, refreshToken };
  }

  /**
   * Login admin
   */
  async loginAdmin(email, password) {
    const admin = await Admin.findOne({ email }).select(
      "+password +loginAttempts +lockUntil"
    );

    if (!admin) {
      // Timing-safe: hash a dummy password so response time is consistent
      await bcrypt.hash("dummy", BCRYPT_SALT_ROUNDS);
      throw new ApiError(401, "Invalid credentials");
    }

    if (admin.isLocked) {
      const minutesLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      throw new ApiError(423, `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`);
    }

    if (!admin.isActive) {
      throw new ApiError(403, "Admin account is deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      throw new ApiError(401, "Invalid credentials");
    }

    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    return { admin: admin.toJSON(), accessToken, refreshToken };
  }

  /**
   * Get current admin profile
   */
  async getCurrentAdmin(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
    return { admin: admin.toJSON() };
  }

  /**
   * Get all admins
   */
  async getAllAdmins() {
    const admins = await Admin.find({})
      .select("-password -loginAttempts -lockUntil")
      .lean();
    return { admins, count: admins.length };
  }

  /**
   * Get admin stats
   */
  async getAdminStats() {
    const [totalUsers, totalProducts, totalOrders, totalAdmins] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Admin.countDocuments(),
    ]);
    return { totalUsers, totalProducts, totalOrders, totalAdmins };
  }

  /**
   * Update admin
   */
  async updateAdmin(id, updateData, actingAdminId) {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    const { name, email, role, permissions, isActive } = updateData;

    // Guard: superadmin cannot demote themselves
    if (actingAdminId && id === actingAdminId.toString()) {
      if (role && role !== admin.role) {
        throw new ApiError(403, "You cannot change your own role");
      }
      if (typeof isActive === "boolean" && !isActive) {
        throw new ApiError(403, "You cannot deactivate your own account");
      }
    }

    // Guard: cannot demote/deactivate if it would remove the last superadmin
    if ((role && role !== "superadmin" && admin.role === "superadmin") ||
        (typeof isActive === "boolean" && !isActive && admin.role === "superadmin")) {
      const superadminCount = await Admin.countDocuments({ role: "superadmin", isActive: true });
      if (superadminCount <= 1) {
        throw new ApiError(403, "Cannot demote or deactivate the last superadmin");
      }
    }

    if (name) admin.name = name.trim();
    if (email) {
      admin.email = email.toLowerCase().trim();
      const adminEmailPattern = /^[a-zA-Z0-9._-]+\.Admin@gmail\.com$/i;
      if (!adminEmailPattern.test(admin.email)) {
        throw new ApiError(400, "updateAdmin: Admin email must be in format: username.Admin@gmail.com");
      }
    }
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (typeof isActive === "boolean") admin.isActive = isActive;

    await admin.save();
    return { admin: admin.toJSON() };
  }

  /**
   * Delete admin
   */
  async deleteAdmin(id, actingAdminId) {
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    // Guard: superadmin cannot delete themselves
    if (actingAdminId && id === actingAdminId.toString()) {
      throw new ApiError(403, "You cannot delete your own account");
    }

    // Guard: cannot delete the last superadmin
    if (admin.role === "superadmin") {
      const superadminCount = await Admin.countDocuments({ role: "superadmin", isActive: true });
      if (superadminCount <= 1) {
        throw new ApiError(403, "Cannot delete the last superadmin");
      }
    }

    await admin.deleteOne();
    return null;
  }
}

export const adminService = new AdminService();
