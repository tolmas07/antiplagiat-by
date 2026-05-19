# Antiplagiat.by - Система проверки на плагиат и AI-генерацию

Бесплатная система для проверки дипломных и курсовых работ на плагиат и использование искусственного интеллекта.

## Возможности

- ✅ Проверка на плагиат (локальная БД + интернет-поиск)
- ✅ Детекция AI-генерированного текста
- ✅ Поддержка DOCX и PDF форматов
- ✅ Детальные отчеты с подсветкой совпадений
- ✅ История проверок
- ✅ Бесплатный базовый тариф

## Технологии

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js + Express
- PostgreSQL (Supabase)
- Redis (Upstash)
- JWT Authentication

### Обработка текстов
- Mammoth.js (DOCX)
- PDF.js (PDF)
- Natural (NLP)
- String similarity algorithms

## Установка

### Требования
- Node.js 18+
- PostgreSQL 14+
- Redis (опционально)

### Шаги установки

1. Клонировать репозиторий
```bash
git clone https://github.com/yourusername/antiplagiat.by.git
cd antiplagiat.by
```

2. Установить зависимости
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Настроить переменные окружения
```bash
# Backend
cp .env.example .env
# Заполнить .env файл

# Frontend
cp .env.example .env
# Заполнить .env файл
```

4. Запустить миграции БД
```bash
cd backend
npm run migrate
```

5. Запустить проект
```bash
# Backend (порт 5000)
cd backend
npm run dev

# Frontend (порт 3000)
cd frontend
npm start
```

## Структура проекта

```
antiplagiat.by/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── migrations/
│   └── package.json
├── frontend/          # React приложение
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Деплой

### Vercel (Frontend)
```bash
cd frontend
vercel deploy --prod
```

### Railway (Backend)
```bash
cd backend
railway up
```

## Лицензия

MIT

## Контакты

Для вопросов и предложений: [ваш email]
