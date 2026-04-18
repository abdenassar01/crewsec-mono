# Convex Backup Feature with MinIO

This document explains how to implement and use the automated Convex database backup feature that stores backups in MinIO.

## Quick Start

1. **Set environment variables:**
   ```bash
   export CONVEX_URL=https://your-convex-deployment.convex.cloud
   export CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key
   export MINIO_ACCESS_KEY=minioadmin
   export MINIO_SECRET_KEY=your-secret-key
   export MINIO_BUCKET_NAME=your-bucket
   export MINIO_ENDPOINT=http://your-minio-endpoint:9000
   export MINIO_FORCE_PATH_STYLE=true
   ```

2. **Run your app with backups:**
   ```bash
   npm run build
   npm start
   ```

   That's it! Both your Next.js app AND the backup scheduler run together in one command. No Docker needed.

3. **Manual backup (optional):**
   ```bash
   npm run backup
   ```

## Overview

This backup system provides:
- Automated scheduled backups of your Convex database (including file storage)
- Upload to MinIO (S3-compatible storage)
- Automatic cleanup of old backups (retains N most recent)
- Manual backup on-demand capability

## Architecture

```
scripts/backup/
├── backup.ts          # Core backup logic (dump + upload)
├── s3-cleanup.ts      # List and delete old backups
├── index.ts           # Manual backup entry point
├── scheduler.ts       # Scheduled backup runner
└── util.ts            # MD5 hashing utility
```

## Implementation Steps

### 1. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage filesize
```

### 2. Add Environment Variables

Add these to your `.env` file or deployment configuration:

```bash
# === Convex Configuration ===
CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key

# === MinIO Configuration ===
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=your-bucket-name
MINIO_ENDPOINT=http://your-minio-endpoint:9000
MINIO_REGION=us-east-1
MINIO_FORCE_PATH_STYLE=true

# === Backup Settings (Optional) ===
BACKUP_FILE_PREFIX=backup
BUCKET_SUBFOLDER=backups
SUPPORT_OBJECT_LOCK=false
MAX_BACKUPS=10
BACKUP_INTERVAL_HOURS=5
```

**Notes:**
- `MINIO_ENDPOINT` must include protocol (`http://` or `https://`)
- `MINIO_FORCE_PATH_STYLE=true` is required for MinIO
- `MINIO_REGION` can be any value (MinIO uses it for S3 compatibility)

### 3. File Structure

Ensure your project has this structure:

```
your-project/
├── scripts/
│   └── backup/
│       ├── backup.ts
│       ├── s3-cleanup.ts
│       ├── index.ts
│       ├── scheduler.ts
│       └── util.ts
├── package.json
└── tsconfig.json
```

### 4. Verify NPM Scripts

Your `package.json` should already have these scripts:

```json
{
  "scripts": {
    "start": "npm-run-all --parallel start:web start:backup",
    "start:web": "next start",
    "start:backup": "tsx scripts/backup/scheduler.ts",
    "backup": "tsx scripts/backup/index.ts",
    "backup:scheduler": "tsx scripts/backup/scheduler.ts"
  }
}
```

The backup uses `tsx` which compiles TypeScript on-the-fly, so no build step needed for the backup scripts.

## Usage

### Manual Backup

Run a one-time backup:

```bash
npm run backup
```

### Scheduled Backups

Start the backup scheduler (runs every N hours):

```bash
npm run backup:schedule
```

The scheduler will:
1. Run a backup immediately on startup
2. Run subsequent backups at the configured interval
3. Clean up old backups exceeding `MAX_BACKUPS`

## How It Works

### Backup Process (`backup.ts`)

1. **Export**: Uses `npx convex export` to dump database to a zip file
2. **Upload**: Streams the file to MinIO using S3 SDK
3. **Cleanup**: Removes the local temporary file

### Cleanup Process (`s3-cleanup.ts`)

1. **List**: Retrieves all backups from the bucket, sorted by date (newest first)
2. **Trim**: Keeps only the N most recent backups
3. **Delete**: Removes old backups from MinIO

### Scheduling (`scheduler.ts`)

Uses `setInterval` to run backups at regular intervals. Each cycle:
- Creates a new backup
- Lists existing backups
- Deletes old ones if count exceeds `MAX_BACKUPS`

## Key Implementation Details

### MinIO/S3 Compatibility

The code uses AWS SDK's S3Client but configures it for MinIO:

```typescript
const clientOptions: S3ClientConfig = {
  region: config.minioRegion,
  forcePathStyle: true,  // Required for MinIO
  endpoint: config.minioEndpoint,  // Custom endpoint
  credentials: {
    accessKeyId: config.minioAccessKeyId,
    secretAccessKey: config.minioSecretAccessKey,
  },
};
```

### Backup Configuration Interface

```typescript
interface BackupConfig {
  convexUrl: string;
  convexAdminKey: string;
  minioAccessKeyId: string;
  minioSecretAccessKey: string;
  minioBucket: string;
  minioRegion: string;
  minioEndpoint?: string;
  minioForcePathStyle?: boolean;
  backupFilePrefix?: string;
  bucketSubfolder?: string;
  supportObjectLock?: boolean;
}
```

## Deployment Considerations

### Running with Next.js (No Docker Required)

The backup scheduler runs alongside your Next.js app using `npm-run-all`. No separate services or Docker containers needed.

**Your `package.json` already has the necessary scripts:**

```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:frontend dev:backend",
    "build": "next build",
    "start": "npm-run-all --parallel start:web start:backup",
    "start:web": "next start",
    "start:backup": "tsx scripts/backup/scheduler.ts",
    "backup": "tsx scripts/backup/index.ts"
  }
}
```

**How it works:**
- `npm run build` - Builds your Next.js app
- `npm start` - Runs both Next.js server AND backup scheduler in parallel
- `npm run backup` - Runs a one-time manual backup

**The backup runs as a separate process** but uses the same Node.js runtime and dependencies as your Next.js app. No Docker needed.

### Running in Production

Simply set your environment variables and start your app:

```bash
# Set environment variables
export CONVEX_URL=https://your-convex-deployment.convex.cloud
export CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key
export MINIO_ACCESS_KEY=minioadmin
export MINIO_SECRET_KEY=your-secret-key
export MINIO_BUCKET_NAME=your-bucket
export MINIO_ENDPOINT=http://your-minio-endpoint:9000
export MINIO_FORCE_PATH_STYLE=true

# Build and run
npm run build
npm start
```

That's it! Both your Next.js app and backup scheduler will run together.

### Optional: Using Cron Instead of Internal Scheduler

If you prefer cron over the internal scheduler:

1. **Don't run the scheduler:**
   ```bash
   npm start:web  # Only runs Next.js, no backup scheduler
   ```

2. **Add a cron job:**
   ```cron
   # Run backup every 6 hours
   0 */6 * * * cd /path/to/app && npm run backup
   ```

### Monitoring

For production, consider:
- Add logging to a file or service (e.g., Sentry, CloudWatch)
- Set up alerts on backup failures
- Monitor MinIO bucket for new backups

### Example: Production Deployment (Vercel/Node)

```bash
# On your server
git pull origin main
npm install
npm run build

# Start with PM2 (example)
pm2 start npm --name "app" -- start
pm2 save
pm2 startup
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication errors | Verify `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` |
| Endpoint not reachable | Check `MINIO_ENDPOINT` includes protocol (`http://` or `https://`) |
| Bucket not found | Ensure bucket exists in MinIO before first backup |
| Upload fails | Verify `MINIO_FORCE_PATH_STYLE=true` for MinIO |

## Security Notes

- Never commit `.env` files with credentials
- Use separate MinIO credentials with minimal permissions
- Consider enabling object locking for WORM (Write Once Read Many) compliance
- Rotate access keys regularly
