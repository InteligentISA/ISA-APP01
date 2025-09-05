import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail, Lock, User, Chrome, MapPin, Calendar, Phone, ArrowLeft, Building, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import VendorApplicationForm from "./VendorApplicationForm";
import VendorTraining from "./VendorTraining";
import { HCaptchaComponent } from "@/components/ui/hcaptcha";

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthenticationModal = ({ isOpen, onClose }: AuthenticationModalProps) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'reset' | 'vendor-signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showVendorApplication, setShowVendorApplication] = useState(false);
  const [showVendorTraining, setShowVendorTraining] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();
  const { toast } = useToast();

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    location: "",
    phoneNumber: "",
    agreeToTerms: false
  });

  // Reset password form state
  const [resetEmail, setResetEmail] = useState("");
  const [pendingVendorSignup, setPendingVendorSignup] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetCaptchaToken, setResetCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<any>(null);
  const resetCaptchaRef = useRef<any>(null);

  // Handle vendor signup flow when user becomes available
  useEffect(() => {
    if (pendingVendorSignup && user?.id) {
      setCurrentUserId(user.id);
      setShowVendorApplication(true);
      setPendingVendorSignup(false);
      toast({
        title: "Account Created!",
        description: "Now let's complete your vendor application."
      });
    }
  }, [user, pendingVendorSignup, toast]);

  const handleCaptchaVerify = async (token: string) => {
    setCaptchaToken(token);
    // Resume the sign-in process
    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in."
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCaptchaToken(null);
    }
  };

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setIsLoading(false);
    toast({
      title: "Verification Failed",
      description: "Please try the verification again.",
      variant: "destructive"
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    console.log('Sign in attempt - hCaptcha enabled:', hcaptchaEnabled, 'captchaToken:', captchaToken);
    
    if (hcaptchaEnabled && !captchaToken) {
      console.log('Executing hCaptcha for sign in');
      setIsLoading(true);
      captchaRef.current?.execute();
      return;
    }
    
    console.log('Proceeding with sign in (captcha verified or disabled)');
    setIsLoading(true);
    
    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in."
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpCaptchaVerify = async (token: string) => {
    setCaptchaToken(token);
    // Resume the sign-up process
    try {
      const userData = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        date_of_birth: signUpData.dateOfBirth,
        gender: signUpData.gender,
        location: signUpData.location,
        phone_number: signUpData.phoneNumber
      };

      const { error } = await signUp(signUpData.email, signUpData.password, userData);
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCaptchaToken(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!signUpData.agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    if (hcaptchaEnabled && !captchaToken) {
      setIsLoading(true);
      captchaRef.current?.execute();
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        date_of_birth: signUpData.dateOfBirth,
        gender: signUpData.gender,
        location: signUpData.location,
        phone_number: signUpData.phoneNumber
      };

      const { error } = await signUp(signUpData.email, signUpData.password, userData);
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorSignUpCaptchaVerify = async (token: string) => {
    setCaptchaToken(token);
    // Resume the vendor sign-up process
    try {
      const userData = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        date_of_birth: signUpData.dateOfBirth,
        gender: signUpData.gender,
        location: signUpData.location,
        phone_number: signUpData.phoneNumber,
        user_type: 'vendor',
        status: 'pending'
      };

      const { error } = await signUp(signUpData.email, signUpData.password, userData);

      if (error) {
        toast({
          title: "Vendor Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Try to sign in the user immediately after signup
        const signInResult = await signIn(signUpData.email, signUpData.password);
        
        if (signInResult.error) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account, then sign in to complete your vendor application."
          });
          onClose();
        } else {
          // Set pending vendor signup flag - the useEffect will handle the flow
          setPendingVendorSignup(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCaptchaToken(null);
    }
  };

  const handleVendorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!signUpData.agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    if (hcaptchaEnabled && !captchaToken) {
      setIsLoading(true);
      captchaRef.current?.execute();
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        date_of_birth: signUpData.dateOfBirth,
        gender: signUpData.gender,
        location: signUpData.location,
        phone_number: signUpData.phoneNumber,
        user_type: 'vendor',
        status: 'pending'
      };

      const { error } = await signUp(signUpData.email, signUpData.password, userData);

      if (error) {
        toast({
          title: "Vendor Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Try to sign in the user immediately after signup
        const signInResult = await signIn(signUpData.email, signUpData.password);
        
        if (signInResult.error) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account, then sign in to complete your vendor application."
          });
          onClose();
        } else {
          // Set pending vendor signup flag - the useEffect will handle the flow
          setPendingVendorSignup(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCaptchaVerify = async (token: string) => {
    setResetCaptchaToken(token);
    // Resume the password reset process
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions."
        });
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setResetCaptchaToken(null);
    }
  };

  const handleResetCaptchaError = () => {
    setResetCaptchaToken(null);
    setIsLoading(false);
    toast({
      title: "Verification Failed",
      description: "Please try the verification again.",
      variant: "destructive"
    });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hcaptchaEnabled = import.meta.env.VITE_ENABLE_HCAPTCHA === 'true';
    if (hcaptchaEnabled && !resetCaptchaToken) {
      setIsLoading(true);
      resetCaptchaRef.current?.execute();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions."
        });
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {activeTab === 'reset' && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setActiveTab('signin')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              {activeTab === 'signin' && 'Welcome Back'}
              {activeTab === 'signup' && 'Create Account'}
              {activeTab === 'reset' && 'Reset Password'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {activeTab !== 'reset' && (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger value="signin" className="text-gray-900">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-gray-900">Sign Up</TabsTrigger>
                  <TabsTrigger value="vendor-signup" className="text-gray-900">Vendor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-10"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    {/* Invisible hCaptcha for sign-in, triggered programmatically */}
                    <div className="hidden">
                      <HCaptchaComponent
                        ref={captchaRef}
                        onVerify={handleCaptchaVerify}
                        onError={handleCaptchaError}
                        size="invisible"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => setActiveTab('reset')}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="First Name"
                          className="pl-10"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Last Name"
                          className="pl-10"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-10"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="pl-10"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="date"
                        placeholder="Date of Birth"
                        className="pl-10"
                        value={signUpData.dateOfBirth}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={signUpData.gender} onValueChange={(value) => setSignUpData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Location"
                          className="pl-10"
                          value={signUpData.location}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, location: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        className="pl-10"
                        value={signUpData.phoneNumber}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="agreeToTermsSignup"
                        checked={signUpData.agreeToTerms}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="agreeToTermsSignup" className="text-sm text-gray-700">
                        I agree to the <span className="text-blue-600 font-medium">Terms of Service</span> and <span className="text-blue-600 font-medium">Privacy Policy</span>
                      </label>
                    </div>
                    
                    {/* Invisible hCaptcha for sign-up, triggered programmatically */}
                    <div className="hidden">
                      <HCaptchaComponent
                        ref={captchaRef}
                        onVerify={handleSignUpCaptchaVerify}
                        onError={handleCaptchaError}
                        size="invisible"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="vendor-signup" className="space-y-4">
                  <div className="text-center mb-4">
                    <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Become a Vendor</h3>
                    <p className="text-sm text-gray-600">Join our platform and start selling your products</p>
                  </div>
                  
                  <form onSubmit={handleVendorSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="First Name"
                          className="pl-10"
                          value={signUpData.firstName}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Last Name"
                          className="pl-10"
                          value={signUpData.lastName}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-10"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="pl-10"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        className="pl-10"
                        value={signUpData.phoneNumber}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={signUpData.agreeToTerms}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                        className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                        I agree to the <span className="text-green-600 font-medium">Terms of Service</span> and <span className="text-green-600 font-medium">Privacy Policy</span>
                      </label>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Create your account with basic information</li>
                        <li>• Complete vendor application form</li>
                        <li>• Go through vendor training</li>
                        <li>• Wait for admin approval (1-2 business days)</li>
                        <li>• Start selling your products!</li>
                      </ul>
                    </div>
                    
                    {/* Invisible hCaptcha for vendor sign-up, triggered programmatically */}
                    <div className="hidden">
                      <HCaptchaComponent
                        ref={captchaRef}
                        onVerify={handleVendorSignUpCaptchaVerify}
                        onError={handleCaptchaError}
                        size="invisible"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? "Creating vendor account..." : "Create Vendor Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
            
            {activeTab === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                {/* Invisible hCaptcha for password reset, triggered programmatically */}
                <div className="hidden">
                  <HCaptchaComponent
                    ref={resetCaptchaRef}
                    onVerify={handleResetCaptchaVerify}
                    onError={handleResetCaptchaError}
                    size="invisible"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            )}
            
            {activeTab !== 'reset' && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Application Form */}
      {showVendorApplication && currentUserId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Card className="bg-white">
              <CardHeader className="text-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowVendorApplication(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Vendor Application
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <VendorApplicationForm
                  userId={currentUserId}
                  onComplete={() => {
                    setShowVendorApplication(false);
                    setShowVendorTraining(true);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vendor Training */}
      {showVendorTraining && currentUserId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <Card className="bg-white">
              <CardHeader className="text-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowVendorTraining(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Vendor Training
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <VendorTraining
                  userId={currentUserId}
                  onComplete={() => {
                    setShowVendorTraining(false);
                    onClose();
                    toast({
                      title: "Application Complete!",
                      description: "Your vendor application has been submitted. We'll review it and get back to you soon."
                    });
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationModal;
