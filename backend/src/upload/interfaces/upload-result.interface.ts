export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
  bucket: string;
  etag: string;
}