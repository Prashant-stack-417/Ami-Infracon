import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { app } from '../../../backend/src/app.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import Blog from '../../../backend/src/models/Blog.model.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../backend/src/models/User.model.js';
import path from 'path';
import fs from 'fs';

describe('Blog API', () => {
  let adminToken;
  const testAdmin = {
    name: 'Blog Admin',
    email: 'blog.admin@gmail.com',
    password: 'AdminPassword123!',
  };

  const maliciousFilePath = path.join(process.cwd(), 'malicious.png');

  beforeEach(async () => {
    await Admin.deleteMany({});
    await Blog.deleteMany({});

    const hashedPassword = await bcrypt.hash(testAdmin.password, BCRYPT_SALT_ROUNDS);
    await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email,
      password: hashedPassword,
      role: 'admin',
    });

    const res = await request(app).post('/api/admin/login').send({
      email: testAdmin.email,
      password: testAdmin.password,
    });
    
    const cookies = res.headers['set-cookie'];
    adminToken = cookies.find(c => c.startsWith('adminAccessToken=')).split(';')[0].split('=')[1];

    // Create a malicious file pretending to be a PNG
    fs.writeFileSync(maliciousFilePath, 'console.log("I am actually JS code!");');
  });

  afterAll(() => {
    if (fs.existsSync(maliciousFilePath)) {
      fs.unlinkSync(maliciousFilePath);
    }
  });

  it('rejects a fake PNG file using magic bytes validation', async () => {
    const response = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Test Blog')
      .field('content', 'Test content')
      .attach('coverImage', maliciousFilePath);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Not a valid image');
  });
});
