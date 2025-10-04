'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { uploadService } from '@/lib/api';
import { UploadResult } from '@/lib/types';

interface FileUploaderProps {
  onUploadSuccess: (results: UploadResult[]) => void;
}

export default function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Selecione pelo menos um arquivo para enviar');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      const results = await uploadService.uploadMultipleFiles(files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Limpar arquivos após upload bem-sucedido
      setFiles([]);
      onUploadSuccess(results);
      
      // Resetar progresso após um breve delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer upload dos arquivos');
      setUploadProgress(0);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Solte os arquivos aqui...'
            : 'Arraste e solte arquivos aqui, ou clique para selecionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Suporta imagens, PDFs e arquivos de texto (máx. 10MB)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Arquivos selecionados ({files.length}):</h3>
          <ul className="divide-y divide-gray-200 border rounded-md">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 px-3 text-sm">
                <div className="flex items-center">
                  <FiFile className="mr-2 text-gray-500" />
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                  disabled={uploading}
                >
                  <FiX />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          {uploadProgress === 100 && (
            <div className="flex items-center text-green-600 text-sm">
              <FiCheck className="mr-1" /> Upload concluído com sucesso!
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className={`btn-primary flex items-center ${
            files.length === 0 || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FiUpload className="mr-2" />
          {uploading ? 'Enviando...' : 'Enviar Arquivos'}
        </button>
      </div>
    </div>
  );
}