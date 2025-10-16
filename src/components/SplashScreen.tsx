import { useEffect, useState } from 'react';
import myPlugLogo from '@/assets/myplug-logo.png';
import myPlugAnimatedVideo from '@/assets/myplug-logo-animated.mp4';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showAnimated, setShowAnimated] = useState(false);

  useEffect(() => {
    // Show static logo for 1.5 seconds
    const staticTimer = setTimeout(() => {
      setShowAnimated(true);
    }, 1500);

    // Show animated logo for 2 seconds, then complete
    const animatedTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(staticTimer);
      clearTimeout(animatedTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgb(246, 132, 4)' }}>
      <div className="relative">
        {showAnimated ? (
          <video 
            src={myPlugAnimatedVideo}
            autoPlay
            muted
            playsInline
            className="w-64 h-64 object-contain animate-scale-in"
          />
        ) : (
          <img 
            src={myPlugLogo}
            alt="MyPlug Logo" 
            className="w-64 h-64 object-contain animate-fade-in"
          />
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
