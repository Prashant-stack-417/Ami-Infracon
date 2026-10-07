import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import Product from '../../../backend/src/models/Product.model.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../../backend/src/models/User.model.js';
import { productCreatePayload, productEditPayload } from '../../fixtures/uiPayloads.js';

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

    const hashedPassword = await bcrypt.hash(testAdmin.password, BCRYPT_SALT_ROUNDS);
    await Admin.create({
      name: testAdmin.name,
      email: testAdmin.email,
      password: hashedPassword,
      role: "admin",
    });

    const res = await request(app).post('/api/admin/login').send({
      email: testAdmin.email,
      password: testAdmin.password,
    });
    
    const cookies = res.headers['set-cookie'];
    adminToken = cookies.find(c => c.startsWith('adminAccessToken=')).split(';')[0].split('=')[1];
  });

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
        .send(productCreatePayload);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should create product with exact UI payload (productCreatePayload)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productCreatePayload);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty('chemicalname', productCreatePayload.chemicalname);
      // Verify price stored as number, not string
      expect(typeof response.body.data.product.price).toBe('number');
      expect(response.body.data.product.price).toBe(1499);
    });

    it('NEW: unknown fields are stripped (not rejected) — request succeeds and extra field is not persisted', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...productCreatePayload,
          hackerField: "I should be stripped",
          _id: "fake-id-attempt",
        });
      
      // With .strict() removed, unknown fields are stripped — request should succeed
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // Extra field must NOT appear in the stored document
      expect(response.body.data.product.hackerField).toBeUndefined();
      expect(response.body.data.product._id).not.toBe("fake-id-attempt");
    });

    it('rejects product with empty string price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: "" });
      expect(response.status).toBe(400);
    });

    it('rejects product with null price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: null });
      expect(response.status).toBe(400);
    });

    it('rejects product with non-numeric string price ("abc")', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: "abc" });
      expect(response.status).toBe(400);
    });

    it('rejects product with negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: -5 });
      expect(response.status).toBe(400);
    });

    it('accepts numeric string price ("1499")', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: "1499" });
      expect(response.status).toBe(201);
      expect(response.body.data.product.price).toBe(1499);
    });

    it('accepts numeric price (1499)', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, price: 1499 });
      expect(response.status).toBe(201);
      expect(response.body.data.product.price).toBe(1499);
    });
  });

  describe('PUT /api/products/:id (stock lost-update fix)', () => {
    it('PUT should NOT overwrite quantity — stock edit sends quantity but it must be ignored', async () => {
      // Create product with quantity 50
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...productCreatePayload, quantity: 50 });
      const productId = createRes.body.data.product._id;

      // PUT with productEditPayload which includes quantity: 100
      // The server must ignore it — stock should remain 50
      const updateRes = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productEditPayload);

      expect(updateRes.status).toBe(200);
      // Stock must remain 50, NOT be overwritten to 100
      expect(updateRes.body.data.product.quantity).toBe(50);
      // Other fields should be updated
      expect(updateRes.body.data.product.chemicalname).toBe(productEditPayload.chemicalname);
      expect(updateRes.body.data.product.price).toBe(productEditPayload.price);
    });
  });
});
