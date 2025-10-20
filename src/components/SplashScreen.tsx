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




import { useEffect } from 'react';
import myPlugLogo from '@/assets/myplug-logo.png';
import onboardingChat from "@/assets/onboarding-chat.png";
import onboardingPayment from "@/assets/onboarding-payment.png";
import onboardingDelivery from "@/assets/onboarding-delivery.png";
import onboardingGifts from "@/assets/onboarding-gifts.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  useEffect(() => {
    // Preload onboarding images
    const imagesToPreload = [
      onboardingChat,
      onboardingPayment,
      onboardingDelivery,
      onboardingGifts
    ];

    const preloadPromises = imagesToPreload.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    // Wait for all images to load, then show the app after 2 seconds
    Promise.all(preloadPromises)
      .then(() => {
        const timer = setTimeout(() => {
          onComplete();
        }, 2000);
        return () => clearTimeout(timer);
      })
      .catch(() => {
        // If images fail to load, still proceed after timeout
        const timer = setTimeout(() => {
          onComplete();
        }, 2000);
        return () => clearTimeout(timer);
      });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgb(246, 132, 4)' }}>
      <div className="relative">
        <img 
          src={myPlugLogo}
          alt="MyPlug Logo" 
          className="w-64 h-64 object-contain animate-pulse-blur"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
