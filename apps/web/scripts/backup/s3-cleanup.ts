import { S3Client, S3ClientConfig, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export interface BackupConfig {
  minioAccessKeyId: string;
  minioSecretAccessKey: string;
  minioBucket: string;
  minioRegion: string;
  minioEndpoint?: string;
  minioForcePathStyle?: boolean;
  backupFilePrefix: string;
  bucketSubfolder?: string;
}

export interface BackupFile {
  Key: string;
  LastModified: Date;
  Size: number;
}

function getMinioClient(config: BackupConfig): S3Client {
  const clientOptions: S3ClientConfig = {
    region: config.minioRegion,
    forcePathStyle: config.minioForcePathStyle,
    credentials: {
      accessKeyId: config.minioAccessKeyId,
      secretAccessKey: config.minioSecretAccessKey,
    },
  };

  if (config.minioEndpoint) {
    clientOptions.endpoint = config.minioEndpoint;
  }

  return new S3Client(clientOptions);
}

async function listBackups(config: BackupConfig): Promise<BackupFile[]> {
  const client = getMinioClient(config);

  const prefix = config.bucketSubfolder
    ? `${config.bucketSubfolder}/${config.backupFilePrefix}`
    : config.backupFilePrefix;

  const command = new ListObjectsV2Command({
    Bucket: config.minioBucket,
    Prefix: prefix,
  });

  const response = await client.send(command);

  return (response.Contents || [])
    .filter((obj) => obj.Key && obj.Key.endsWith('.zip'))
    .map((obj) => ({
      Key: obj.Key!,
      LastModified: obj.LastModified || new Date(),
      Size: obj.Size || 0,
    }))
    .sort((a, b) => b.LastModified.getTime() - a.LastModified.getTime()); // Sort by date desc (newest first)
}

async function deleteOldBackups(backupsToDelete: BackupFile[], config: BackupConfig): Promise<void> {
  if (backupsToDelete.length === 0) return;

  const client = getMinioClient(config);

  const command = new DeleteObjectsCommand({
    Bucket: config.minioBucket,
    Delete: {
      Objects: backupsToDelete.map((backup) => ({ Key: backup.Key })),
      Quiet: false,
    },
  });

  const response = await client.send(command);

  if (response.Deleted && response.Deleted.length > 0) {
    response.Deleted.forEach((deleted) => {
      console.log(`  Deleted: ${deleted.Key}`);
    });
  }

  if (response.Errors && response.Errors.length > 0) {
    console.error("Errors deleting backups:");
    response.Errors.forEach((error) => {
      console.error(`  ${error.Key}: ${error.Message}`);
    });
  }
}

export { listBackups, deleteOldBackups };
