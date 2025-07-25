import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: string[];
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ images, className = "" }) => {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;

  const goTo = (idx: number) => {
    if (idx < 0) setCurrent(images.length - 1);
    else if (idx >= images.length) setCurrent(0);
    else setCurrent(idx);
  };

  return (
    <div className={`relative w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden ${className}`}>
      <img
        src={images[current]}
        alt={`Product image ${current + 1}`}
        className="w-full h-full object-contain transition-all duration-300 select-none"
        draggable={false}
        onTouchStart={e => (e.currentTarget as any)._touchStartX = e.touches[0].clientX}
        onTouchEnd={e => {
          const startX = (e.currentTarget as any)._touchStartX;
          const endX = e.changedTouches[0].clientX;
          if (startX - endX > 40) goTo(current + 1);
          if (endX - startX > 40) goTo(current - 1);
        }}
      />
      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
            onClick={() => goTo(current - 1)}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
            onClick={() => goTo(current + 1)}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === current ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'} transition-all`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
