import React from 'react';
import FileUpload from '../components/FileUpload';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Проверка на плагиат и AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Бесплатная система для проверки дипломных и курсовых работ
          </p>
        </div>

        {/* Upload Section */}
        <FileUpload />

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Проверка на плагиат</h3>
            <p className="text-gray-600">
              Сравнение с базой документов и поиск в интернете
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Детекция AI</h3>
            <p className="text-gray-600">
              Определение текстов, созданных искусственным интеллектом
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-primary-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Детальные отчеты</h3>
            <p className="text-gray-600">
              Подробная информация о совпадениях и источниках
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Тарифы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Бесплатный</h3>
              <div className="text-4xl font-bold mb-6">0₽</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  3 проверки в день
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Базовый отчет
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Проверка на плагиат
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Детекция AI
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-3 rounded-lg font-semibold"
              >
                Начать бесплатно
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-primary-600 text-white p-8 rounded-lg shadow-lg border-2 border-primary-700 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">
                Популярный
              </div>
              <h3 className="text-2xl font-bold mb-4">Премиум</h3>
              <div className="text-4xl font-bold mb-6">
                150₽<span className="text-lg">/месяц</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Безлимитные проверки
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Детальный отчет с источниками
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Подсветка совпадений
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  История проверок
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2">✓</span>
                  Без рекламы
                </li>
              </ul>
              <button className="block w-full bg-white hover:bg-gray-100 text-primary-600 text-center py-3 rounded-lg font-semibold">
                Оформить премиум
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
