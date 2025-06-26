
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
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth-welcome' | 'auth-signup' | 'auth-signin' | 'dashboard' | 'vendor-dashboard' | 'askisa' | 'gifts'>('preloader');
  const [user, setUser] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { user: authUser, loading } = useAuth();

  // Handle authentication state changes
  useEffect(() => {
    if (!loading && authUser) {
      setUser(authUser);
      // Check if user has vendor role in metadata
      if (authUser.user_metadata?.userType === 'vendor') {
        setCurrentView('vendor-dashboard');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [authUser, loading]);

  const handlePreloaderComplete = () => {
    setCurrentView('welcome');
  };

  const handleGetStarted = () => {
    setCurrentView('auth-welcome');
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    if (userData.userType === 'vendor' || userData.user_metadata?.userType === 'vendor') {
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
    if (user?.userType === 'vendor' || user?.user_metadata?.userType === 'vendor') {
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

  // If user is authenticated, show dashboard directly
  if (!loading && authUser && currentView === 'preloader') {
    return authUser.user_metadata?.userType === 'vendor' ? (
      <VendorDashboard user={authUser} onLogout={handleLogout} />
    ) : (
      <Dashboard 
        user={authUser} 
        onLogout={handleLogout} 
        onNavigateToAskISA={handleNavigateToAskISA}
        onNavigateToGifts={handleNavigateToGifts}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen isa-gradient">
      {currentView === 'preloader' && <Preloader onContinue={handlePreloaderComplete} />}
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
          onForgotPassword={() => {
            // Handle forgot password - could show a modal or navigate to reset page
            console.log('Forgot password clicked - implement password reset');
          }}
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
