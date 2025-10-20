import React, { useState } from 'react';
import LogoPreloader from './LogoPreloader';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ProductImageLoader({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  onError,
  onLoad
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <LogoPreloader size="md" message="" />
        </div>
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center bg-gray-100 rounded h-full min-h-[200px]">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}