import { useState } from "react";
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

  const steps = [
    {
      image: onboardingChat,
      title: "Shop through chat",
      description: "As simple as chatting with your bestie and get curated items"
    },
    {
      image: onboardingPayment,
      title: "Secured payments and Cashbacks",
      description: "Processed by MyPlug Pay"
    },
    {
      image: onboardingDelivery,
      title: "Reliable door delivery",
      description: "Get reliable door delivery for items you ordered, same day deliveries are done by Fikisha"
    },
    {
      image: onboardingGifts,
      title: "Buy gifts for friends and family",
      description: "Get suggestions and let MyPlug organize surprise delivery for you"
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
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