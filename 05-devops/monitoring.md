```yaml
Title: DevOps Monitoring
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 📈 DevOps Monitoring

## 1. Server Metrics
- **Resource Usage:** CPU, RAM, and Disk space must be monitored to ensure the VPS is not maxing out, particularly during heavy CSV bulk uploads.
- **Tooling:** Basic monitoring can be achieved via the hosting provider's dashboard (e.g., DigitalOcean, AWS CloudWatch) or standard Linux tools (`htop`, `ncdu`).

## 2. Application Logs
- **PM2 / Docker Logs:** If running without Docker, PM2 handles log rotation. If using Docker, container logs are accessed via `docker logs -f backend`.
- **Log Rotation:** Docker daemon must be configured with `max-size` and `max-file` limits to prevent log files from exhausting server disk space.

## 3. Uptime Alerts
- A service like UptimeRobot should ping `/api/healthCheck` every 5 minutes. If it fails, an email or Slack alert is sent to the Admin.
