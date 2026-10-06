```yaml
Title: Authorization (RBAC)
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🛡️ Authorization

## 1. Middleware Strategy
The backend uses layered middleware:
- `verifyJWT`: Extracts Bearer token, decodes it, attaches `req.user`.
- `isAdmin`: Ensures `req.user.collection === 'Admin'`.
- `isSuperAdmin`: Ensures `req.user.role === 'superadmin'`.

## 2. Example Route Configuration
```javascript
import { verifyJWT, isAdmin, isSuperAdmin } from '../middleware/auth.middleware.js';

// User can view their own orders
router.route('/my-orders').get(verifyJWT, getMyOrders);

// Any Admin can update an order status
router.route('/admin/orders/:id').put(verifyJWT, isAdmin, updateOrderStatus);

// Only SuperAdmin can view global revenue analytics
router.route('/admin/analytics/revenue').get(verifyJWT, isSuperAdmin, getRevenueAnalytics);
```
