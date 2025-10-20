
import { useEffect } from "react";

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome = ({ onGetStarted }: WelcomeProps) => {
  useEffect(() => {
    // Automatically redirect to onboarding when Welcome component loads
    onGetStarted();
  }, [onGetStarted]);

  return null; // Return nothing since we're redirecting immediately
};

export default Welcome;
