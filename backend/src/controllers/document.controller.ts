import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { DocumentModel } from '../models/document.model';
import { TextExtractor } from '../utils/textExtractor';
import { AppError } from '../middleware/error.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Поддерживаются только файлы DOCX и PDF'));
    }
  }
});

export class DocumentController {
  static uploadMiddleware = upload.single('file');

  static async upload(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Файл не загружен', 400);
      }

      const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
      const filename = `${uuidv4()}.${fileType}`;

      // Извлечение текста
      const text = await TextExtractor.extract(req.file.buffer, fileType);

      if (!text || text.trim().length < 100) {
        throw new AppError('Файл содержит слишком мало текста (минимум 100 символов)', 400);
      }

      const wordCount = TextExtractor.countWords(text);

      // Сохранение документа в БД
      const document = await DocumentModel.create({
        user_id: req.user?.id,
        filename,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        file_type: fileType,
        text_content: text,
        word_count: wordCount
      });

      res.status(201).json({
        success: true,
        data: {
          documentId: document.id,
          filename: document.original_filename,
          wordCount: document.word_count,
          fileSize: document.file_size
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDocument(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const document = await DocumentModel.findById(id);
      if (!document) {
        throw new AppError('Документ не найден', 404);
      }

      // Проверка прав доступа
      if (document.user_id && document.user_id !== req.user?.id) {
        throw new AppError('Нет доступа к этому документу', 403);
      }

      res.json({
        success: true,
        data: {
          id: document.id,
          filename: document.original_filename,
          wordCount: document.word_count,
          fileSize: document.file_size,
          createdAt: document.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDocuments(req: any, res: Response, next: NextFunction) {
    try {
      const documents = await DocumentModel.findByUserId(req.user.id, 20);

      res.json({
        success: true,
        data: documents.map(doc => ({
          id: doc.id,
          filename: doc.original_filename,
          wordCount: doc.word_count,
          fileSize: doc.file_size,
          createdAt: doc.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const document = await DocumentModel.findById(id);
      if (!document) {
        throw new AppError('Документ не найден', 404);
      }

      // Проверка прав доступа
      if (document.user_id !== req.user.id) {
        throw new AppError('Нет доступа к этому документу', 403);
      }

      await DocumentModel.delete(id);

      res.json({
        success: true,
        message: 'Документ удален'
      });
    } catch (error) {
      next(error);
    }
  }
}
