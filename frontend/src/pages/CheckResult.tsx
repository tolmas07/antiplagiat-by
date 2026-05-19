import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkService } from '../services/check.service';

interface CheckResultData {
  id: string;
  status: string;
  plagiarismPercent: number;
  aiDetectionPercent: number;
  sources?: any[];
  matches?: any[];
  sourcesCount?: number;
  message?: string;
  completedAt?: string;
}

const CheckResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<CheckResultData | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const checkStatus = async () => {
      try {
        const statusResult = await checkService.getCheckStatus(id);

        if (statusResult.data.status === 'completed') {
          setChecking(false);
          fetchResult();
        } else {
          // Продолжаем проверять статус каждые 3 секунды
          setTimeout(checkStatus, 3000);
        }
      } catch (error: any) {
        console.error('Check status error:', error);
        toast.error('Ошибка при проверке статуса');
        setLoading(false);
        setChecking(false);
      }
    };

    const fetchResult = async () => {
      try {
        const resultData = await checkService.getCheckResult(id);
        setResult(resultData.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Fetch result error:', error);
        toast.error('Ошибка при получении результатов');
        setLoading(false);
      }
    };

    checkStatus();
  }, [id, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Проверка документа...
          </h2>
          <p className="text-gray-600">
            Это может занять несколько минут
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Результаты не найдены
          </h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const getPlagiarismColor = (percent: number) => {
    if (percent < 15) return 'text-green-600';
    if (percent < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAIColor = (percent: number) => {
    if (percent < 30) return 'text-green-600';
    if (percent < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Результаты проверки</h1>
            <p className="text-primary-100 text-sm mt-1">
              ID проверки: {result.id}
            </p>
          </div>

          {/* Results */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Plagiarism Score */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Плагиат
                </h3>
                <div className={`text-5xl font-bold ${getPlagiarismColor(result.plagiarismPercent)}`}>
                  {result.plagiarismPercent}%
                </div>
                <p className="text-gray-600 mt-2">
                  {result.plagiarismPercent < 15 && 'Отличный результат'}
                  {result.plagiarismPercent >= 15 && result.plagiarismPercent < 30 && 'Приемлемый уровень'}
                  {result.plagiarismPercent >= 30 && 'Высокий уровень плагиата'}
                </p>
              </div>

              {/* AI Detection Score */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Детекция AI
                </h3>
                <div className={`text-5xl font-bold ${getAIColor(result.aiDetectionPercent)}`}>
                  {result.aiDetectionPercent}%
                </div>
                <p className="text-gray-600 mt-2">
                  {result.aiDetectionPercent < 30 && 'Низкая вероятность AI'}
                  {result.aiDetectionPercent >= 30 && result.aiDetectionPercent < 60 && 'Средняя вероятность AI'}
                  {result.aiDetectionPercent >= 60 && 'Высокая вероятность AI'}
                </p>
              </div>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Найденные источники ({result.sources.length})
                </h3>
                <div className="space-y-3">
                  {result.sources.map((source: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary-100 text-primary-800 mb-2">
                            {source.type === 'local' ? 'Локальная база' : 'Интернет'}
                          </span>
                          {source.filename && (
                            <p className="font-medium text-gray-900">{source.filename}</p>
                          )}
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline text-sm"
                            >
                              {source.url}
                            </a>
                          )}
                        </div>
                        <span className="text-lg font-bold text-red-600 ml-4">
                          {source.matchPercent}%
                        </span>
                      </div>
                      {source.matchedFragments && source.matchedFragments.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {source.matchedFragments[0].substring(0, 150)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : result.sourcesCount !== undefined ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  {result.message || `Найдено источников: ${result.sourcesCount}`}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  Для просмотра детальной информации оформите премиум подписку
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">
                  Совпадений не найдено
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium"
              >
                Проверить другой документ
              </button>

              {result.sourcesCount !== undefined && (
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Оформить премиум
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckResult;
