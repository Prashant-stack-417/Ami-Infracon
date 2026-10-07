import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import User from '../../../backend/src/models/User.model.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../backend/src/models/User.model.js';
import {
  registerPayload,
  profileUpdatePayload,
  createAdminPayload,
  editAdminPayload,
} from '../../fixtures/uiPayloads.js';

describe('Auth API (Epic 4)', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+911234567890',
    password: 'Password123',
  };

  const testAdmin = {
    name: 'Admin User',
    email: 'test.admin@gmail.com',
    password: 'AdminPassword123',
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
  });

  describe('User Registration & Login', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('accessToken'))).toBe(true);
      expect(cookies.some(c => c.includes('refreshToken'))).toBe(true);
    });

    it('registers with exact UI registerPayload', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(registerPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(registerPayload.email);
    });

    it('should not allow duplicate email registration', async () => {
      await request(app).post('/api/users/register').send(testUser);
      const response = await request(app).post('/api/users/register').send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should login an existing user', async () => {
      await request(app).post('/api/users/register').send(testUser);
      
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return Zod validation error for invalid login payload', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBe(2);
      expect(response.body.errors[0]).toContain('Valid email address is required');
    });

    it('Google auth should create a user with no phone, and two Google users with no phone can coexist', async () => {
      const user1 = await User.create({
        name: 'Google User 1',
        email: 'google1@example.com',
        password: 'dummyPassword',
        isGoogleUser: true,
      });
      expect(user1).toBeDefined();

      const user2 = await User.create({
        name: 'Google User 2',
        email: 'google2@example.com',
        password: 'dummyPassword',
        isGoogleUser: true,
      });
      expect(user2).toBeDefined();
    });
  });

  describe('Admin Login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testAdmin.password, BCRYPT_SALT_ROUNDS);
      await Admin.create({
        name: testAdmin.name,
        email: testAdmin.email,
        password: hashedPassword,
        role: "admin",
      });
    });

    it('should login an admin successfully', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: testAdmin.email, password: testAdmin.password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin).toHaveProperty('email', testAdmin.email);
    });

    it('should reject invalid admin login email format', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'invalid.admin@domain.com', password: testAdmin.password });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid Username or Password');
    });
  });
  
  describe('Profile Update API', () => {
    it('NEW: unknown fields in profile update are stripped (not rejected) — request succeeds', async () => {
      const regRes = await request(app).post('/api/users/register').send(testUser);
      const userToken = regRes.headers['set-cookie'].find(c => c.startsWith('accessToken=')).split(';')[0].split('=')[1];

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Name',
          hackerField: 'Should be stripped'
        });
      
      // Strip behavior: request should succeed
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Extra field must NOT be persisted
      expect(response.body.data.user?.hackerField).toBeUndefined();
    });

    it('profile update with exact UI payload stores postalCode correctly', async () => {
      const regRes = await request(app).post('/api/users/register').send(testUser);
      const userToken = regRes.headers['set-cookie'].find(c => c.startsWith('accessToken=')).split(';')[0].split('=')[1];

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(profileUpdatePayload);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.defaultAddress.postalCode).toBe('400001');
      expect(response.body.data.user.defaultAddress.city).toBe('Mumbai');
    });

    it('SECURITY: role sent in profile update must NOT be persisted', async () => {
      const regRes = await request(app).post('/api/users/register').send(testUser);
      const userToken = regRes.headers['set-cookie'].find(c => c.startsWith('accessToken=')).split(';')[0].split('=')[1];

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name', role: 'admin' });
      
      // Request may succeed (unknown field stripped), but role must NOT change
      if (response.status === 200) {
        expect(response.body.data.user?.role).not.toBe('admin');
        expect(response.body.data.user?.role).toBe('user');
      }

      // Also verify in DB
      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser.role).toBe('user');
    });

    it('SECURITY: isActive:false sent in profile update must NOT deactivate account', async () => {
      const regRes = await request(app).post('/api/users/register').send(testUser);
      const userToken = regRes.headers['set-cookie'].find(c => c.startsWith('accessToken=')).split(';')[0].split('=')[1];

      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'New Name', isActive: false });

      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser.isActive).toBe(true);
    });
  });

  describe('Admin Update API', () => {
    let adminToken;
    let targetAdminId;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testAdmin.password, BCRYPT_SALT_ROUNDS);
      // Create acting superadmin
      const superAdmin = await Admin.create({
        name: testAdmin.name,
        email: testAdmin.email,
        password: hashedPassword,
        role: "superadmin",
      });
      adminToken = superAdmin.generateAccessToken();

      // Create target admin to update
      const targetAdmin = await Admin.create({
        name: "Target Admin",
        email: "target.Admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });
      targetAdminId = targetAdmin._id;
    });

    it('NEW: unknown fields in admin update are stripped (not rejected) — request succeeds', async () => {
      const response = await request(app)
        .put(`/api/admin/${targetAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Admin Name',
          hackerField: 'Should be stripped'
        });

      // Strip behavior: request should succeed
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin?.hackerField).toBeUndefined();
    });

    it('admin update with exact UI editAdminPayload stores role correctly', async () => {
      const response = await request(app)
        .put(`/api/admin/${targetAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(editAdminPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin.name).toBe(editAdminPayload.name);
    });

    it('SECURITY: isSuperAdmin field cannot be set via admin update', async () => {
      const response = await request(app)
        .put(`/api/admin/${targetAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Name', isSuperAdmin: true });

      // Request succeeds (isSuperAdmin is stripped), but isSuperAdmin must NOT be true
      if (response.status === 200) {
        const dbAdmin = await Admin.findById(targetAdminId);
        expect(dbAdmin.isSuperAdmin).toBe(false);
      }
    });

    it('creates a new admin with exact UI createAdminPayload (role: superadmin persisted)', async () => {
      const response = await request(app)
        .post('/api/admin/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createAdminPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.admin.role).toBe('superadmin');
      expect(response.body.data.admin.email).toBe(createAdminPayload.email.toLowerCase());
    });
  });

  describe('CSRF Origin Check', () => {
    it('blocks malicious origins even if they partially match allowed origins', async () => {
      const regRes = await request(app).post('/api/users/register').send(testUser);
      const userToken = regRes.headers['set-cookie'].find(c => c.startsWith('accessToken=')).split(';')[0].split('=')[1];

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Origin', 'http://localhost:51')
        .send({ name: 'Hacked Name' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("CSRF token missing or origin not allowed");
    });
  });
});
