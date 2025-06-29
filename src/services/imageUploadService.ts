import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 500 * 1024; // 500KB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private static readonly RECOMMENDED_DIMENSIONS = { width: 400, height: 400 };

  // Validate image file
  static validateImage(file: File): ImageValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024}KB. Current size: ${(file.size / 1024).toFixed(1)}KB`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Please use: ${this.ALLOWED_TYPES.join(', ')}`
      };
    }

    return { isValid: true };
  }

  // Compress and resize image
  static async compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = this.calculateDimensions(img.width, img.height);
        
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          0.8 // Quality setting (0.8 = 80% quality)
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Calculate optimal dimensions
  private static calculateDimensions(originalWidth: number, originalHeight: number) {
    const maxWidth = this.RECOMMENDED_DIMENSIONS.width;
    const maxHeight = this.RECOMMENDED_DIMENSIONS.height;

    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    return { width, height };
  }

  // Upload image to Supabase Storage
  static async uploadImage(file: File, folder: string = 'products'): Promise<ImageUploadResult> {
    try {
      // Validate file
      const validation = this.validateImage(file);
      if (!validation.isValid) {
        return { url: '', path: '', error: validation.error };
      }

      // Compress image
      const compressedBlob = await this.compressImage(file);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      const filePath = `${folder}/${filename}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { url: '', path: '', error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      return {
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Delete image from Supabase Storage
  static async deleteImage(filePath: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      return { error: error?.message };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Delete failed' };
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(files: File[], folder: string = 'products'): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  // Get image dimensions
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to get image dimensions'));
      img.src = URL.createObjectURL(file);
    });
  }
} 