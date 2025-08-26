import { useState, useEffect } from 'react';

interface UseImageFallbackProps {
  mainImage?: string;
  fallbackImages?: string[];
  placeholderImage?: string;
}

export const useImageFallback = ({
  mainImage,
  fallbackImages = [],
  placeholderImage = '/placeholder.svg'
}: UseImageFallbackProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create array of images to try in order of preference
  const imageQueue = [
    mainImage,
    ...fallbackImages,
    placeholderImage
  ].filter(Boolean) as string[];

  const currentImage = imageQueue[currentImageIndex];

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    
    // Try next image in queue
    if (currentImageIndex < imageQueue.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageError(false);
      setIsLoading(true);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  // Reset when main image changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
    setIsLoading(true);
  }, [mainImage]);

  return {
    currentImage,
    imageError,
    isLoading,
    handleImageError,
    handleImageLoad,
    hasMoreImages: currentImageIndex < imageQueue.length - 1
  };
};
