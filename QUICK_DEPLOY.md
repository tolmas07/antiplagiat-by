# Быстрый деплой через веб-интерфейс (5 минут)

## Шаг 1: Деплой Frontend на Vercel

1. Откройте https://vercel.com/login
2. Войдите через GitHub аккаунт **tolmaswork**
3. Нажмите **"Add New..."** → **"Project"**
4. Найдите и выберите репозиторий **"antiplagiat-by"**
5. Настройте проект:
   
   **Framework Preset**: Create React App
   
   **Root Directory**: `frontend` (нажмите Edit и выберите папку frontend)
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `build`
   
   **Install Command**: `npm install`

6. **Environment Variables** (нажмите "Add" для каждой):
   ```
   REACT_APP_API_URL = https://ВРЕМЕННО_ОСТАВЬТЕ_ПУСТЫМ
   REACT_APP_NAME = Antiplagiat.by
   ```
   (API_URL обновим после деплоя backend)

7. Нажмите **"Deploy"**
8. Дождитесь завершения (2-3 минуты)
9. **Скопируйте URL** (например: `https://antiplagiat-by-xxx.vercel.app`)

---

## Шаг 2: Деплой Backend на Railway

1. Откройте https://railway.app/login
2. Войдите через GitHub аккаунт **tolmaswork**
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите репозиторий **"antiplagiat-by"**
6. Railway автоматически начнет деплой

### Настройка Backend:

7. После создания проекта, нажмите на сервис
8. Перейдите в **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `/backend/**`

9. Добавьте **PostgreSQL**:
   - В проекте нажмите **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway автоматически создаст переменную `DATABASE_URL`

10. Перейдите в **Variables** и добавьте:
    ```
    PORT = 5000
    NODE_ENV = production
    JWT_SECRET = antiplagiat_super_secret_key_2026_change_in_production
    CORS_ORIGIN = https://antiplagiat-by-xxx.vercel.app
    ```
    (Замените `antiplagiat-by-xxx.vercel.app` на ваш URL из Шага 1)

11. **Скопируйте URL backend** (в Settings → Domains, например: `https://antiplagiat-by-production.up.railway.app`)

---

## Шаг 3: Выполнить миграции БД

1. В Railway проекте откройте **PostgreSQL** сервис
2. Перейдите в **Data** → **Query**
3. Скопируйте и выполните SQL из файла `backend/migrations/001_initial_schema.sql`
4. Нажмите **"Run Query"**

Или через Connection String:
1. В PostgreSQL сервисе скопируйте **Connection URL**
2. Используйте любой PostgreSQL клиент (pgAdmin, DBeaver, или онлайн)
3. Подключитесь и выполните миграции

---

## Шаг 4: Обновить Frontend с Backend URL

1. Вернитесь в Vercel проект
2. Перейдите в **Settings** → **Environment Variables**
3. Найдите `REACT_APP_API_URL` и измените на:
   ```
   https://antiplagiat-by-production.up.railway.app/api
   ```
   (Используйте ваш URL из Шага 2)
4. Нажмите **"Save"**
5. Перейдите в **Deployments**
6. Нажмите **"Redeploy"** на последнем деплое

---

## Шаг 5: Проверка

1. Откройте ваш Vercel URL: `https://antiplagiat-by-xxx.vercel.app`
2. Попробуйте зарегистрироваться
3. Загрузите тестовый DOCX или PDF файл
4. Проверьте результаты

---

## Готово! 🎉

Ваш сайт работает на:
- **Frontend**: https://antiplagiat-by-xxx.vercel.app
- **Backend**: https://antiplagiat-by-production.up.railway.app

---

## Если что-то не работает:

### Frontend не загружается:
- Проверьте логи в Vercel → Deployments → View Function Logs
- Убедитесь, что build прошел успешно

### Backend не отвечает:
- Проверьте логи в Railway → Deployments → View Logs
- Убедитесь, что все переменные окружения установлены
- Проверьте, что PostgreSQL запущен

### Ошибка CORS:
- Убедитесь, что `CORS_ORIGIN` в Railway совпадает с Vercel URL
- Redeploy backend после изменения

### База данных не работает:
- Убедитесь, что миграции выполнены
- Проверьте `DATABASE_URL` в Railway Variables
- Проверьте логи PostgreSQL

---

## Полезные ссылки:

- **GitHub Repo**: https://github.com/tolmaswork/antiplagiat-by
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Документация**: См. файлы README.md, SETUP.md, DEPLOY.md в репозитории
