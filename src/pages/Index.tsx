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
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import { UserProfileService } from "@/services/userProfileService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth-welcome' | 'auth-signup' | 'auth-signin' | 'vendor-signup' | 'dashboard' | 'vendor-dashboard' | 'askisa' | 'gifts'>('preloader');
  const [user, setUser] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [profileCompletionOpen, setProfileCompletionOpen] = useState(false);
  const [profileCompletionData, setProfileCompletionData] = useState<any>(null);
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Index useEffect - currentView:', currentView, 'authLoading:', authLoading, 'authUser:', authUser);
    console.log('Auth user details:', {
      id: authUser?.id,
      email: authUser?.email,
      user_metadata: authUser?.user_metadata
    });
    
    // Add a timeout fallback to prevent getting stuck
    const timeoutFallback = setTimeout(() => {
      console.log('Auth loading timeout - proceeding anyway');
      if (currentView === 'preloader') {
        setCurrentView('welcome');
      }
    }, 10000); // 10 second timeout
    
    // Wait for auth to load before proceeding
    if (authLoading) {
      console.log('Auth is still loading, waiting...');
      return () => clearTimeout(timeoutFallback);
    }

    // Clear timeout since auth is no longer loading
    clearTimeout(timeoutFallback);

    // If user is already authenticated, go to dashboard
    if (authUser) {
      console.log('User is authenticated, checking role for redirection');
      setUser(authUser);
      // Fetch user profile to check role and approval
      UserProfileService.getUserProfile(authUser.id).then(profile => {
        if (profile) {
          if (profile.role === 'admin') {
            window.location.href = '/admin';
            return;
          }
          if (profile.user_type === 'vendor') {
            // Check vendor approval status
            if (profile.status === 'approved' || profile.user_type === 'vendor_approved') {
              setCurrentView('vendor-dashboard');
              return;
            } else if (profile.status === 'rejected' || profile.user_type === 'vendor_rejected') {
              // Vendor rejected, show regular dashboard
              setCurrentView('dashboard');
              toast({
                title: 'Your application was rejected.',
                description: 'Please contact support for more information.',
                variant: 'destructive',
              });
              return;
            } else {
              // Vendor not approved, show regular dashboard
              setCurrentView('dashboard');
              toast({
                title: 'Your application is pending approval.',
                description: 'Please wait for the administrator to review your application.',
                variant: 'destructive',
              });
              return;
            }
          }
        }
        setCurrentView('dashboard');
      });
      return;
    }

    // Simulate preloader only if not authenticated
    console.log('Starting preloader timer - no authenticated user found');
    const timer = setTimeout(() => {
      console.log('Preloader timer completed, setting view to welcome');
      setCurrentView('welcome');
    }, 3000);
    
    return () => {
      console.log('Clearing preloader timer');
      clearTimeout(timer);
    };
  }, [authLoading, authUser]);

  const handleGetStarted = () => {
    setCurrentView('auth-welcome');
  };

  const handleAuthSuccess = (userData: any) => {
    // Format user data for Dashboard component
    const formattedUser = {
      ...userData,
      name: userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}`
        : userData.email?.split('@')[0] || 'User',
      avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email || 'user'}`,
      userType: userData.user_type || userData.userType || 'customer',
      status: userData.status || 'approved' // Default to approved for non-vendors
    };
    
    setUser(formattedUser);
    if (formattedUser.userType === 'vendor') {
      // Check if vendor is approved
      if (formattedUser.status === 'approved' || formattedUser.userType === 'vendor_approved') {
        setCurrentView('vendor-dashboard');
      } else if (formattedUser.status === 'rejected' || formattedUser.userType === 'vendor_rejected') {
        // Vendor rejected, show regular dashboard
        setCurrentView('dashboard');
        toast({
          title: 'Your application was rejected.',
          description: 'Please contact support for more information.',
          variant: 'destructive',
        });
      } else {
        // Vendor is pending approval, show regular dashboard with message
        setCurrentView('dashboard');
        toast({
          title: 'Your application is pending approval.',
          description: 'Please wait for the administrator to review your application.',
          variant: 'destructive',
        });
      }
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

  const handleToggleLike = (product: any) => {
    setLikedItems(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleNavigateToGifts = () => {
    setCurrentView('gifts');
  };

  const handleForgotPassword = () => {
    // For now, just show a toast or alert
    alert('Password reset functionality will be implemented soon.');
  };

  const isProfileComplete = (profile: any) => {
    return profile && profile.first_name && profile.last_name && profile.location && profile.gender && profile.phone_number;
  };

  const onGoogleAuthSuccess = async (email: string) => {
    // Fetch user profile by email
    const profile = await UserProfileService.getUserProfileByEmail(email);
    if (!profile || !isProfileComplete(profile)) {
      // For new Google users, create a basic profile structure
      const basicProfile = profile || {
        email: email,
        first_name: '',
        last_name: '',
        user_type: 'customer'
      };
      setProfileCompletionData(basicProfile);
      setProfileCompletionOpen(true);
    } else {
      handleAuthSuccess(profile);
    }
  };

  const handleProfileComplete = async (data: any) => {
    try {
      // Update user profile
      if (profileCompletionData && profileCompletionData.id) {
        await UserProfileService.updateUserProfile(profileCompletionData.id, {
          first_name: data.firstName,
          last_name: data.lastName,
          location: `${data.constituency}, ${data.county}`,
          gender: data.gender,
          phone_number: data.phoneNumber,
        });
        // Fetch updated profile
        const updated = await UserProfileService.getUserProfileByEmail(profileCompletionData.email);
        setProfileCompletionOpen(false);
        handleAuthSuccess(updated);
      } else {
        // For new users without a profile ID, create a formatted user object
        const newUser = {
          email: profileCompletionData.email,
          first_name: data.firstName,
          last_name: data.lastName,
          location: `${data.constituency}, ${data.county}`,
          gender: data.gender,
          phone_number: data.phoneNumber,
          user_type: 'customer'
        };
        setProfileCompletionOpen(false);
        handleAuthSuccess(newUser);
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      // Fallback: create a basic user object
      const fallbackUser = {
        email: profileCompletionData.email,
        first_name: data.firstName,
        last_name: data.lastName,
        user_type: 'customer'
      };
      setProfileCompletionOpen(false);
      handleAuthSuccess(fallbackUser);
    }
  };

  return (
    <div className="min-h-screen">
      {currentView === 'preloader' && <Preloader />}
      {currentView === 'welcome' && <Welcome onGetStarted={handleGetStarted} />}
      {currentView === 'auth-welcome' && (
        <AuthWelcome 
          onClose={() => setCurrentView('welcome')}
          onAuthSuccess={handleAuthSuccess}
          onNavigateToSignIn={() => setCurrentView('auth-signin')}
          onNavigateToSignUp={() => setCurrentView('auth-signup')}
          onNavigateToVendorSignUp={() => setCurrentView('vendor-signup')}
          onGoogleAuthSuccess={onGoogleAuthSuccess}
        />
      )}
      {currentView === 'auth-signup' && (
        <AuthSignUp 
          onBack={() => setCurrentView('auth-welcome')}
          onAuthSuccess={handleAuthSuccess}
          userType="customer"
        />
      )}
      {currentView === 'vendor-signup' && (
        <AuthSignUp 
          onBack={() => setCurrentView('auth-welcome')}
          onAuthSuccess={handleAuthSuccess}
          userType="vendor"
        />
      )}
      {currentView === 'auth-signin' && (
        <AuthSignIn 
          onBack={() => setCurrentView('auth-welcome')}
          onAuthSuccess={handleAuthSuccess}
          onForgotPassword={handleForgotPassword}
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
          onToggleLike={handleToggleLike}
          likedItems={likedItems}
        />
      )}
      {profileCompletionOpen && (
        <ProfileCompletionModal
          isOpen={profileCompletionOpen}
          initialData={profileCompletionData}
          onComplete={handleProfileComplete}
          onClose={() => setProfileCompletionOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
