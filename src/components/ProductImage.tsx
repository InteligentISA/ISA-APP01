import React from 'react';
import { useImageFallback } from '@/hooks/useImageFallback';

interface ProductImageProps {
  mainImage?: string;
  fallbackImages?: string[];
  alt: string;
  className?: string;
  placeholderImage?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  mainImage,
  fallbackImages = [],
  alt,
  className = "w-full h-full object-cover",
  placeholderImage = '/placeholder.svg'
}) => {
  const {
    currentImage,
    imageError,
    isLoading,
    handleImageError,
    handleImageLoad,
    hasMoreImages
  } = useImageFallback({
    mainImage,
    fallbackImages,
    placeholderImage
  });

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
      <img
        src={currentImage}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {imageError && !hasMoreImages && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-slate-600">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
