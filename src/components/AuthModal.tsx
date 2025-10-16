import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Mail, Lock, User, Chrome, MapPin, Calendar, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    dob: "",
    location: "",
    gender: ""
  });
  const { toast } = useToast();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: type === 'login' ? "Welcome back!" : "Account created!",
        description: "You've been successfully authenticated.",
      });
      
      const userData = type === 'register' ? {
        name: formData.nickname || "John Doe",
        email: formData.email || "john@example.com",
        dob: formData.dob,
        location: formData.location,
        gender: formData.gender,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (formData.nickname || "John")
      } : {
        name: "John Doe",
        email: "john@example.com",
        dob: "1990-01-01",
        location: "Nairobi, Kenya",
        gender: "male",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
      };
      
      onAuthSuccess(userData);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-lg bg-white backdrop-blur-sm border-gray-200 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to MyPlug</CardTitle>
          </CardHeader>
          <CardContent className="px-8">
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-gray-900 data-[state=active]:bg-white data-[state=active]:text-gray-900">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input type="email" placeholder="Email" className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" required />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" required />
                      <button
                        type="button"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowLoginPassword(v => !v)}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Nickname" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={formData.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="email" 
                        placeholder="Email" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type={showRegisterPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required 
                      />
                      <button
                        type="button"
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowRegisterPassword(v => !v)}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="date" 
                        placeholder="Date of Birth" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Location" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required 
                      />
                    </div>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select Gender" className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        <SelectItem value="male" className="text-gray-900 hover:bg-gray-100">Male</SelectItem>
                        <SelectItem value="female" className="text-gray-900 hover:bg-gray-100">Female</SelectItem>
                        <SelectItem value="other" className="text-gray-900 hover:bg-gray-100">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say" className="text-gray-900 hover:bg-gray-100">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
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
                className="w-full mt-4 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal;
