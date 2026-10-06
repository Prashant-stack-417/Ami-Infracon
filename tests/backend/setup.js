import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from 'vitest';

dotenv.config({ path: '../.env' });

// Ensure required secrets are set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret';
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'test-admin-jwt-secret';
process.env.ADMIN_JWT_REFRESH_SECRET = process.env.ADMIN_JWT_REFRESH_SECRET || 'test-admin-jwt-refresh-secret';

let mongod;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  // Prevent mongoose from leaking between tests
  mongoose.set('strictQuery', false);
  
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
});

// Clear all collections after each test to ensure test isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and stop the server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});
