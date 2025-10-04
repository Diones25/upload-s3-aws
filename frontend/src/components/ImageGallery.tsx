'use client';

import { useState } from 'react';
import { FiDownload, FiTrash2, FiExternalLink, FiImage, FiFile, FiFileText, FiX } from 'react-icons/fi';
import { uploadService } from '@/lib/api';
import { UploadResult } from '@/lib/types';

interface ImageGalleryProps {
  files: UploadResult[];
}

export default function ImageGallery({ files }: ImageGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<UploadResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (key: string) => {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
      try {
        setIsDeleting(true);
        await uploadService.deleteFile(key);
        // Aqui você precisaria atualizar a lista de arquivos no componente pai
        // Por exemplo, através de um callback ou contexto
        window.location.reload(); // Solução temporária
      } catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        alert('Erro ao excluir o arquivo. Tente novamente.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <FiImage className="h-5 w-5" />;
    } else if (mimetype === 'application/pdf') {
      return <FiFile className="h-5 w-5" />;
    } else {
      return <FiFileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');

  return (
    <div>
      {files.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum arquivo enviado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.key} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                {isImage(file.mimetype) ? (
                  <img 
                    src={file.url} 
                    alt={file.filename} 
                    className="object-cover w-full h-full cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-gray-500">
                    {getFileIcon(file.mimetype)}
                    <span className="mt-2 text-xs truncate max-w-full">{file.filename.split('.').pop()?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                
                <div className="flex justify-between mt-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-700 text-sm flex items-center"
                  >
                    <FiExternalLink className="mr-1" /> Abrir
                  </a>
                  
                  <button
                    onClick={() => handleDelete(file.key)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                  >
                    <FiTrash2 className="mr-1" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para visualização de imagem */}
      {selectedFile && isImage(selectedFile.mimetype) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFile(null)}>
          <div className="max-w-4xl max-h-full relative" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedFile.url} 
              alt={selectedFile.filename} 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              onClick={() => setSelectedFile(null)}
            >
              <FiX className="h-6 w-6" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded">
              <p className="truncate">{selectedFile.filename}</p>
              <div className="flex justify-between mt-1">
                <span>{formatFileSize(selectedFile.size)}</span>
                <a 
                  href={selectedFile.url} 
                  download
                  className="flex items-center hover:text-blue-300"
                >
                  <FiDownload className="mr-1" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}