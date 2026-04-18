import { backup } from "./backup.js";
import { listBackups, deleteOldBackups } from "./s3-cleanup.js";

// Load configuration from environment variables
const config = {
  convexUrl: process.env.CONVEX_URL || process.env.CONVEX_SELF_HOSTED_URL!,
  convexAdminKey: process.env.CONVEX_SELF_HOSTED_ADMIN_KEY!,
  minioAccessKeyId: process.env.MINIO_ACCESS_KEY!,
  minioSecretAccessKey: process.env.MINIO_SECRET_KEY!,
  minioBucket: process.env.MINIO_BUCKET_NAME!,
  minioRegion: process.env.MINIO_REGION || "us-east-1",
  minioEndpoint: process.env.MINIO_ENDPOINT,
  minioForcePathStyle: process.env.MINIO_FORCE_PATH_STYLE === "true",
  backupFilePrefix: process.env.BACKUP_FILE_PREFIX || "crewsec-backup",
  bucketSubfolder: process.env.BUCKET_SUBFOLDER,
  supportObjectLock: process.env.SUPPORT_OBJECT_LOCK === "true",
  maxBackups: parseInt(process.env.MAX_BACKUPS || "10", 10),
  backupIntervalHours: parseInt(process.env.BACKUP_INTERVAL_HOURS || "5", 10),
};

function validateEnv() {
  if (!config.convexUrl || !config.convexAdminKey) {
    console.error("Error: CONVEX_URL and CONVEX_SELF_HOSTED_ADMIN_KEY are required");
    return false;
  }

  if (!config.minioAccessKeyId || !config.minioSecretAccessKey || !config.minioBucket) {
    console.error("Error: MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_BUCKET_NAME are required");
    return false;
  }

  return true;
}

async function runBackup() {
  console.log(`\n=== Starting backup at ${new Date().toISOString()} ===`);

  try {
    // Run the backup
    await backup(config);

    // Clean up old backups
    console.log("\nCleaning up old backups...");
    const backups = await listBackups(config);
    console.log(`Found ${backups.length} backups`);

    if (backups.length > config.maxBackups) {
      const toDelete = backups.slice(config.maxBackups);
      console.log(`Deleting ${toDelete.length} old backup(s)...`);
      await deleteOldBackups(toDelete, config);
      console.log(`Kept last ${config.maxBackups} backups`);
    } else {
      console.log(`Backup count (${backups.length}) is within limit (${config.maxBackups})`);
    }

    console.log("=== Backup completed successfully ===\n");
  } catch (error) {
    console.error("=== Backup failed ===");
    console.error(error);
  }
}

function startScheduler() {
  const intervalMs = config.backupIntervalHours * 60 * 60 * 1000;

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    CONVEX BACKUP SCHEDULER                     ║
╠════════════════════════════════════════════════════════════════╣
║  Backup Interval: ${config.backupIntervalHours} hours                                  ║
║  Max Backups: ${config.maxBackups}                                      ║
║  Prefix: ${config.backupFilePrefix}                               ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // Run backup on startup
  runBackup();

  // Schedule subsequent backups
  setInterval(() => {
    runBackup();
  }, intervalMs);

  console.log(`Scheduler started. Next backup in ${config.backupIntervalHours} hour(s)...`);
  console.log("Press Ctrl+C to stop\n");
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!validateEnv()) {
    process.exit(1);
  }
  startScheduler();
}

export { runBackup, config as backupConfig };
