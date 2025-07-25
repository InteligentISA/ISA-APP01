import { useState, useEffect } from "react";
import Preloader from "@/components/Preloader";
import Welcome from "@/components/Welcome";
import AuthWelcome from "@/components/AuthWelcome";
import AuthSignUp from "@/components/AuthSignUp";
import AuthSignIn from "@/components/AuthSignIn";
import Dashboard from "@/components/Dashboard";
import VendorDashboard from "@/components/VendorDashboard";
import PendingApproval from "@/components/PendingApproval";
import AskISA from "@/components/AskISA";
import GiftsSection from "@/components/GiftsSection";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import MyShipping from './MyShipping';
import { UserProfileService } from "@/services/userProfileService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { isPremiumUser } from "@/lib/utils";
import TierUpgradeModal from "@/components/TierUpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { MpesaService } from "@/services/mpesaService";
import { AirtelService } from "@/services/airtelService";

const Index = () => {
  const [currentView, setCurrentView] = useState<'preloader' | 'welcome' | 'auth-welcome' | 'auth-signup' | 'auth-signin' | 'vendor-signup' | 'dashboard' | 'vendor-dashboard' | 'pending-approval' | 'askisa' | 'gifts' | 'forgot-password'>('preloader');
  const [user, setUser] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [profileCompletionOpen, setProfileCompletionOpen] = useState(false);
  const [profileCompletionData, setProfileCompletionData] = useState<any>(null);
  const { user: authUser, loading: authLoading, userProfile } = useAuth();
  const { toast } = useToast();
  const [resetEmail, setResetEmail] = useState("");
  const [showTierModal, setShowTierModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<"weekly" | "monthly" | "annual" | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

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
              // Vendor not approved, show pending approval page
              setCurrentView('pending-approval');
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

  // Automatically prompt profile completion for any logged-in user with incomplete profile
  /*
  useEffect(() => {
    if (!authLoading && authUser) {
      if (!userProfile || !isProfileComplete(userProfile)) {
        setProfileCompletionData({
          email: authUser.email,
          first_name: userProfile?.first_name || "",
          last_name: userProfile?.last_name || "",
          user_type: userProfile?.user_type || "customer"
        });
        setProfileCompletionOpen(true);
      }
    }
  }, [authLoading, authUser, userProfile]);
  */

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
        // Vendor is pending approval, show pending approval page
        setCurrentView('pending-approval');
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
    if (!isPremiumUser(user)) {
      setShowTierModal(true);
      return;
    }
    setCurrentView('gifts');
  };

  const handleUpgrade = async (plan: "weekly" | "monthly" | "annual") => {
    setPendingPlan(plan);
    // Here, you would trigger your payment flow (e.g., Mpesa, Airtel, Stripe, etc.)
    // For demo, we'll just update the plan in Supabase directly
    // Set plan_expiry based on plan
    let expiry = new Date();
    if (plan === "weekly") expiry.setDate(expiry.getDate() + 7);
    if (plan === "monthly") expiry.setMonth(expiry.getMonth() + 1);
    if (plan === "annual") expiry.setFullYear(expiry.getFullYear() + 1);
    await supabase.from('profiles').update({ plan, plan_expiry: expiry.toISOString().slice(0, 10) }).eq('id', user.id);
    // Optionally, refetch user profile here
    setUser({ ...user, plan, plan_expiry: expiry.toISOString().slice(0, 10) });
    setShowTierModal(false);
    setPendingPlan(null);
    setCurrentView('gifts');
  };

  const handleRefreshApprovalStatus = async () => {
    if (user?.id) {
      try {
        const profile = await UserProfileService.getUserProfile(user.id);
        if (profile) {
          const formattedUser = {
            ...profile,
            name: profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile.email?.split('@')[0] || 'User',
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email || 'user'}`,
            userType: profile.user_type || 'customer',
            status: profile.status || 'approved'
          };
          
          setUser(formattedUser);
          
          if (formattedUser.userType === 'vendor') {
            if (formattedUser.status === 'approved') {
              setCurrentView('vendor-dashboard');
              toast({
                title: 'Application Approved!',
                description: 'Welcome to the vendor dashboard!',
              });
            } else if (formattedUser.status === 'rejected') {
              setCurrentView('dashboard');
              toast({
                title: 'Application Rejected',
                description: 'Please contact support for more information.',
                variant: 'destructive',
              });
            } else {
              // Still pending
              toast({
                title: 'Still Pending',
                description: 'Your application is still under review.',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing approval status:', error);
        toast({
          title: 'Error',
          description: 'Failed to check approval status.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
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

  const handlePayAndUpgrade = async (plan, paymentMethod, phoneNumber) => {
    setUpgradeLoading(true);
    let paymentResponse;
    try {
      if (paymentMethod === "mpesa") {
        paymentResponse = await MpesaService.initiatePayment({
          phoneNumber,
          amount: plan === "weekly" ? 99 : plan === "monthly" ? 499 : 4500,
          orderId: user.id + "-" + Date.now(),
          description: `ISA Premium ${plan} plan`
        });
      } else {
        paymentResponse = await AirtelService.initiatePayment({
          phoneNumber,
          amount: plan === "weekly" ? 99 : plan === "monthly" ? 499 : 4500,
          orderId: user.id + "-" + Date.now(),
          description: `ISA Premium ${plan} plan`
        });
      }
      if (paymentResponse.success) {
        let expiry = new Date();
        if (plan === "weekly") expiry.setDate(expiry.getDate() + 7);
        if (plan === "monthly") expiry.setMonth(expiry.getMonth() + 1);
        if (plan === "annual") expiry.setFullYear(expiry.getFullYear() + 1);
        await supabase.from('profiles').update({ plan, plan_expiry: expiry.toISOString().slice(0, 10) }).eq('id', user.id);
        setUser({ ...user, plan, plan_expiry: expiry.toISOString().slice(0, 10) });
        setShowTierModal(false);
        toast({
          title: "Upgrade Successful!",
          description: "You are now a premium user. Enjoy all features!",
        });
        setCurrentView('gifts');
      } else {
        toast({
          title: "Payment Failed",
          description: paymentResponse.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: err.message || "An error occurred during payment.",
        variant: "destructive"
      });
    } finally {
      setUpgradeLoading(false);
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
          onNavigateToVendorSignUp={() => setCurrentView('auth-signup')}
          onGoogleAuthSuccess={onGoogleAuthSuccess}
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
      {currentView === 'pending-approval' && (
        <PendingApproval 
          user={user} 
          onLogout={handleLogout}
          onRefresh={handleRefreshApprovalStatus}
        />
      )}
      {currentView === 'askisa' && (
        <AskISA
          user={user}
          onBack={handleBackToDashboard}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          likedItems={likedItems}
          maxChats={isPremiumUser(user) ? 100 : 20}
          onUpgrade={() => setShowTierModal(true)}
        />
      )}
      {currentView === 'gifts' && (
        isPremiumUser(user) ? (
          <GiftsSection
            user={user}
            onBack={handleBackToDashboard}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            likedItems={likedItems}
          />
        ) : null // Modal is shown instead
      )}
      {currentView === 'my-shipping' && (
        <MyShipping />
      )}
      {currentView === 'forgot-password' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="light">
            <div className="w-full max-w-md bg-white backdrop-blur-sm border-gray-200 max-h-[90vh] overflow-y-auto rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Reset Password</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { error } = await useAuth().resetPassword(resetEmail);
                  if (error) {
                    toast({
                      title: 'Reset Failed',
                      description: error.message,
                      variant: 'destructive',
                    });
                  } else {
                    toast({
                      title: 'Reset Email Sent',
                      description: 'Check your email for password reset instructions.',
                    });
                    setCurrentView('auth-signin');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="reset-email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold"
                >
                  Send Reset Email
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-blue-600 hover:underline text-sm"
                  onClick={() => setCurrentView('auth-signin')}
                >
                  Back to Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/*
      {profileCompletionOpen && (
        <ProfileCompletionModal
          isOpen={profileCompletionOpen}
          initialData={profileCompletionData}
          onComplete={handleProfileComplete}
          onClose={() => setProfileCompletionOpen(false)}
        />
      )}
      */}
      <TierUpgradeModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        onPay={handlePayAndUpgrade}
        loading={upgradeLoading}
      />
    </div>
  );
};

export default Index;
