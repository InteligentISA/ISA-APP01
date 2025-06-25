
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PreloaderProps {
  onContinue: () => void;
}

const Preloader = ({ onContinue }: PreloaderProps) => {
  const [showContinue, setShowContinue] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          setShowContinue(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-300/15 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="text-center z-10 px-8">
        {/* ISA Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              ISA
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            Welcome to ISA
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light">
            Your Intelligent Shopping Assistant
          </p>
        </div>

        {/* Loading progress */}
        <div className="mb-8">
          <div className="w-64 mx-auto bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white to-cyan-200 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-white/80 mt-3 text-sm">
            {loadingProgress < 100 ? 'Initializing your shopping experience...' : 'Ready to shop smarter!'}
          </p>
        </div>

        {/* Continue button */}
        {showContinue && (
          <div className="animate-fade-in">
            <Button
              onClick={onContinue}
              className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Continue to ISA
            </Button>
          </div>
        )}
      </div>

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-700"></div>
      <div className="absolute top-32 right-16 w-3 h-3 bg-cyan-300/40 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-20 left-20 w-5 h-5 bg-purple-300/30 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-32 right-32 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-500"></div>
    </div>
  );
};

export default Preloader;
