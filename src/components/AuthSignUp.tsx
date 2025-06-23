
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Lock, User, MapPin, Calendar, Store, ShoppingBag, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthSignUpProps {
  onBack: () => void;
  onAuthSuccess: (user: any) => void;
}

const AuthSignUp = ({ onBack, onAuthSuccess }: AuthSignUpProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    location: "",
    gender: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [vendorData, setVendorData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    businessType: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  const handleCustomerInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleVendorInputChange = (field: string, value: string) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const currentData = userType === 'customer' ? customerData : vendorData;
    
    if (currentData.password !== currentData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: `Welcome to ISA as a ${userType}!`,
      });
      
      const userData = userType === 'customer' ? {
        name: `${customerData.firstName} ${customerData.lastName}`,
        email: customerData.email,
        dob: customerData.dob,
        location: customerData.location,
        gender: customerData.gender,
        phoneNumber: customerData.phoneNumber,
        userType: userType,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + customerData.firstName
      } : {
        name: `${vendorData.firstName} ${vendorData.lastName}`,
        email: vendorData.email,
        company: vendorData.company,
        businessType: vendorData.businessType,
        userType: userType,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + vendorData.firstName
      };
      
      onAuthSuccess(userData);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-5xl bg-white backdrop-blur-sm border-gray-200 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent className="px-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Customer Sign Up */}
              <div className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                userType === 'customer' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setUserType('customer')}>
                <div className="text-center mb-4">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Sign up as Customer</h3>
                  <p className="text-gray-600 text-sm mt-1">Shop with AI-powered recommendations</p>
                </div>
              </div>

              {/* Vendor Sign Up */}
              <div className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                userType === 'vendor' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setUserType('vendor')}>
                <div className="text-center mb-4">
                  <Store className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Sign up as Vendor</h3>
                  <p className="text-gray-600 text-sm mt-1">Sell your products with smart tools</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {userType === 'customer' ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="First Name" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.firstName}
                        onChange={(e) => handleCustomerInputChange('firstName', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Last Name" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.lastName}
                        onChange={(e) => handleCustomerInputChange('lastName', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="date" 
                      placeholder="Date of Birth" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={customerData.dob}
                      onChange={(e) => handleCustomerInputChange('dob', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Location" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.location}
                        onChange={(e) => handleCustomerInputChange('location', e.target.value)}
                        required 
                      />
                    </div>
                    <Select value={customerData.gender} onValueChange={(value) => handleCustomerInputChange('gender', value)}>
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
                  
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="tel" 
                      placeholder="Phone Number" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={customerData.phoneNumber}
                      onChange={(e) => handleCustomerInputChange('phoneNumber', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={customerData.email}
                      onChange={(e) => handleCustomerInputChange('email', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.password}
                        onChange={(e) => handleCustomerInputChange('password', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.confirmPassword}
                        onChange={(e) => handleCustomerInputChange('confirmPassword', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="First Name" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.firstName}
                        onChange={(e) => handleVendorInputChange('firstName', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="text" 
                        placeholder="Last Name" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.lastName}
                        onChange={(e) => handleVendorInputChange('lastName', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Company Name" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={vendorData.company}
                      onChange={(e) => handleVendorInputChange('company', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <Store className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Type of Business/Products" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={vendorData.businessType}
                      onChange={(e) => handleVendorInputChange('businessType', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                      value={vendorData.email}
                      onChange={(e) => handleVendorInputChange('email', e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.password}
                        onChange={(e) => handleVendorInputChange('password', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.confirmPassword}
                        onChange={(e) => handleVendorInputChange('confirmPassword', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </>
              )}
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12" disabled={isLoading}>
                {isLoading ? "Creating account..." : `Create ${userType} account`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthSignUp;
