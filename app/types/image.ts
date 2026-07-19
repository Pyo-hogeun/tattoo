export interface UploadedImage {
  key: string
  url: string
  width: number
  height: number
  size: number
  mimeType: string
}

export interface ImageUploadError { message: string }
