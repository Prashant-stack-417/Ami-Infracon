```yaml
Title: Entity Relationship (ER) Diagram
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🕸️ ER Diagram (Logical)

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ADMIN ||--o{ BLOG : authors
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }|--|| PRODUCT : references
    
    USER {
        ObjectId _id
        String email
        String defaultAddress
    }
    ADMIN {
        ObjectId _id
        String email
        String role
    }
    PRODUCT {
        ObjectId _id
        String sku
        Number stock
    }
    ORDER {
        ObjectId _id
        ObjectId user_id
        String status
        Array statusHistory
    }
```
