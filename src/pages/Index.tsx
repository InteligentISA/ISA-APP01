
import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import Welcome from "@/components/Welcome";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth' | 'dashboard'>('preloader');
  const [user, setUser] = useState<any>(null);

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
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
