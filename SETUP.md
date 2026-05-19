# Инструкция по запуску проекта Antiplagiat.by

## Требования

- Node.js 18+ 
- PostgreSQL 14+
- Redis (опционально, для кэширования)

## Установка

### 1. Backend

```bash
cd backend
npm install
```

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные окружения в `.env`:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL (можно использовать Supabase бесплатно)
DATABASE_URL=postgresql://user:password@localhost:5432/antiplagiat

# Redis (можно использовать Upstash бесплатно)
REDIS_URL=redis://localhost:6379

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google Custom Search (опционально, для поиска в интернете)
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# CORS
CORS_ORIGIN=http://localhost:3000
```

Запустите миграции базы данных:

```bash
# Подключитесь к PostgreSQL и выполните SQL из файла:
psql -U your_user -d antiplagiat -f migrations/001_initial_schema.sql
```

Запустите backend:

```bash
npm run dev
```

Backend будет доступен на `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
```

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные окружения:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Antiplagiat.by
```

Запустите frontend:

```bash
npm start
```

Frontend будет доступен на `http://localhost:3000`

## Бесплатный хостинг

### Backend (Railway)

1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL из Marketplace
4. Подключите GitHub репозиторий
5. Укажите root directory: `backend`
6. Добавьте переменные окружения
7. Deploy!

### Frontend (Vercel)

1. Зарегистрируйтесь на [Vercel.com](https://vercel.com)
2. Импортируйте GitHub репозиторий
3. Root Directory: `frontend`
4. Framework Preset: Create React App
5. Добавьте переменные окружения
6. Deploy!

### База данных (Supabase)

1. Зарегистрируйтесь на [Supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте Connection String
4. Выполните SQL миграции в SQL Editor
5. Используйте Connection String в `DATABASE_URL`

### Redis (Upstash)

1. Зарегистрируйтесь на [Upstash.com](https://upstash.com)
2. Создайте Redis базу
3. Скопируйте Redis URL
4. Используйте в `REDIS_URL`

## Тестирование

1. Откройте `http://localhost:3000`
2. Зарегистрируйтесь
3. Загрузите тестовый DOCX или PDF файл
4. Дождитесь результатов проверки

## Возможные проблемы

### Ошибка подключения к БД

Убедитесь, что PostgreSQL запущен и `DATABASE_URL` правильный.

### Ошибка при загрузке файла

Проверьте, что файл не превышает 10MB и имеет формат DOCX или PDF.

### CORS ошибки

Убедитесь, что `CORS_ORIGIN` в backend соответствует URL frontend.

## Дополнительно

- Для Google Custom Search API: https://developers.google.com/custom-search
- Документация PostgreSQL: https://www.postgresql.org/docs/
- Документация Redis: https://redis.io/docs/
