import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle, Shield, Truck, Gift } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <MessageCircle className="w-16 h-16 text-primary mx-auto mb-6" />,
      title: "Shop through chat",
      description: "As simple as chatting with your bestie and get curated items"
    },
    {
      icon: <Shield className="w-16 h-16 text-primary mx-auto mb-6" />,
      title: "Secured payments and Cashbacks",
      description: "Processed by ISA Pay"
    },
    {
      icon: <Truck className="w-16 h-16 text-primary mx-auto mb-6" />,
      title: "Reliable door delivery",
      description: "Get reliable door delivery for items you ordered, same day deliveries are done by Fikisha"
    },
    {
      icon: <Gift className="w-16 h-16 text-primary mx-auto mb-6" />,
      title: "Buy gifts for friends and family",
      description: "Get suggestions and let ISA organize surprise delivery for you"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem("isa_onboarding_completed", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("isa_onboarding_completed", "true");
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Progress indicators */}
        <div className="flex justify-center mb-8 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                    ? "w-2 bg-primary/60" 
                    : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8 min-h-[300px] flex flex-col justify-center">
          {steps[currentStep].icon}
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {steps[currentStep].title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed px-4">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={handleNext}
            className="w-full h-12 text-lg font-medium"
            size="lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          )}
        </div>

        {/* Step counter */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;