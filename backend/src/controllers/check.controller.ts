import { Request, Response, NextFunction } from 'express';
import { PlagiarismService } from '../services/plagiarism.service';
import { DocumentModel } from '../models/document.model';
import { UserModel } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

const plagiarismService = new PlagiarismService();

export class CheckController {
  static async startCheck(req: any, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.body;

      if (!documentId) {
        throw new AppError('documentId обязателен', 400);
      }

      // Проверка существования документа
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new AppError('Документ не найден', 404);
      }

      // Проверка лимитов для бесплатных пользователей
      if (req.user && !req.user.isPremium) {
        const checksToday = await UserModel.getCheckCount(req.user.id);
        if (checksToday >= 3) {
          throw new AppError('Достигнут дневной лимит проверок (3). Оформите премиум для безлимитных проверок', 429);
        }
      }

      // Запуск проверки
      const checkId = await plagiarismService.checkDocument(documentId, req.user?.id);

      // Увеличиваем счетчик проверок
      if (req.user) {
        await UserModel.incrementCheckCount(req.user.id);
      }

      res.status(202).json({
        success: true,
        data: {
          checkId,
          status: 'processing',
          message: 'Проверка запущена'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCheckStatus(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await plagiarismService.getCheckResult(id);

      if (!result) {
        throw new AppError('Результат проверки не найден', 404);
      }

      res.json({
        success: true,
        data: {
          id: result.id,
          status: result.status,
          plagiarismPercent: result.plagiarism_percent,
          aiDetectionPercent: result.ai_detection_percent,
          completedAt: result.completed_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCheckResult(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await plagiarismService.getCheckResult(id);

      if (!result) {
        throw new AppError('Результат проверки не найден', 404);
      }

      if (result.status !== 'completed') {
        throw new AppError('Проверка еще не завершена', 400);
      }

      // Для бесплатных пользователей - ограниченный отчет
      const isDetailedReport = req.user?.isPremium || false;

      const response: any = {
        id: result.id,
        plagiarismPercent: result.plagiarism_percent,
        aiDetectionPercent: result.ai_detection_percent,
        status: result.status,
        createdAt: result.created_at,
        completedAt: result.completed_at
      };

      if (isDetailedReport) {
        response.sources = result.sources;
        response.matches = result.matches;
      } else {
        // Базовый отчет - только общая информация
        response.sourcesCount = result.sources?.sources?.length || 0;
        response.message = 'Для детального отчета с источниками оформите премиум';
      }

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserChecks(req: any, res: Response, next: NextFunction) {
    try {
      const checks = await plagiarismService.getCheckResult(req.user.id);

      res.json({
        success: true,
        data: checks
      });
    } catch (error) {
      next(error);
    }
  }
}
