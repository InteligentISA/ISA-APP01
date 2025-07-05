import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AuthWelcomeProps {
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToVendorSignUp: () => void;
  onGoogleAuthSuccess: (email: string) => void;
}

const AuthWelcome = ({ onClose, onAuthSuccess, onNavigateToSignIn, onNavigateToSignUp, onNavigateToVendorSignUp, onGoogleAuthSuccess }: AuthWelcomeProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Wait for user to be set in context
        setTimeout(() => {
          if (user && user.email) {
            onGoogleAuthSuccess(user.email);
          } else {
            // fallback: reload or try again
            window.location.reload();
          }
        }, 1000);
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-md bg-white backdrop-blur-sm border-gray-200">
          <CardHeader className="text-center relative">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to ISA</CardTitle>
            <p className="text-gray-600 mt-2">Your Intelligent Shopping Assistant</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 h-12"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5 mr-3" />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                onClick={onNavigateToSignUp}
              >
                Sign up
              </Button>
              
              <Button
                variant="outline"
                className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 h-12"
                onClick={onNavigateToSignIn}
              >
                Sign in
              </Button>
              
              <div className="text-center pt-4 space-y-2">
                <button
                  className="text-sm text-blue-600 hover:underline block"
                  onClick={() => {
                    // Navigate to sign in with forgot password mode
                    onNavigateToSignIn();
                  }}
                >
                  Forgot your password?
                </button>
                <button
                  className="text-sm text-blue-600 hover:underline block"
                  onClick={onNavigateToVendorSignUp}
                >
                  Join as a vendor instead
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthWelcome;
