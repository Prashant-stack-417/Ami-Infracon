```yaml
Title: API Spec Template
Version: 1.0.0
```

# 🔌 [Resource Name] API

## 1. Endpoints
### `[METHOD] /api/v1/[path]`
- **Auth:** [Public | User | Admin]
- **Body:** `[JSON schema if POST/PUT]`
- **Response:** `ApiResponse` containing `[data shape]`
- **Errors:** `400 Bad Request`, `401 Unauthorized`
