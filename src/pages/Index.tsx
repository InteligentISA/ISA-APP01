
import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import Welcome from "@/components/Welcome";
import AuthWelcome from "@/components/AuthWelcome";
import AuthSignUp from "@/components/AuthSignUp";
import AuthSignIn from "@/components/AuthSignIn";
import Dashboard from "@/components/Dashboard";
import VendorDashboard from "@/components/VendorDashboard";
import AskISA from "@/components/AskISA";
import GiftsSection from "@/components/GiftsSection";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth-welcome' | 'auth-signup' | 'auth-signin' | 'dashboard' | 'vendor-dashboard' | 'askisa' | 'gifts'>('preloader');
  const [user, setUser] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    // Simulate preloader
    const timer = setTimeout(() => {
      setCurrentView('welcome');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setCurrentView('auth-welcome');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    if (userData.userType === 'vendor') {
      setCurrentView('vendor-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('welcome');
  };

  const handleNavigateToAskISA = () => {
    setCurrentView('askisa');
  };

  const handleBackToDashboard = () => {
    if (user?.userType === 'vendor') {
      setCurrentView('vendor-dashboard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleAddToCart = (product: any) => {
    setCartItems(prev => [...prev, product]);
  };

  const handleToggleLike = (productId: string) => {
    setLikedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleNavigateToGifts = () => {
    setCurrentView('gifts');
  };

  return (
    <div className="min-h-screen isa-gradient">
      {currentView === 'preloader' && <Preloader />}
      {currentView === 'welcome' && <Welcome onGetStarted={handleGetStarted} />}
      {currentView === 'auth-welcome' && (
        <AuthWelcome 
          onClose={() => setCurrentView('welcome')}
          onAuthSuccess={handleAuthSuccess}
          onNavigateToSignIn={() => setCurrentView('auth-signin')}
          onNavigateToSignUp={() => setCurrentView('auth-signup')}
        />
      )}
      {currentView === 'auth-signup' && (
        <AuthSignUp 
          onBack={() => setCurrentView('auth-welcome')}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {currentView === 'auth-signin' && (
        <AuthSignIn 
          onBack={() => setCurrentView('auth-welcome')}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onNavigateToAskISA={handleNavigateToAskISA}
          onNavigateToGifts={handleNavigateToGifts}
          onUserUpdate={handleUserUpdate}
        />
      )}
      {currentView === 'vendor-dashboard' && (
        <VendorDashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
      {currentView === 'askisa' && (
        <AskISA
          user={user}
          onBack={handleBackToDashboard}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          likedItems={likedItems}
        />
      )}
      {currentView === 'gifts' && (
        <GiftsSection
          user={user}
          onBack={handleBackToDashboard}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default Index;
