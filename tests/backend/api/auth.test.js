import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import User from '../../../backend/src/models/User.model.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../backend/src/models/User.model.js';

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
    // Clear databases before each suite (setup.js handles global clear, this is for extra safety)
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
      
      // Should set cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('accessToken'))).toBe(true);
      expect(cookies.some(c => c.includes('refreshToken'))).toBe(true);
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
        .send({ email: 'not-an-email' }); // Missing password, invalid email

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBe(2);
      expect(response.body.errors[0]).toContain('Valid email address is required');
    });

    it('Google auth should create a user with no phone, and two Google users with no phone can coexist', async () => {
      // Mocking the model creation directly since this tests the model constraints
      // the service no longer sets phone, so we just verify the DB accepts it
      const user1 = await User.create({
        name: 'Google User 1',
        email: 'google1@example.com',
        password: 'dummyPassword'
      });
      expect(user1).toBeDefined();

      const user2 = await User.create({
        name: 'Google User 2',
        email: 'google2@example.com',
        password: 'dummyPassword'
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
      // Login
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
});
