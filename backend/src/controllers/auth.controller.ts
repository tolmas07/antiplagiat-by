import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email и пароль обязательны', 400);
      }

      // Проверка формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Неверный формат email', 400);
      }

      // Проверка длины пароля
      if (password.length < 6) {
        throw new AppError('Пароль должен быть минимум 6 символов', 400);
      }

      // Проверка существования пользователя
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('Пользователь с таким email уже существует', 409);
      }

      // Хэширование пароля
      const passwordHash = await bcrypt.hash(password, 10);

      // Создание пользователя
      const user = await UserModel.create(email, passwordHash);

      // Генерация JWT токена
      const token = jwt.sign(
        { id: user.id, email: user.email, isPremium: user.is_premium },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            isPremium: user.is_premium
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email и пароль обязательны', 400);
      }

      // Поиск пользователя
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Неверный email или пароль', 401);
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Неверный email или пароль', 401);
      }

      // Генерация JWT токена
      const token = jwt.sign(
        { id: user.id, email: user.email, isPremium: user.is_premium },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            isPremium: user.is_premium,
            premiumExpiresAt: user.premium_expires_at
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new AppError('Пользователь не найден', 404);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          isPremium: user.is_premium,
          premiumExpiresAt: user.premium_expires_at,
          checksToday: user.checks_today,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
