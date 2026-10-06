```yaml
Title: Recommendation Engine
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 💡 Recommendation Engine

## 1. Related Products
- Displayed at the bottom of the Product Detail page and in the Cart.
- **Algorithm (Phase 1):** Simple category and tag matching.
  - Query: `Product.find({ category: currentProduct.category, _id: { $ne: currentProduct._id } }).limit(4)`

## 2. Future Iterations (Out of Scope for Phase 1)
- Collaborative Filtering ("Users who bought X also bought Y").
- Vector Search embeddings based on technical descriptions.
