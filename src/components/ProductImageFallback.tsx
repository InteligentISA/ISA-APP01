import React, { useState, useEffect } from 'react';
import ProductImageLoader from './ProductImage';

interface ProductImageFallbackProps {
  images: string[];
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ProductImageFallback({
  images,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad
}: ProductImageFallbackProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filter out empty/null images
  const validImages = images.filter(img => img && img.trim() !== '');
  
  // If no valid images, just show placeholder
  if (validImages.length === 0) {
    return (
      <ProductImageLoader
        src={fallbackSrc}
        alt={alt}
        className={className}
        fallbackSrc={fallbackSrc}
        onError={onError}
        onLoad={onLoad}
      />
    );
  }
  
  // If only one image, use ProductImageLoader directly
  if (validImages.length === 1) {
    return (
      <ProductImageLoader
        src={validImages[0]}
        alt={alt}
        className={className}
        fallbackSrc={fallbackSrc}
        onError={onError}
        onLoad={onLoad}
      />
    );
  }
  
  // Multiple images - try them one by one
  const handleImageError = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < validImages.length) {
      setCurrentImageIndex(nextIndex);
    } else {
      // All images failed, use fallback
      setCurrentImageIndex(-1); // Special index for fallback
    }
  };
  
  const currentSrc = currentImageIndex === -1 ? fallbackSrc : validImages[currentImageIndex];
  
  return (
    <ProductImageLoader
      src={currentSrc}
      alt={alt}
      className={className}
      fallbackSrc={fallbackSrc}
      onError={currentImageIndex === -1 ? onError : handleImageError}
      onLoad={onLoad}
    />
  );
}
