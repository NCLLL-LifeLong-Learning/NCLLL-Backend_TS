import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

// Define a common interface for all uploaders
export interface FileUploader {
  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    options: any
  ): Promise<{
    success: boolean;
    url?: string;
    key?: string;
    error?: Error;
  }>;
}

// Local file uploader implementation
export class LocalUploader implements FileUploader {
  private baseDir: string;
  private baseUrl: string;

  constructor(config: { baseDir: string; baseUrl: string }) {
    this.baseDir = config.baseDir;
    this.baseUrl = config.baseUrl;
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    options: any
  ): Promise<{
    success: boolean;
    url?: string;
    key?: string;
    error?: Error;
  }> {
    try {
      // Create the full directory path
      const uploadPath = options.path || "uploads";
      const fullDir = path.join(this.baseDir, uploadPath);

      // Ensure directory exists
      await fs.mkdir(fullDir, { recursive: true });

      // Full file path
      const filePath = path.join(fullDir, fileName);

      // Write the file
      await fs.writeFile(filePath, buffer);

      // Generate the public URL
      const publicUrl = `${this.baseUrl}/${uploadPath}/${fileName}`;

      return {
        success: true,
        url: publicUrl,
        key: path.join(uploadPath, fileName), // Relative path as key
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
}
