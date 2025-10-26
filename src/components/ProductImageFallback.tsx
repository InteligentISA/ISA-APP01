import React, { useState, useEffect } from 'react';
import ProductImageLoader from './ProductImage';

interface ProductImageFallbackProps {
  images: string[];
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  onClick?: () => void;
}

export default function ProductImageFallback({
  images,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad,
  onClick
}: ProductImageFallbackProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  // Filter out empty/null images
  const validImages = images.filter(img => img && img.trim() !== '');
  
  // Reset state when images prop changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setErrorCount(0);
  }, [images.join(',')]); // Reset when images array changes
  
  // If no valid images, just show placeholder
  if (validImages.length === 0) {
    return (
      <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
        <ProductImageLoader
          src={fallbackSrc}
          alt={alt}
          className={className}
          fallbackSrc={fallbackSrc}
          onError={onError}
          onLoad={onLoad}
        />
      </div>
    );
  }
  
  // If only one image, use ProductImageLoader directly
  if (validImages.length === 1) {
    return (
      <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
        <ProductImageLoader
          src={validImages[0]}
          alt={alt}
          className={className}
          fallbackSrc={fallbackSrc}
          onError={onError}
          onLoad={onLoad}
        />
      </div>
    );
  }
  
  // Multiple images - try them one by one
  const handleImageError = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < validImages.length) {
      setCurrentImageIndex(nextIndex);
      setErrorCount(prev => prev + 1);
    } else {
      // All images failed, call onError
      onError?.();
    }
  };
  
  const currentSrc = validImages[currentImageIndex];
  
  return (
    <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <ProductImageLoader
        src={currentSrc}
        alt={alt}
        className={className}
        fallbackSrc={fallbackSrc}
        onError={handleImageError}
        onLoad={onLoad}
      />
    </div>
  );
}
