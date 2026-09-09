import { Platform } from 'react-native';
import RNFS, {
  DownloadFileOptions,
  DownloadProgressCallbackResult,
} from 'react-native-fs';

export type DownloadStatus = 'downloaded' | 'already_exists';

export interface DownloadProgress {
  jobId: number;
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0 - 1 range
}

export interface DownloadResult {
  status: DownloadStatus;
  path: string;
  fileName: string;
  bytesWritten: number;
}

type ProgressListener = (progress: DownloadProgress) => void;

const DOWNLOADS_FOLDER = 'hodlo-downloads';

class FileDownloadService {
  private static instance: FileDownloadService;

  private readonly baseDirectory: string;
  private readonly ensureDirectoryPromise: Promise<void>;

  private constructor() {
    const rootDirectory =
      Platform.OS === 'android'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DocumentDirectoryPath; // iOS + Android safe location

    this.baseDirectory = `${rootDirectory}/${DOWNLOADS_FOLDER}`;
    this.ensureDirectoryPromise = this.ensureBaseDirectory();
  }

  public static getInstance(): FileDownloadService {
    if (!FileDownloadService.instance) {
      FileDownloadService.instance = new FileDownloadService();
    }
    return FileDownloadService.instance;
  }

  private async ensureBaseDirectory(): Promise<void> {
    const exists = await RNFS.exists(this.baseDirectory);
    if (!exists) {
      await RNFS.mkdir(this.baseDirectory);
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ensureDirectoryPromise;
  }

  public getDownloadPath(fileNameOrPath: string): string {
    const fileName = fileNameOrPath.split('/').pop() || fileNameOrPath;
    return `${this.baseDirectory}/${fileName}`;
  }

  public async fileExists(fileName: string): Promise<boolean> {
    await this.ensureReady();
    return RNFS.exists(this.getDownloadPath(fileName));
  }

  public async removeFile(fileName: string): Promise<void> {
    await this.ensureReady();
    const target = this.getDownloadPath(fileName);
    if (await RNFS.exists(target)) {
      await RNFS.unlink(target);
    }
  }

  public async clearAll(): Promise<void> {
    await this.ensureReady();
    const exists = await RNFS.exists(this.baseDirectory);
    if (!exists) {
      return;
    }

    const entries = await RNFS.readDir(this.baseDirectory);
    for (const entry of entries) {
      if (entry.isFile() && entry.path) {
        await RNFS.unlink(entry.path);
      }
    }
  }

  public async downloadFile(
    url: string,
    fileName?: string,
    onProgress?: ProgressListener,
    retries: number = 3,
  ): Promise<DownloadResult> {
    if (!url) {
      throw new Error('Download URL is required');
    }

    await this.ensureReady();

    const resolvedFileName = fileName ?? this.deriveFileNameFromUrl(url);
    const destinationPath = this.getDownloadPath(resolvedFileName);

    if (await RNFS.exists(destinationPath)) {
      console.log(`[Download] File already exists at ${destinationPath}`);
      return {
        status: 'already_exists',
        path: destinationPath,
        fileName: resolvedFileName,
        bytesWritten: (await RNFS.stat(destinationPath)).size,
      };
    }

    const temporaryPath = `${destinationPath}.download`;
    let attempt = 0;

    while (attempt < retries) {
      try {
        attempt++;
        console.log(`[Download] Starting attempt ${attempt}/${retries} for ${url}`);

        if (await RNFS.exists(temporaryPath)) {
          await RNFS.unlink(temporaryPath);
        }

        const downloadOptions: DownloadFileOptions = {
          fromUrl: url,
          toFile: temporaryPath,
          progressDivider: 2,
          progress: (data: DownloadProgressCallbackResult) => {
            if (!onProgress) return;
            const { jobId, bytesWritten, contentLength } = data;
            const calculatedProgress = contentLength
              ? bytesWritten / contentLength
              : 0;

            onProgress({
              jobId,
              bytesWritten,
              contentLength,
              progress: Math.min(1, Math.max(0, calculatedProgress)),
            });
          },
        };

        const { promise } = RNFS.downloadFile(downloadOptions);
        const result = await promise;

        if (result.statusCode >= 200 && result.statusCode < 300) {
          await RNFS.moveFile(temporaryPath, destinationPath);
          console.log(`[Download] Successfully downloaded to ${destinationPath}`);
          return {
            status: 'downloaded',
            path: destinationPath,
            fileName: resolvedFileName,
            bytesWritten: result.bytesWritten,
          };
        } else {
          throw new Error(`Download failed with status code ${result.statusCode}`);
        }
      } catch (error) {
        console.warn(`[Download] Attempt ${attempt} failed:`, error);
        await this.safeUnlink(temporaryPath);

        if (attempt >= retries) {
          throw error;
        }

        const backoffTime = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    throw new Error('Download failed after multiple attempts');
  }

  private deriveFileNameFromUrl(url: string): string {
    const sanitized = url.split('?')[0];
    const extracted = sanitized.substring(sanitized.lastIndexOf('/') + 1);
    if (!extracted || extracted.length === 0) {
      const timestamp = Date.now();
      return `file-${timestamp}`;
    }
    return extracted;
  }

  private async safeUnlink(path: string): Promise<void> {
    if (await RNFS.exists(path)) {
      try {
        await RNFS.unlink(path);
      } catch (unlinkError) {
        console.warn('Failed to remove temporary download file:', unlinkError);
      }
    }
  }
}

export const fileDownloadService = FileDownloadService.getInstance();
export default fileDownloadService;

