import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Request } from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config();

/**
 * Configuration interface for AWS S3
 */
interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string; // e.g. "us-east-1", "eu-west-1"
  bucketName: string; // The name of your S3 bucket
  sessionToken?: string; // Optional session token for temporary credentials
}

/**
 * Upload options for files
 */
interface UploadOptions {
  path?: string; // Path within the bucket (folder structure)
  acl?: string; // Access control (default: 'private')
  contentType?: string; // MIME type of the file
  metadata?: Record<string, string>; // Additional metadata
  tags?: Record<string, string>; // S3 object tags
  storageClass?: string; // Storage class (STANDARD, REDUCED_REDUNDANCY, etc.)
  serverSideEncryption?: string; // Server-side encryption (AES256, aws:kms)
  cacheControl?: string; // Cache control header
}

/**
 * Result of file upload
 */
interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  etag?: string;
  error?: Error;
}

/**
 * AWS S3 file uploader utility for Express.js
 */
class S3Uploader {
  private s3: S3;
  private bucketName: string;
  private region: string;

  /**
   * Create a new S3Uploader instance
   * @param config AWS S3 configuration
   */
  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
    this.region = config.region;

    this.s3 = new S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      sessionToken: config.sessionToken,
      signatureVersion: "v4",
    });
  }

  /**
   * Upload a file from a local path to AWS S3
   * @param filePath Path to the local file
   * @param fileName Name to save the file as in S3
   * @param options Upload options
   * @returns Promise with upload result
   */
  async uploadFile(
    filePath: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Generate a key for the file
      const fileKey = options.path
        ? `${options.path.replace(/^\/|\/$/g, "")}/${uuidv4()}`
        : uuidv4();

      // Read the file
      const fileContent = fs.readFileSync(filePath);

      // Get content type
      const contentType = options.contentType || this.getMimeType(filePath);
      // Prepare upload parameters
      const params: S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: fileContent,
        ACL: options.acl || "private",
        ContentType: contentType,
        Metadata: options.metadata,
        StorageClass: options.storageClass,
        ServerSideEncryption: options.serverSideEncryption,
        CacheControl: options.cacheControl,
      };

      // Add tags if provided
      if (options.tags) {
        const tagSet = Object.entries(options.tags)
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        params.Tagging = tagSet;
      }

      const result = await this.s3.upload(params).promise();

      return {
        success: true,
        url: result.Location,
        key: result.Key,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Upload a buffer to AWS S3
   * @param buffer The buffer to upload
   * @param fileName Name to save the file as
   * @param options Upload options
   * @returns Promise with upload result
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Generate a key for the file
      const fileKey = options.path
        ? `${options.path.replace(/^\/|\/$/g, "")}/${uuidv4()}`
        : uuidv4();

      // Sanitize metadata to ensure only ASCII characters
      const sanitizedMetadata: { [key: string]: string } = {};
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          // Remove or replace non-ASCII characters
          const sanitizedKey = key.replace(/[^\x20-\x7E]/g, ""); // Keep only printable ASCII
          const sanitizedValue = value
            .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII characters
            .replace(/[\r\n\t]/g, " ") // Replace line breaks and tabs with spaces
            .trim(); // Remove leading/trailing whitespace

          if (sanitizedKey && sanitizedValue) {
            sanitizedMetadata[sanitizedKey] = sanitizedValue;
          }
        });
      }

      // Prepare upload parameters
      const params: S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey + path.extname(fileName),
        Body: buffer,
        ACL: options.acl || "private",
        ContentType: options.contentType || this.getMimeType(fileName),
        Metadata: sanitizedMetadata,
        StorageClass: options.storageClass,
        ServerSideEncryption: options.serverSideEncryption,
        CacheControl: options.cacheControl,
      };

      // Add tags if provided
      if (options.tags) {
        const tagSet = Object.entries(options.tags)
          .map(([key, value]) => {
            // Sanitize tag keys and values as well
            const sanitizedKey = key.replace(/[^a-zA-Z0-9\s+\-=._:\/]/g, "");
            const sanitizedValue = value.replace(
              /[^a-zA-Z0-9\s+\-=._:\/]/g,
              ""
            );
            return `${sanitizedKey}=${sanitizedValue}`;
          })
          .join("&");
        params.Tagging = tagSet;
      }

      const result = await this.s3.upload(params).promise();
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("Error uploading buffer to S3:", error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Create a multer middleware for handling file uploads directly to AWS S3
   * @param options Upload options
   * @returns Configured multer middleware
   */
  createMulterUploader(options: UploadOptions = {}): {
    upload: multer.Multer;
    handleUpload: (
      req: Request,
      fieldName: string
    ) => Promise<UploadResult | null>;
  } {
    // Set up multer with memory storage
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (adjust as needed)
      },
    });

    // Handler function to process the upload after multer
    const handleUpload = async (
      req: Request,
      fieldName: string
    ): Promise<UploadResult | null> => {
      const file = req.file || (req.files as any)?.[fieldName]?.[0];

      if (!file) {
        console.error("No file found in request");
        return null;
      }

      // Get the original filename or generate one
      const fileName = file.originalname || `${Date.now()}-file`;

      return this.uploadBuffer(file.buffer, fileName, {
        ...options,
        contentType: file.mimetype || options.contentType,
      });
    };

    return { upload, handleUpload };
  }

  /**
   * Delete a file from AWS S3
   * @param fileKey Key of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(
    fileKey: string
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: fileKey,
        })
        .promise();

      return { success: true };
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete multiple files from AWS S3
   * @param fileKeys Array of file keys to delete
   * @returns Promise with deletion result
   */
  async deleteFiles(
    fileKeys: string[]
  ): Promise<{ success: boolean; errors?: Error[] }> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: fileKeys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      };

      const result = await this.s3.deleteObjects(deleteParams).promise();

      const errors = result.Errors?.map(
        (err) => new Error(`${err.Key}: ${err.Message}`)
      );

      return {
        success: !errors || errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error("Error deleting files from S3:", error);
      return {
        success: false,
        errors: [error as Error],
      };
    }
  }

  /**
   * List files in a directory of the S3 bucket
   * @param prefix Directory path prefix
   * @param maxKeys Maximum number of keys to return (default: 1000)
   * @returns Promise with array of file data
   */
  async listFiles(
    prefix: string = "",
    maxKeys: number = 1000
  ): Promise<S3.ObjectList> {
    try {
      const result = await this.s3
        .listObjectsV2({
          Bucket: this.bucketName,
          Prefix: prefix,
          MaxKeys: maxKeys,
        })
        .promise();

      return result.Contents || [];
    } catch (error) {
      console.error("Error listing files from S3:", error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for temporary access to a private file
   * @param fileKey Key of the file
   * @param expiresInSeconds URL expiration time in seconds (default: 1 hour)
   * @param operation Operation type ('getObject', 'putObject', etc.)
   * @returns Signed URL
   */
  getSignedUrl(
    fileKey: string,
    expiresInSeconds: number = 3600,
    operation: string = "getObject"
  ): string {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: expiresInSeconds,
    };

    return this.s3.getSignedUrl(operation, params);
  }

  /**
   * Generate a presigned POST URL for direct browser uploads
   * @param fileKey Key of the file
   * @param expiresInSeconds URL expiration time in seconds (default: 1 hour)
   * @param conditions Additional conditions for the upload
   * @returns Presigned POST data
   */
  getPresignedPost(
    fileKey: string,
    expiresInSeconds: number = 3600,
    conditions: any[] = []
  ): Promise<S3.PresignedPost> {
    const params = {
      Bucket: this.bucketName,
      Fields: {
        Key: fileKey,
      },
      Expires: expiresInSeconds,
      Conditions: [
        ["content-length-range", 0, 50 * 1024 * 1024], // 50MB max
        ...conditions,
      ],
    };

    return new Promise((resolve, reject) => {
      this.s3.createPresignedPost(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Copy a file within S3 or between buckets
   * @param sourceKey Source file key
   * @param destinationKey Destination file key
   * @param sourceBucket Source bucket (defaults to current bucket)
   * @returns Promise with copy result
   */
  async copyFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      const copySource = `${sourceBucket || this.bucketName}/${sourceKey}`;

      await this.s3
        .copyObject({
          Bucket: this.bucketName,
          CopySource: copySource,
          Key: destinationKey,
        })
        .promise();

      return { success: true };
    } catch (error) {
      console.error("Error copying file in S3:", error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get file metadata
   * @param fileKey Key of the file
   * @returns Promise with file metadata
   */
  async getFileMetadata(fileKey: string): Promise<S3.HeadObjectOutput> {
    try {
      const result = await this.s3
        .headObject({
          Bucket: this.bucketName,
          Key: fileKey,
        })
        .promise();

      return result;
    } catch (error) {
      console.error("Error getting file metadata from S3:", error);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   * @param fileKey Key of the file
   * @returns Promise with boolean result
   */
  async fileExists(fileKey: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: this.bucketName,
          Key: fileKey,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get MIME type based on file extension
   * @param filePath Path or name of the file
   * @returns MIME type string
   */
  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".mjs": "text/javascript",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".zip": "application/zip",
      ".rar": "application/vnd.rar",
      ".tar": "application/x-tar",
      ".gz": "application/gzip",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".ogg": "audio/ogg",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".wmv": "video/x-ms-wmv",
      ".json": "application/json",
      ".xml": "application/xml",
      ".txt": "text/plain",
      ".csv": "text/csv",
      ".md": "text/markdown",
      ".yaml": "application/x-yaml",
      ".yml": "application/x-yaml",
    };

    return mimeTypes[extension] || "application/octet-stream";
  }
}

// Create and export a singleton instance of the S3Uploader
const s3Uploader = new S3Uploader({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
  bucketName: process.env.AWS_S3_BUCKET_NAME as string,
});

// Also export the class in case someone needs to create their own instance
export { S3Uploader, S3Config, UploadOptions, UploadResult };

// Export the pre-configured instance as the default export
export default s3Uploader;
