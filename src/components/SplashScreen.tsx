import React, { useEffect, useState, useCallback } from 'react';
import myPlugLogo from '@/assets/myplug-logo.png';
import { supabase } from '@/integrations/supabase/client';

interface SplashScreenProps {
  userName?: string | null; 
  onComplete: (destination: 'walkthrough' | 'dashboard') => void;
}

// Utility function to introduce a pause
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SplashScreen = ({ onComplete, userName }: SplashScreenProps) => {
  // STATE MACHINE: 0 = Loading/Logo In, 1 = Fading Logo Out, 2+ = Message Steps
  const [step, setStep] = useState(0); 
  const [message, setMessage] = useState('');
  const [messageOpacity, setMessageOpacity] = useState(0); 
  const [logoOpacity, setLogoOpacity] = useState(1); // Start logo at full opacity
  const [isFirstTime, setIsFirstTime] = useState(true);

  // --- Core Sequence Logic (The Brain) ---
  const startSequence = useCallback(async (firstTime: boolean) => {
    // 1. Initial Load State & Logo Hold
    await delay(1000); // Hold the logo on screen for 1 second (simulates "fully loaded")

    // 2. Logo Fade-Out (Transition to Messages)
    setLogoOpacity(0);
    await delay(500); // Wait for logo fade-out animation to complete (0.5s transition)

    // Check which flow to run after the logo is gone
    if (firstTime) {
      // --- SCENARIO A: FIRST-TIME USER ---

      // A1. Initial Welcome
      setStep(2);
      setMessage('Jambo, welcome to MyPlug!');
      setMessageOpacity(1);
      await delay(1500); // Message displayed duration
      setMessageOpacity(0);
      await delay(500); // Fade-out duration

      // A2. Value Proposition
      setStep(3);
      setMessage("A leading 'Shop Through Chat' platform.");
      setMessageOpacity(1);
      await delay(2000); // Message displayed duration
      setMessageOpacity(0);
      await delay(500); // Fade-out duration

      // A3. Complete and Transition
      localStorage.setItem('has_completed_onboarding', 'true');
      onComplete('walkthrough');
      
    } else {
      // --- SCENARIO B: RETURNING USER ---
      const name = userName || 'mteja';

      // B1. Personalized Welcome
      setStep(4);
      setMessage(`Jambo ${name}, welcome back to MyPlug!`);
      setMessageOpacity(1);
      await delay(1500); // Message displayed duration
      setMessageOpacity(0);
      await delay(500); // Fade-out duration

      // B2. Quick Call to Action
      setStep(5);
      setMessage('Happy shopping.');
      setMessageOpacity(1);
      await delay(1500); // Message displayed duration
      setMessageOpacity(0);
      await delay(500); // Fade-out duration

      // B3. Complete and Transition
      onComplete('dashboard');
    }
  }, [userName, onComplete]);


  // --- Initialization Effect (The Setup) ---
  useEffect(() => {
    const checkUserAndStart = async () => {
      // First, check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session;
      
      if (isLoggedIn) {
        // User is logged in - skip splash and go directly to dashboard
        console.log('User is logged in, skipping splash screen');
        onComplete('dashboard');
        return;
      }
      
      // User is not logged in - proceed with normal splash screen logic
      const hasCompleted = localStorage.getItem('has_completed_onboarding');
      const firstTime = !hasCompleted;
      setIsFirstTime(firstTime);

      // Start the sequence
      startSequence(firstTime);
    };

    checkUserAndStart();
  }, [startSequence, onComplete]);


  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ 
        backgroundColor: '#ff7a00',
        color: 'white',
        fontFamily: 'Poppins, sans-serif',
        textAlign: 'center'
      }}
    >
      {/* This div centers the content. The logic below determines whether to show 
        the Logo or the Message text based on the sequence step.
      */}
      <div className="flex items-center justify-center min-h-[128px]">
        {/* LOGO: Visible only during the initial load and logo hold phase */}
        <img
          src={myPlugLogo}
          alt="MyPlug Logo"
          className="w-32 h-32 object-contain absolute" // Use absolute to overlap it with the message area
          style={{
            opacity: logoOpacity,
            // Transition controls the fade-out speed of the logo
            transition: 'opacity 0.5s ease-in-out' 
          }}
        />
        
        {/* MESSAGE: Appears when the logo is fading out or gone */}
        <h2 
          className="text-xl font-medium max-w-[90%] leading-relaxed"
          style={{
            opacity: messageOpacity,
            // Transition controls the FADE-IN and FADE-OUT speed of the message
            transition: 'opacity 0.5s ease-in-out' 
          }}
        >
          {message}
        </h2>
      </div>
    </div>
  );
};

export default SplashScreen;


