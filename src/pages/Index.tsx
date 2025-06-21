import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import Welcome from "@/components/Welcome";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import AskISA from "@/components/AskISA";
import GiftsSection from "@/components/GiftsSection";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth' | 'dashboard' | 'askisa' | 'gifts'>('preloader');
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
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('welcome');
  };

  const handleNavigateToAskISA = () => {
    setCurrentView('askisa');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
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
      {currentView === 'auth' && (
        <AuthModal 
          isOpen={true} 
          onClose={() => setCurrentView('welcome')}
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
