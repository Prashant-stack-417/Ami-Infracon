```yaml
Title: QA Checklists
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ✅ QA Checklists

## 1. Pre-Release Checklist (Manual)
Since automated testing covers the happy paths, use this checklist for exploratory testing before a release.

### Authentication
- [ ] User can register via Email.
- [ ] User can login via Email.
- [ ] User can login via Google OAuth.
- [ ] Invalid passwords throw a visible error toast.
- [ ] JWT expiration logs the user out smoothly.

### Shopping Flow
- [ ] Changing quantity in the cart updates the total instantly.
- [ ] Emptying the cart shows the Empty State illustration.
- [ ] Address updates persist across sessions.

### Admin Tools
- [ ] CSV upload accurately updates existing SKU stock levels.
- [ ] Changing an order status instantly reflects on the User's timeline (requires refreshing the user view).
- [ ] Uploading a massive image (>5MB) is handled gracefully by `multer`/`sharp`.
