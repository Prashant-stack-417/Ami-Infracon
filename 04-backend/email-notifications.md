```yaml
Title: Email Notifications
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# ✉️ Email Notifications

## 1. Mailer Core
- Transport is handled by `nodemailer`.
- Configured via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

## 2. Triggers
- **Order Placed:** Sends an invoice/confirmation to the buyer.
- **Order Shipped:** Alerts the buyer with tracking details (if applicable).
- **Forgot Password:** Sends a secure reset link with a 15-minute expiring token.

## 3. Templates
- Email bodies are constructed using simple HTML strings. No heavy templating engine (like Handlebars) is used currently to keep dependencies low.
