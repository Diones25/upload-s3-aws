import axios from 'axios';
import { UploadResult, UploadOptions } from './types';

const api = axios.create({
  baseURL: '/api/upload',
});

export const uploadService = {
  async uploadSingleFile(file: File, options?: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options?.signedUrlExpires) {
      formData.append('signedUrlExpires', options.signedUrlExpires.toString());
    }
    
    const response = await api.post<UploadResult>('/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  async uploadMultipleFiles(files: File[], options?: UploadOptions): Promise<UploadResult[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options?.signedUrlExpires) {
      formData.append('signedUrlExpires', options.signedUrlExpires.toString());
    }
    
    const response = await api.post<UploadResult[]>('/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  async deleteFile(key: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/${key}`);
    return response.data;
  },
  
  async getSignedUrl(key: string, expiresIn?: number): Promise<{ url: string; expiresAt: Date }> {
    const params = expiresIn ? { expiresIn: expiresIn.toString() } : {};
    const response = await api.get<{ url: string; expiresAt: Date }>(`/signed-url/${key}`, { params });
    return response.data;
  },
};