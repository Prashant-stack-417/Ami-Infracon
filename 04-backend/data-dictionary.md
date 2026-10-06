```yaml
Title: Data Dictionary
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📖 Data Dictionary

## 1. Order Status Enum
- `pending`: Order placed, waiting for offline payment confirmation.
- `processing`: Payment confirmed, warehouse is packing.
- `shipped`: Handed over to logistics partner.
- `delivered`: Reached the customer.
- `cancelled`: Order aborted.

## 2. Admin Roles Enum
- `admin`: Can manage products, orders, and write blogs. Cannot see global analytics or create other admins.
- `superadmin`: God mode. Full access.

## 3. Address Object (Embedded)
```json
{
  "street": "String",
  "city": "String",
  "state": "String",
  "pincode": "String",
  "country": "String"
}
```
