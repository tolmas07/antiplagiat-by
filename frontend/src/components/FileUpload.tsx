import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { documentService } from '../services/document.service';
import { checkService } from '../services/check.service';
import { useNavigate } from 'react-router-dom';

const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Проверка размера файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    try {
      setUploading(true);

      // Загрузка файла
      const uploadResult = await documentService.upload(file);
      const documentId = uploadResult.data.documentId;

      toast.success('Файл загружен успешно!');

      // Запуск проверки
      setChecking(true);
      const checkResult = await checkService.startCheck(documentId);
      const checkId = checkResult.data.checkId;

      toast.info('Проверка запущена...');

      // Переход на страницу результатов
      navigate(`/check/${checkId}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Ошибка при загрузке файла');
    } finally {
      setUploading(false);
      setChecking(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading || checking
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${(uploading || checking) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {uploading ? (
          <p className="mt-4 text-lg text-gray-600">Загрузка файла...</p>
        ) : checking ? (
          <p className="mt-4 text-lg text-gray-600">Запуск проверки...</p>
        ) : isDragActive ? (
          <p className="mt-4 text-lg text-gray-600">Отпустите файл здесь</p>
        ) : (
          <>
            <p className="mt-4 text-lg text-gray-600">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Поддерживаются форматы: DOCX, PDF (макс. 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
