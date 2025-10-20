import React from 'react';

interface LogoPreloaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function LogoPreloader({ 
  message = "MyPlug is loading...", 
  size = 'md',
  className = '' 
}: LogoPreloaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        {/* Blurred background circle */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 blur-sm opacity-60`}></div>
        
        {/* Logo container */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg`}>
          <img 
            src="/lovable-uploads/blurred-logo.png" 
            alt="MyPlug Logo" 
            className="w-3/4 h-3/4 object-contain"
            onError={(e) => {
              // If logo fails to load, show text instead
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-orange-600 font-bold text-sm">MyPlug</div>';
              }
            }}
          />
        </div>
        
        {/* Animated pulse ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-orange-400 animate-ping opacity-20`}></div>
      </div>
      
      {message && (
        <div className="text-center">
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        </div>
      )}
    </div>
  );
}
