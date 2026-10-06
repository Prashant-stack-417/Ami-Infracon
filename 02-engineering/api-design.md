```yaml
Title: API Design
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📡 API Design Standards

## 1. RESTful Principles
- APIs must be resource-oriented.
- Use proper HTTP methods:
  - `GET` to retrieve a resource.
  - `POST` to create a new resource.
  - `PUT` to update a resource entirely.
  - `PATCH` to update a resource partially.
  - `DELETE` to remove a resource.

## 2. Response Wrapper
All endpoints must return data wrapped in the `ApiResponse` schema:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human readable message",
  "data": { ... }
}
```

## 3. Status Codes
- `200 OK`: Successful request.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or malformed syntax.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: User lacks necessary role (e.g., User trying to access Admin route).
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled backend exception.
