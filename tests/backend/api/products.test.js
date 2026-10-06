import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import Product from '../../../backend/src/models/Product.model.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../backend/src/models/User.model.js';

describe('Products API & RBAC (Epic 4)', () => {
  const testAdmin = {
    name: 'Admin User',
    email: 'product.admin@gmail.com',
    password: 'AdminPassword123',
  };

  let adminToken;

  beforeEach(async () => {
    await Admin.deleteMany({});
    await Product.deleteMany({});

    // Create admin via Mongoose
    const hashedPassword = await bcrypt.hash(testAdmin.password, BCRYPT_SALT_ROUNDS);
    await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email,
      password: hashedPassword,
      role: "admin",
    });

    // Login to get token
    const res = await request(app).post('/api/admin/login').send({
      email: testAdmin.email,
      password: testAdmin.password,
    });
    
    const cookies = res.headers['set-cookie'];
    adminToken = cookies.find(c => c.startsWith('adminAccessToken=')).split(';')[0].split('=')[1];
  });

  const sampleProduct = {
    chemicalname: "Test Admixture",
    description: "High performance concrete admixture",
    price: 1500,
    category: "Concrete Admixture",
    quantity: 100,
    sku: "TEST-001"
  };

  describe('GET /api/products', () => {
    it('should allow public access to list products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    it('should reject product creation if no token provided', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(sampleProduct);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow admin to create product with valid token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleProduct);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty('chemicalname', sampleProduct.chemicalname);
    });

    it('should reject product creation with unknown fields (strict validation)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...sampleProduct,
          hackerField: "I should be rejected"
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors[0]).toContain("Unrecognized key: \"hackerField\"");
    });
  });
});
