```yaml
Title: Infrastructure Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🏗️ Infrastructure Strategy

## 1. Overview
The Ami Infracon platform is designed to be easily deployable on a single Linux Virtual Private Server (VPS) for cost-efficiency during the initial launch, with the ability to scale out horizontally if traffic demands it.

## 2. Server Components
- **Nginx:** Acts as a reverse proxy, SSL terminator (via Let's Encrypt), and serves the static React frontend files.
- **Node.js (PM2 / Docker):** Runs the Express backend API.
- **MongoDB:** The primary database, running either as a managed service (MongoDB Atlas) or locally on the VPS in a container.

## 3. Scale-Up Path
If a single VPS becomes a bottleneck:
1. Move MongoDB to a managed cluster (Atlas).
2. Offload image processing to AWS S3.
3. Spin up multiple Node.js instances behind a Load Balancer.
