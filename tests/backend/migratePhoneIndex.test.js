import { describe, it, expect } from "vitest";
import User from "../../backend/src/models/User.model.js";
import { migratePhoneIndex } from "../../backend/src/scripts/migratePhoneIndex.js";

describe("migratePhoneIndex()", () => {
  /**
   * Helper: get the phone_1 index definition from the live collection
   */
  async function getPhoneIndex() {
    const indexes = await User.collection.indexes();
    return indexes.find((idx) => idx.name === "phone_1");
  }

  /**
   * Helper: reset to a legacy non-sparse phone_1 index.
   * Drops whatever exists and creates the old-style non-sparse unique index.
   */
  async function createLegacyIndex() {
    try { await User.collection.dropIndex("phone_1"); } catch { /* doesn't exist yet */ }
    await User.collection.createIndex(
      { phone: 1 },
      { name: "phone_1", unique: true, sparse: false }
    );
  }

  it("--apply: replaces legacy non-sparse index with a sparse one", async () => {
    await createLegacyIndex();

    // Verify legacy index is non-sparse
    let idx = await getPhoneIndex();
    expect(idx).toBeDefined();
    expect(idx.sparse).toBeFalsy(); // legacy is NOT sparse

    // Run migration with apply:true
    const result = await migratePhoneIndex({ apply: true });
    expect(result.action).toBe("dropped");

    // After migration, phone_1 should exist AND be sparse (recreated by syncIndexes)
    idx = await getPhoneIndex();
    expect(idx).toBeDefined();
    expect(idx.sparse).toBe(true);
  });

  it("skips if the phone_1 index is already sparse", async () => {
    // Ensure we have a sparse index (as syncIndexes would create)
    try { await User.collection.dropIndex("phone_1"); } catch { /* ok */ }
    await User.syncIndexes();

    const result = await migratePhoneIndex({ apply: true });
    expect(["already-sparse", "skipped"]).toContain(result.action);
  });

  it("dry-run: does NOT modify the index", async () => {
    await createLegacyIndex();

    // Run migration WITHOUT apply flag
    const result = await migratePhoneIndex({ apply: false });
    expect(result.action).toBe("dry-run");

    // Index should still be non-sparse (dry-run made no changes)
    const idx = await getPhoneIndex();
    expect(idx).toBeDefined();
    expect(idx.sparse).toBeFalsy();
  });

  it("after --apply, two users without a phone (Google users) can coexist", async () => {
    // Run migration
    await migratePhoneIndex({ apply: true });

    // Create two users without phone numbers
    await User.deleteMany({ email: { $in: ["g1@test.com", "g2@test.com"] } });

    const u1 = await User.create({
      name: "Google User 1",
      email: "g1@test.com",
      password: "Dummy1Pass!",
      isGoogleUser: true,
    });
    expect(u1._id).toBeDefined();

    const u2 = await User.create({
      name: "Google User 2",
      email: "g2@test.com",
      password: "Dummy2Pass!",
      isGoogleUser: true,
    });
    expect(u2._id).toBeDefined();

    // Cleanup
    await User.deleteMany({ email: { $in: ["g1@test.com", "g2@test.com"] } });
  });
});
