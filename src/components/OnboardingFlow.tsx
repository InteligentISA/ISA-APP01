import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import onboardingChat from "@/assets/onboarding-chat.png";
import onboardingPayment from "@/assets/onboarding-payment.png";
import onboardingDelivery from "@/assets/onboarding-delivery.png";
import onboardingGifts from "@/assets/onboarding-gifts.jpg";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const steps = [
    {
      image: onboardingChat,
      title: "Shop through chat",
      description: "As simple as chatting with your bestie and get curated items"
    },
    {
      image: onboardingPayment,
      title: "Secured payments, Escrow services and Cashbacks",
      description: "Processed by MyPlug Pay"
    },
    {
      image: onboardingDelivery,
      title: "Reliable door delivery",
      description: "Get reliable door delivery for items you ordered, same day deliveries are powered by Fikisha"
    },
    {
      image: onboardingGifts,
      title: "Buy gifts for friends and family",
      description: "Get suggestions and let MyPlug organize surprise delivery to your loved one"
    }
  ];

  // Preload all images before displaying the onboarding flow
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = steps.map((step) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = step.image;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        // Even if preloading fails, show the onboarding flow
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []); // Empty dependency array means this runs once on mount

  // Smoothly fade out the loader overlay when images finish preloading
  useEffect(() => {
    if (!imagesLoaded) return;
    setIsFading(true);
    const timeoutId = setTimeout(() => setShowLoader(false), 400);
    return () => clearTimeout(timeoutId);
  }, [imagesLoaded]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem("myplug_onboarding_completed", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("myplug_onboarding_completed", "true");
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative flex items-center justify-center p-4">
      {/* Loading overlay with subtle orange animated waves */}
      {showLoader && (
        <div
          className={`absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-orange-50 transition-opacity duration-500 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Animated SVG waves background */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFEDD5" />
                <stop offset="100%" stopColor="#FED7AA" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="1440" height="900" fill="url(#grad)" />
            <g opacity="0.6">
              <path fill="#FDBA74">
                <animate
                  attributeName="d"
                  dur="6s"
                  repeatCount="indefinite"
                  values="M0,700 C300,650 450,750 720,700 C980,650 1150,750 1440,700 L1440,900 L0,900 Z; M0,720 C300,770 450,670 720,720 C980,770 1150,670 1440,720 L1440,900 L0,900 Z; M0,700 C300,650 450,750 720,700 C980,650 1150,750 1440,700 L1440,900 L0,900 Z"
                />
              </path>
            </g>
            <g opacity="0.4">
              <path fill="#FB923C">
                <animate
                  attributeName="d"
                  dur="8s"
                  repeatCount="indefinite"
                  values="M0,760 C260,740 500,820 720,780 C980,740 1180,820 1440,780 L1440,900 L0,900 Z; M0,780 C260,820 500,740 720,800 C980,860 1180,740 1440,800 L1440,900 L0,900 Z; M0,760 C260,740 500,820 720,780 C980,740 1180,820 1440,780 L1440,900 L0,900 Z"
                />
              </path>
            </g>
          </svg>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-300 border-t-transparent mx-auto mb-4"></div>
            <p className="text-orange-700 font-medium">Please wait...</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-lg mx-auto">
        {/* Progress indicators */}
        <div className="flex justify-center mb-12 space-x-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all duration-500 ease-in-out ${
                index === currentStep 
                  ? "w-12 bg-primary shadow-lg" 
                  : index < currentStep 
                    ? "w-3 bg-primary/70" 
                    : "w-3 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-12">
          {/* Image Container */}
          <div className="mb-8 relative overflow-hidden rounded-2xl shadow-2xl bg-card border">
            <img
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              className="w-full h-80 object-cover transition-all duration-700 ease-in-out transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          {/* Text Content */}
          <div className="space-y-4 px-6">
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {steps[currentStep].title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-4 px-6">
          <Button 
            onClick={handleNext}
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            size="lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <ChevronRight className="w-6 h-6 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full h-12 text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              Skip
            </Button>
          )}
        </div>

        {/* Step counter */}
        <div className="text-center mt-8 text-sm text-muted-foreground font-medium">
          {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;