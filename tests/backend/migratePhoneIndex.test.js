import mongoose from "mongoose";
import { describe, it, expect } from "vitest";
import User from "../../backend/src/models/User.model.js";

describe("Phone Index Migration", () => {
  it("should drop legacy phone_1 index", async () => {
    // 1. Manually create the legacy index
    await User.collection.createIndex({ phone: 1 }, { name: "phone_1", unique: true });
    
    // 2. Verify it exists
    let indexes = await User.collection.indexes();
    let phoneIndex = indexes.find((idx) => idx.name === "phone_1");
    expect(phoneIndex).toBeDefined();

    // 3. Drop it (simulating migration logic)
    await User.collection.dropIndex("phone_1");
    await User.syncIndexes();

    // 4. Verify it was recreated with sparse: true
    indexes = await User.collection.indexes();
    phoneIndex = indexes.find((idx) => idx.name === "phone_1");
    expect(phoneIndex).toBeDefined();
    expect(phoneIndex.sparse).toBe(true);
  });
});
