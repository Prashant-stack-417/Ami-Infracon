```yaml
Title: User Journeys
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
Dependencies: 01-product/user-personas.md
Related Documents: 
  - 01-product/prd.md
```

# 🗺️ User Journeys

## 1. B2B Buyer Journey: Placing an Order
1. **Discovery:** User lands on the homepage, navigates to the Product Catalog.
2. **Evaluation:** User views a product detail page, reads specifications, and views "Related Products".
3. **Cart:** User adds items to the cart in bulk quantities.
4. **Checkout:** User logs in (Google OAuth or Email), selects their `defaultAddress`, and confirms the order.
5. **Post-Purchase:** User receives a confirmation email. Days later, they log in to view the visual Order Timeline for delivery status.

## 2. Admin Journey: Managing Inventory
1. **Login:** Admin logs in via the secure Admin Login portal.
2. **Alerts:** Admin sees a `lowStockThreshold` alert on the Dashboard for a fast-moving chemical.
3. **Update:** Admin uses the CSV Bulk Upload tool to instantly update stock levels across 50 products.
4. **Verification:** Admin checks the Product Management view to confirm stock badges show "In Stock".

## 3. Admin Journey: Fulfilling an Order
1. **Notification:** Admin checks the Order Management tab for new pending orders.
2. **Processing:** Admin verifies payment (offline) and updates the order status to "Processing", appending a status note.
3. **Dispatch:** Admin updates the status to "Shipped". The buyer's timeline updates instantly in their dashboard.
