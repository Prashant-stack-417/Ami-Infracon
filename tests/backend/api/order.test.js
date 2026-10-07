import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import mongoose from 'mongoose';
import Order from '../../../backend/src/models/Order.model.js';
import Product from '../../../backend/src/models/Product.model.js';
import User from '../../../backend/src/models/User.model.js';
import Admin from '../../../backend/src/models/Admin.model.js';
import bcrypt from 'bcryptjs';

describe('Order API', () => {
  let userToken;
  let testUser;
  let testProduct;

  beforeEach(async () => {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'Password123',
      phone: '+919999999999'
    });
    userToken = testUser.generateAccessToken();

    testProduct = await Product.create({
      chemicalname: 'Test Chemical',
      description: 'A chemical for testing',
      category: 'Waterproofing',
      quantity: 10,
      price: 100,
      minOrderQuantity: 1,
      isActive: true
    });
  });

  it('restores stock when order is cancelled', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/order/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '123 Test St',
        items: [{ productId: testProduct._id, quantity: 2 }]
      });

    expect(checkoutRes.status).toBe(201);
    const orderId = checkoutRes.body.data.orders[0]._id;

    // 2. Verify stock decremented
    const pAfterOrder = await Product.findById(testProduct._id);
    expect(pAfterOrder.quantity).toBe(8);

    // 3. Cancel order
    const cancelRes = await request(app)
      .patch(`/api/order/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'cancelled' });

    expect(cancelRes.status).toBe(200);

    // 4. Verify stock restored
    const pAfterCancel = await Product.findById(testProduct._id);
    expect(pAfterCancel.quantity).toBe(10); // It fails here because order.title is not product.chemicalname

    // 5. Cancel twice shouldn't restore again
    await request(app)
      .patch(`/api/order/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'cancelled' });

    const pAfterSecondCancel = await Product.findById(testProduct._id);
    expect(pAfterSecondCancel.quantity).toBe(10);
  });

  it('rolls back completely if one item fails during checkout', async () => {
    // Create an out-of-stock product
    const outOfStockProduct = await Product.create({
      chemicalname: 'Out of Stock Chem',
      description: 'None left',
      category: 'Waterproofing',
      quantity: 0,
      price: 50,
      minOrderQuantity: 1,
      isActive: true
    });

    const checkoutRes = await request(app)
      .post('/api/order/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '123 Test St',
        items: [
          { productId: testProduct._id, quantity: 2 },
          { productId: outOfStockProduct._id, quantity: 1 } // This fails
        ]
      });

    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.message).toContain('Insufficient stock');

    // Verify testProduct stock was NOT decremented
    const p = await Product.findById(testProduct._id);
    expect(p.quantity).toBe(10);

    // Verify no orders were created for the user
    const orders = await Order.find({ userId: testUser._id });
    expect(orders.length).toBe(0);
  });

  it('NEW: unknown fields in checkout body are stripped (not rejected) — request succeeds', async () => {
    const response = await request(app)
      .post('/api/order/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '123 Test St',
        items: [{ productId: testProduct._id, quantity: 1 }],
        hackerField: "Should be stripped"
      });
    // With .strict() removed, unknown fields are stripped — request should succeed
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('can create a single order using POST /api/order/add with productId and no title', async () => {
    const addRes = await request(app)
      .post('/api/order/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '456 Order St',
        productId: testProduct._id,
        quantity: 1
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.data).toHaveProperty('title', testProduct.chemicalname);
    
    // Check stock was decremented
    const p = await Product.findById(testProduct._id);
    expect(p.quantity).toBe(9);
  });

  it('allows legacy orders without productId to change status', async () => {
    // Directly inject a legacy order into the database
    const db = mongoose.connection.db;
    const legacyOrderId = new mongoose.Types.ObjectId();
    await db.collection('orders').insertOne({
      _id: legacyOrderId,
      userId: testUser._id,
      title: 'Legacy Chem',
      quantity: 5,
      address: 'Old Address',
      totalAmount: 1000,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .patch(`/api/order/${legacyOrderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'cancelled' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('cancelled');
  });

  it('prefers adminToken over userToken when both are present (cookie collision)', async () => {
    // 1. Create order
    const checkoutRes = await request(app)
      .post('/api/order/checkout')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        address: '123 Test St',
        items: [{ productId: testProduct._id, quantity: 1 }]
      });

    const orderId = checkoutRes.body.data.orders[0]._id;

    // 2. Create Admin
    const hashedPassword = await bcrypt.hash('AdminPass123', 1);
    const adminUser = await Admin.create({
      name: 'Test Admin',
      email: 'admin.collision@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    const adminToken = adminUser.generateAccessToken();

    // 3. Patch with both tokens
    const response = await request(app)
      .patch(`/api/order/${orderId}`)
      .set('Cookie', [`accessToken=${userToken}`, `adminAccessToken=${adminToken}`]) // Both cookies present
      .send({ status: 'processing' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('processing'); // Only admin can change to processing
  });
});
