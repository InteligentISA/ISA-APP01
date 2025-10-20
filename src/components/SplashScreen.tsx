// import { useEffect } from 'react';
// import myPlugLogo from '@/assets/myplug-logo.png';
// import onboardingChat from "@/assets/onboarding-chat.png";
// import onboardingPayment from "@/assets/onboarding-payment.png";
// import onboardingDelivery from "@/assets/onboarding-delivery.png";
// import onboardingGifts from "@/assets/onboarding-gifts.jpg";
// import LogoPreloader from './LogoPreloader';

// interface SplashScreenProps {
//   onComplete: () => void;
// }

// const SplashScreen = ({ onComplete }: SplashScreenProps) => {
//   useEffect(() => {
//     // Preload onboarding images
//     const imagesToPreload = [
//       onboardingChat,
//       onboardingPayment,
//       onboardingDelivery,
//       onboardingGifts
//     ];

//     const preloadPromises = imagesToPreload.map((src) => {
//       return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.onload = resolve;
//         img.onerror = reject;
//         img.src = src;
//       });
//     });

//     // Wait for all images to load, then show the app after 2 seconds
//     Promise.all(preloadPromises)
//       .then(() => {
//         const timer = setTimeout(() => {
//           onComplete();
//         }, 2000);
//         return () => clearTimeout(timer);
//       })
//       .catch(() => {
//         // If images fail to load, still proceed after timeout
//         const timer = setTimeout(() => {
//           onComplete();
//         }, 2000);
//         return () => clearTimeout(timer);
//       });
//   }, [onComplete]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgb(246, 132, 4)' }}>
//       <div className="flex flex-col items-center space-y-6">
//         <img 
//           src="/lovable-uploads/main-logo.png" 
//           alt="MyPlug Main Logo" 
//           className="w-64 h-64 object-contain"
//         />
//         <div className="text-center">
//           <p className="text-white text-lg animate-pulse">Welcome to MyPlug...</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SplashScreen;




import React, { useEffect, useState } from 'react';
import myPlugLogo from '@/assets/myplug-logo.png';

interface SplashScreenProps {
  onComplete: (destination: 'walkthrough' | 'dashboard') => void;
  userName?: string;
}

const SplashScreen = ({ onComplete, userName }: SplashScreenProps) => {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(true);
  const [blur, setBlur] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('has_completed_onboarding');
    setIsFirstTime(!hasCompleted);
    setTimeout(() => setBlur(false), 1000); // remove blur after loading
  }, []);

  useEffect(() => {
    if (blur) return;

    if (isFirstTime) {
      // Scenario A - First time user
      setMessage('Hello, welcome to MyPlug!');
      setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setMessage("A leading 'Shop Through Chat' platform.");
          setShow(true);
          setTimeout(() => {
            localStorage.setItem('has_completed_onboarding', 'true');
            onComplete('walkthrough');
          }, 2500);
        }, 500);
      }, 1500);
    } else {
      // Scenario B - Returning user
      setMessage(`Hello ${userName || 'there'}, welcome back to MyPlug!`);
      setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setMessage('Happy shopping.');
          setShow(true);
          setTimeout(() => onComplete('dashboard'), 2000);
        }, 500);
      }, 1500);
    }
  }, [blur, isFirstTime, userName, onComplete]);

  return (
    <div className="splash-container">
      <img
        src={myPlugLogo}
        alt="MyPlug Logo"
        className={`splash-logo ${blur ? 'blurred' : 'clear'}`}
      />
      <h2 className={`splash-message ${show ? 'fade-in' : 'fade-out'}`}>{message}</h2>
    </div>
  );
};

export default SplashScreen;
