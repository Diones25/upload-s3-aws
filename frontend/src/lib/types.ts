export interface UploadResult {
  url: string;          
  key: string;          
  filename: string;     
  mimetype: string;    
  size: number;         
  bucket: string;       
  etag: string;         
  signedUrlExpires?: Date; 
}

export interface UploadOptions {
  folder?: string;
  signedUrlExpires?: number; 
}