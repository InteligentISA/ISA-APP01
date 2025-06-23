
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthWelcomeProps {
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
}

const AuthWelcome = ({ onClose, onAuthSuccess, onNavigateToSignIn, onNavigateToSignUp }: AuthWelcomeProps) => {
  const { toast } = useToast();

  const handleGoogleAuth = () => {
    setTimeout(() => {
      toast({
        title: "Welcome!",
        description: "You've been signed in with Google.",
      });
      onAuthSuccess({
        name: "John Doe",
        email: "john@gmail.com",
        dob: "1990-01-01",
        location: "Nairobi, Kenya",
        gender: "male",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google"
      });
    }, 1000);
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
              >
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
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
                Log in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthWelcome;
