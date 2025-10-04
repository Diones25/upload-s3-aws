'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import ImageGallery from '@/components/ImageGallery';
import { UploadResult } from '@/lib/types';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  const handleUploadSuccess = (results: UploadResult[]) => {
    setUploadedFiles(prev => [...prev, ...results]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Upload de Arquivos para AWS S3</h1>
      
      <div className="card mb-8">
        <FileUploader onUploadSuccess={handleUploadSuccess} />
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Arquivos Enviados</h2>
          <ImageGallery files={uploadedFiles} />
        </div>
      )}
    </div>
  );
}