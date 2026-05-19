import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import { checkService } from '../services/check.service';
import FileUpload from '../components/FileUpload';

interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  checksToday: number;
  createdAt: string;
}

interface CheckHistory {
  id: string;
  plagiarismPercent: number;
  aiDetectionPercent: number;
  createdAt: string;
  original_filename: string;
}

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checks, setChecks] = useState<CheckHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileData = await authService.getProfile();
      setProfile(profileData.data);

      // Получаем историю проверок
      try {
        const checksData = await checkService.getMyChecks();
        setChecks(checksData.data || []);
      } catch (error) {
        // История может быть недоступна для бесплатных пользователей
        console.log('Checks history not available');
      }
    } catch (error: any) {
      console.error('Fetch data error:', error);
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600 mt-2">Добро пожаловать, {profile?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Статус</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.isPremium ? (
                <span className="text-yellow-600">Премиум</span>
              ) : (
                <span className="text-gray-600">Бесплатный</span>
              )}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Проверок сегодня</h3>
            <p className="text-2xl font-bold text-gray-900">
              {profile?.checksToday || 0}
              {!profile?.isPremium && <span className="text-lg text-gray-500"> / 3</span>}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего проверок</h3>
            <p className="text-2xl font-bold text-gray-900">{checks.length}</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Загрузить новый документ
          </h2>
          <FileUpload />
        </div>

        {/* Premium Banner */}
        {!profile?.isPremium && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Оформите премиум подписку</h3>
                <p className="text-primary-100">
                  Безлимитные проверки, детальные отчеты и многое другое
                </p>
              </div>
              <button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold">
                Узнать больше
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {checks.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">История проверок</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/check/${check.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {check.original_filename || 'Документ'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(check.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Плагиат</p>
                        <p className="font-semibold text-red-600">
                          {check.plagiarismPercent}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">AI</p>
                        <p className="font-semibold text-orange-600">
                          {check.aiDetectionPercent}%
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
