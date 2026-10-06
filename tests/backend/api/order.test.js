import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../../backend/src/app.js';
import Order from '../../../backend/src/models/Order.model.js';
import Product from '../../../backend/src/models/Product.model.js';
import User from '../../../backend/src/models/User.model.js';

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
      password: 'Password123'
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
});
