import { describe, it, expect } from "vitest";
import { validateProductUpdate } from "../../backend/src/middleware/validate.middleware.js";

describe("Zod Validation Middleware - UI Payloads", () => {
  it("should strip unknown fields (like _id, createdAt) instead of throwing an error", () => {
    const req = {
      body: {
        chemicalname: "Test Product",
        price: 100,
        _id: "60b8d295f1d3c2a4f4d2f8e1", // Extra field from UI
        createdAt: "2023-01-01T00:00:00.000Z", // Extra field
        __v: 0 // Extra field
      }
    };
    
    let nextCalled = false;
    let nextError = null;
    
    const next = (err) => {
      nextCalled = true;
      nextError = err;
    };

    const res = {
      status: (code) => ({
        json: (data) => {
          throw new Error(`Should not send response, but got ${code}: ${JSON.stringify(data)}`);
        }
      })
    };

    validateProductUpdate(req, res, next);

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined(); // No error passed to next
    // Verify unknown fields were stripped
    expect(req.body._id).toBeUndefined();
    expect(req.body.createdAt).toBeUndefined();
    expect(req.body.__v).toBeUndefined();
    expect(req.body.chemicalname).toBe("Test Product");
  });
});
