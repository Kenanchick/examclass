import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';

export const MAX_HOMEWORK_ATTACHMENT_SIZE = 15 * 1024 * 1024;

export type HomeworkUploadFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

type ValidatedHomeworkUpload = {
  extension: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
};

const supportedFileTypes: Record<string, readonly string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

@Injectable()
export class HomeworkSubmissionStorageService {
  private readonly uploadsDirectory = resolve(
    process.env.UPLOADS_DIR ?? resolve(process.cwd(), 'uploads'),
  );

  validate(file: HomeworkUploadFile): ValidatedHomeworkUpload {
    if (!file || !Buffer.isBuffer(file.buffer) || file.size <= 0) {
      throw new BadRequestException('Выберите файл с решением');
    }

    if (file.size > MAX_HOMEWORK_ATTACHMENT_SIZE) {
      throw new BadRequestException('Размер файла не должен превышать 15 МБ');
    }

    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = supportedFileTypes[file.mimetype];

    if (!allowedExtensions?.includes(extension)) {
      throw new BadRequestException(
        'Поддерживаются только PDF, JPG, PNG и WEBP-файлы',
      );
    }

    return {
      extension,
      mimeType: file.mimetype,
      originalName: file.originalname.slice(0, 180),
      sizeBytes: file.size,
    };
  }

  async save(file: HomeworkUploadFile, metadata: ValidatedHomeworkUpload) {
    const storageKey = `homework-submissions/${randomUUID()}${metadata.extension}`;
    const storagePath = this.getStoragePath(storageKey);

    await mkdir(dirname(storagePath), { recursive: true });
    await writeFile(storagePath, file.buffer, { flag: 'wx' });

    return {
      mimeType: metadata.mimeType,
      originalName: metadata.originalName,
      sizeBytes: metadata.sizeBytes,
      storageKey,
    };
  }

  async remove(storageKey: string) {
    try {
      await unlink(this.getStoragePath(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async openReadStream(storageKey: string) {
    const storagePath = this.getStoragePath(storageKey);

    try {
      await access(storagePath);
    } catch {
      throw new NotFoundException('Файл с решением не найден');
    }

    return createReadStream(storagePath);
  }

  private getStoragePath(storageKey: string) {
    const storagePath = resolve(this.uploadsDirectory, storageKey);

    if (!storagePath.startsWith(`${this.uploadsDirectory}${sep}`)) {
      throw new BadRequestException('Некорректный путь к файлу');
    }

    return storagePath;
  }
}
