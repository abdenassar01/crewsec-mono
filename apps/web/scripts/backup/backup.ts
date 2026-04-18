import { exec } from "child_process";
import { S3Client, S3ClientConfig, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream, unlinkSync, statSync } from "fs";
import { filesize } from "filesize";
import path from "path";
import os from "os";

export interface BackupConfig {
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

const uploadToMinio = async ({ name, filePath, config }: {
  name: string;
  filePath: string;
  config: BackupConfig;
}) => {
  console.log("Uploading backup to MinIO...");

  const bucket = config.minioBucket;

  const clientOptions: S3ClientConfig = {
    region: config.minioRegion,
    forcePathStyle: config.minioForcePathStyle,
    credentials: {
      accessKeyId: config.minioAccessKeyId,
      secretAccessKey: config.minioSecretAccessKey,
    },
  };

  if (config.minioEndpoint) {
    console.log(`Using MinIO endpoint: ${config.minioEndpoint}`);
    clientOptions.endpoint = config.minioEndpoint;
  }

  if (config.bucketSubfolder) {
    name = config.bucketSubfolder + "/" + name;
  }

  let params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: name,
    Body: createReadStream(filePath),
  };

  if (config.supportObjectLock) {
    console.log("MD5 hashing file...");
    const { createMD5 } = await import("./util.js");
    const md5Hash = await createMD5(filePath);
    console.log("Done hashing file");
    params.ContentMD5 = Buffer.from(md5Hash, 'hex').toString('base64');
  }

  const client = new S3Client(clientOptions);

  await new Upload({
    client,
    params: params
  }).done();

  console.log("Backup uploaded to MinIO...");
};

const dumpToFile = async (filePath: string, config: BackupConfig) => {
  console.log("Dumping convex backup to file...");

  return new Promise<void>((resolve, reject) => {
    const convexUrl = config.convexUrl;
    const adminKey = config.convexAdminKey;

    const exportCommand = `npx convex export --url ${convexUrl} --admin-key "${adminKey}" --path "${filePath}" --include-file-storage`;

    exec(exportCommand, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error, stderr: stderr.trimEnd() });
        return;
      }

      if (stderr != "") {
        console.log({ stderr: stderr.trimEnd() });
      }

      console.log("Backup filesize:", filesize(statSync(filePath).size));
      resolve();
    });
  });
};

export const backup = async (config: BackupConfig) => {
  console.log("Initiating DB backup...");

  const date = new Date().toISOString();
  const timestamp = date.replace(/[:.]+/g, '-');
  const filename = `${config.backupFilePrefix || 'backup'}-${timestamp}.zip`;
  const filepath = path.join(os.tmpdir(), filename);

  try {
    await dumpToFile(filepath, config);
    await uploadToMinio({ name: filename, filePath: filepath, config });
    unlinkSync(filepath);
    console.log("DB backup complete...");
  } catch (error) {
    // Clean up file on error
    try {
      unlinkSync(filepath);
    } catch {}
    throw error;
  }
};
