import { backup } from "./backup.js";

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
};

async function main() {
  console.log("Starting Convex backup...");

  // Validate required environment variables
  if (!config.convexUrl || !config.convexAdminKey) {
    console.error("Error: CONVEX_URL and CONVEX_SELF_HOSTED_ADMIN_KEY are required");
    process.exit(1);
  }

  if (!config.minioAccessKeyId || !config.minioSecretAccessKey || !config.minioBucket) {
    console.error("Error: MINIO_ACCESS_KEY, MINIO_SECRET_KEY, and MINIO_BUCKET_NAME are required");
    process.exit(1);
  }

  try {
    await backup(config);
    console.log("Backup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error while running backup:", error);
    process.exit(1);
  }
}

main();
