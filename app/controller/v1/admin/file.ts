import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { unprocessableEntity, ok } from "response";
import fs from "fs/promises";
import path from "path";
import { SpacesUploader } from "~/common/utils/fileUploader";
import { S3Uploader } from "~/common/utils/fileUploaderS3";
import {
  FileUploader,
  LocalUploader,
} from "~/common/utils/fileUploaderLocalStorage";
export class UploadController {
  private uploader: FileUploader;
  private storageType: string;

  constructor() {
    this.storageType = process.env.USE_STORAGE || "S3";

    if (this.storageType === "S3") {
      this.uploader = new S3Uploader({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        region: process.env.AWS_REGION as string,
        bucketName: process.env.AWS_S3_BUCKET_NAME as string,
      });
    } else if (this.storageType === "DO") {
      this.uploader = new SpacesUploader({
        accessKeyId: process.env.DO_SPACES_KEY as string,
        secretAccessKey: process.env.DO_SPACES_SECRET as string,
        endpoint: process.env.DO_SPACES_ENDPOINT as string,
        spaceName: process.env.DO_SPACES_NAME as string,
        region: process.env.DO_SPACES_REGION || "us-east-1",
      });
    } else if (this.storageType === "LOCAL") {
      this.uploader = new LocalUploader({
        baseDir:
          process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), "assets"),
        baseUrl:
          process.env.LOCAL_STORAGE_BASE_URL || "http://localhost:3000/assets",
      });
    } else {
      throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  /**
   * Basic file validation - only checks if file exists and optionally validates size
   */
  validateFile(
    file: Express.Multer.File,
    fieldName: string,
    maxSizeBytes?: number
  ) {
    if (!file || file.fieldname !== fieldName) {
      throw unprocessableEntity(`The field '${fieldName}' is required.`);
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      throw unprocessableEntity(
        `The file size exceeds the maximum allowed size of ${(
          maxSizeBytes /
          1024 /
          1024
        ).toFixed(2)} MB.`
      );
    }
    return file;
  }

  /**
   * Get upload options based on storage type
   */
  private getUploadOptions(file: Express.Multer.File) {
    const baseOptions = {
      path: "uploads",
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        size: file.size.toString(),
        uploadedAt: new Date().toISOString(),
      },
    };

    if (this.storageType === "S3") {
      return {
        ...baseOptions,
        acl: "private", // AWS S3 default to private
        tags: {
          source: "upload-controller",
          originalName: file.originalname,
        },
        cacheControl: "max-age=31536000", // 1 year cache
        storageClass: "STANDARD",
      };
    } else if (this.storageType === "DO") {
      return {
        ...baseOptions,
        acl: "public-read", // DO Spaces default to public-read
      };
    } else if (this.storageType === "LOCAL") {
      return {
        ...baseOptions,
        // Local storage doesn't need ACL or cache control
      };
    }

    return baseOptions;
  }

  /**
   * Generate a unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = originalName.split(".").pop();
    const baseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");
    return `${timestamp}-${uuid}-${baseName}.${extension}`;
  }

  /**
   * Handle the upload request
   */
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw unprocessableEntity("File not found");
      }

      const validatedFile = this.validateFile(
        req.file,
        "file",
        10 * 1024 * 1024
      );

      const fileName = this.generateFileName(validatedFile.originalname);
      const uploadOptions = this.getUploadOptions(validatedFile);

      const result = await this.uploader.uploadBuffer(
        validatedFile.buffer,
        fileName,
        uploadOptions
      );

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to upload file");
      }

      return res.send(
        ok({
          url: result.url,
          key: result.key,
          fileName: fileName,
          originalName: validatedFile.originalname,
          size: validatedFile.size,
          storageType: this.storageType,
        })
      );
    } catch (error: any) {
      console.error(
        `❌ [upload] Error uploading to ${this.storageType}:`,
        error.message
      );
      if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get storage configuration info (useful for debugging)
   */
  getStorageInfo() {
    return {
      storageType: this.storageType,
      isS3: this.storageType === "S3",
      isSpaces: this.storageType === "DO",
      isLocal: this.storageType === "LOCAL",
    };
  }

  /**
   * Health check method to verify storage configuration
   */
  async healthCheck(req: Request, res: Response) {
    try {
      const info = this.getStorageInfo();

      // Basic configuration check
      if (this.storageType === "S3") {
        if (
          !process.env.AWS_ACCESS_KEY_ID ||
          !process.env.AWS_SECRET_ACCESS_KEY ||
          !process.env.AWS_S3_BUCKET_NAME
        ) {
          throw new Error("Missing required AWS S3 environment variables");
        }
      } else if (this.storageType === "DO") {
        if (
          !process.env.DO_SPACES_KEY ||
          !process.env.DO_SPACES_SECRET ||
          !process.env.DO_SPACES_NAME
        ) {
          throw new Error(
            "Missing required DigitalOcean Spaces environment variables"
          );
        }
      } else if (this.storageType === "LOCAL") {
        // Check if local storage directory exists and is writable
        const storageDir =
          process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), "assets");
        try {
          await fs.mkdir(storageDir, { recursive: true });
          await fs.access(storageDir, fs.constants.W_OK);
        } catch (error) {
          throw new Error(
            `Local storage directory is not accessible: ${storageDir}`
          );
        }
      }

      return res.send(
        ok({
          status: "healthy",
          storage: info,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error: any) {
      console.error(
        "[healthCheck] Storage configuration error:",
        error.message
      );
      return res.status(500).json({
        error: "Storage configuration error",
        details: error.message,
      });
    }
  }
}

export default new UploadController();
