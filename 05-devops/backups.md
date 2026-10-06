```yaml
Title: Backup Strategy
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 💾 Backup Strategy

## 1. Database Backups
- If using MongoDB Atlas, daily automated backups are handled by the managed service.
- If running MongoDB locally on a VPS, a daily `cron` job must execute `mongodump`, compress the output, and push it to an off-site storage bucket (e.g., AWS S3) using the AWS CLI.

## 2. Uploads Backups
- The `backend/public/uploads` directory contains critical product images and blog assets.
- A weekly `rsync` or `aws s3 sync` job must mirror this directory to an off-site backup location to prevent data loss in the event of a catastrophic server failure.

## 3. Retention Policy
- Retain daily database backups for 7 days.
- Retain weekly database backups for 4 weeks.
- Retain monthly database backups for 1 year.
