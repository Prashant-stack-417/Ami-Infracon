```yaml
Title: Monitoring
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📈 Monitoring

## 1. Health Checks
The backend provides a basic health check endpoint at `/api/healthCheck`.
- This endpoint returns a 200 OK if the Node process is running.
- *Note:* It should be updated to also verify the MongoDB connection state via `mongoose.connection.readyState`.

## 2. Application Monitoring (Planned)
- To monitor uptime and API latency, integration with a service like Datadog, New Relic, or a simple UptimeRobot ping is required for production.
- **PM2:** If deploying on a bare VPS, PM2 will be used to monitor the Node.js process, restart it on crashes, and provide basic CPU/Memory metrics.
