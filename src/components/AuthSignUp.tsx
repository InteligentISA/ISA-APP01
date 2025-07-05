import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Lock, User, MapPin, Calendar, Store, ShoppingBag, Phone, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface AuthSignUpProps {
  onBack: () => void;
  onAuthSuccess: (user: any) => void;
  userType: 'customer' | 'vendor';
}

const countyConstituencyData = {
  "Nairobi County": ["Westlands", "Dagoretti North", "Dagoretti South", "Langata", "Kibra", "Roysambu", "Kasarani", "Ruaraka", "Embakasi South", "Embakasi North", "Embakasi Central", "Embakasi East", "Embakasi West", "Makadara", "Kamukunji", "Starehe", "Mathare"],
  "Kiambu County": ["Gatundu South", "Gatundu North", "Juja", "Thika Town", "Ruiru", "Githunguri", "Kiambu", "Kiambaa", "Kabete", "Kikuyu", "Limuru", "Lari"],
  "Nakuru County": ["Nakuru Town East", "Nakuru Town West", "Bahati", "Subukia", "Rongai", "Kuresoi North", "Kuresoi South", "Molo", "Njoro", "Gilgil", "Naivasha"],
  "Kakamega County": ["Lugari", "Likuyani", "Malava", "Lurambi", "Navakholo", "Mumias East", "Mumias West", "Butere", "Khwisero", "Matungu", "Ikolomani", "Shinyalu"],
  "Bungoma County": ["Mount Elgon", "Sirisia", "Kabuchai", "Webuye West", "Webuye East", "Bungoma", "Kanduyi", "Bumula", "Butula"],
  "Meru County": ["Igembe South", "Igembe Central", "Igembe North", "Tigania West", "Tigania East", "North Imenti", "Buuri", "Central Imenti", "South Imenti"],
  "Kilifi County": ["Kilifi North", "Kilifi South", "Kaloleni", "Rabai", "Ganze", "Malindi", "Magarini"],
  "Machakos County": ["Masinga", "Yatta", "Kangundo", "Matungulu", "Kathiani", "Mavoko", "Machakos Town", "Mwala"],
  "Kisii County": ["Bonchari", "South Mugirango", "Bomachoge Borabu", "Bomachoge Chache", "Bobasi", "Nyaribari Masaba", "Nyaribari Chache", "Kitutu Chache North", "Kitutu Chache South"],
  "Mombasa County": ["Changamwe", "Jomvu", "Kisauni", "Nyali", "Likoni", "Mvita"],
  "Narok County": ["Kilgoris", "Emurua Dikirr", "Loita", "Narok North", "Narok East", "Narok South", "Narok West"],
  "Kajiado County": ["Kajiado North", "Kajiado East", "Kajiado South", "Kajiado Central", "Kajiado West"],
  "Uasin Gishu County": ["Ainabkoi", "Kapseret", "Kesses", "Moiben", "Soy", "Turbo"],
  "Kisumu County": ["Kisumu West", "Kisumu East", "Kisumu Central", "Seme", "Nyando", "Muhoroni", "Nyakach"],
  "Migori County": ["Rongo", "Awendo", "Suna East", "Suna West", "Uriri", "Nyatike", "Kuria West", "Kuria East"],
  "Homa Bay County": ["Kasipul", "Kabondo Kasipul", "Karachuonyo", "Rachuonyo North", "Rachuonyo East", "Homa Bay Town", "Rangwe", "Suba North", "Suba South"],
  "Kitui County": ["Mwingi North", "Mwingi West", "Mwingi Central", "Kitui West", "Kitui Rural", "Kitui Central", "Kitui East", "Kitui South"],
  "Murang'a County": ["Kangema", "Mathioya", "Kiharu", "Kigumo", "Maragwa", "Kandara", "Gatanga"],
  "Trans-Nzoia County": ["Cherangany", "Endebess", "Kwanza", "Saboti", "Kiminini"],
  "Siaya County": ["Ugenya", "Ugunja", "Alego Usonga", "Gem", "Bondo", "Rarieda"],
  "Makueni County": ["Mbooni", "Kilome", "Kaiti", "Makueni", "Kibwezi West", "Kibwezi East"],
  "Turkana County": ["Turkana North", "Turkana West", "Turkana Central", "Loima", "Turkana South", "Turkana East"],
  "Busia County": ["Nambale", "Butula", "Funyula", "Samia", "Bunyala", "Budalang'i", "Teso North", "Teso South"],
  "Mandera County": ["Mandera West", "Banissa", "Mandera North", "Mandera South", "Mandera East", "Lafey"],
  "Kericho County": ["Kipkelion East", "Kipkelion West", "Ainamoi", "Bureti", "Belgut", "Sigowet/Soin"],
  "Nandi County": ["Aldai", "Chesumei", "Emgwen", "Mosop", "Nandi Hills", "Tinderet"],
  "Kwale County": ["Msambweni", "Lunga Lunga", "Matuga", "Kinango"],
  "Bomet County": ["Sotik", "Chepalungu", "Bomet Central", "Bomet East", "Konoin"],
  "Garissa County": ["Garissa Township", "Balambala", "Lagdera", "Dadaab", "Fafi", "Ijara"],
  "Wajir County": ["Wajir North", "Wajir East", "Tarbaj", "Wajir West", "Eldas", "Wajir South"],
  "Nyeri County": ["Tetu", "Kieni", "Mathira", "Othaya", "Mukurweini", "Nyeri Town"],
  "Baringo County": ["Mogotio", "Eldama Ravine", "Baringo Central", "Baringo North", "Baringo South", "Tiaty"],
  "Nyandarua County": ["Kinangop", "Kipipiri", "Ol Kalou", "Ol Jorok", "Ndaragwa"],
  "West Pokot County": ["Kapenguria", "Sigor", "Kacheliba", "Pokot South"],
  "Nyamira County": ["Kitutu Masaba", "North Mugirango", "West Mugirango", "Borabu"],
  "Kirinyaga County": ["Mwea", "Gichugu", "Ndia", "Kirinyaga Central"],
  "Embu County": ["Manyatta", "Runyenjes", "Mbeere South", "Mbeere North"],
  "Vihiga County": ["Vihiga", "Emuhaya", "Luanda", "Hamisi", "Sabatia"],
  "Laikipia County": ["Laikipia West", "Laikipia East", "Laikipia North"],
  "Marsabit County": ["Moyale", "North Horr", "Saku", "Laisamis"],
  "Elgeyo-Marakwet County": ["Keiyo North", "Keiyo South", "Marakwet East", "Marakwet West"],
  "Tharaka-Nithi County": ["Maara", "Chuka/Igambang'ombe", "Tharaka"],
  "Taita–Taveta County": ["Taveta", "Wundanyi", "Mwatate", "Voi"],
  "Tana River County": ["Garsen", "Galole", "Bura"],
  "Samburu County": ["Samburu West", "Samburu North", "Samburu East"],
  "Isiolo County": ["Isiolo North", "Isiolo South"],
  "Lamu County": ["Lamu East", "Lamu West"]
};

const AuthSignUp = ({ onBack, onAuthSuccess, userType }: AuthSignUpProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    county: "",
    constituency: "",
    gender: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [vendorData, setVendorData] = useState({
    company: "",
    businessType: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleCustomerInputChange = (field: string, value: string) => {
    setCustomerData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset constituency when county changes
      if (field === 'county') {
        newData.constituency = "";
      }
      return newData;
    });
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
    
    try {
      const userData = userType === 'customer' ? {
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        date_of_birth: customerData.dob,
        location: `${customerData.constituency}, ${customerData.county}`,
        gender: customerData.gender,
        phone_number: customerData.phoneNumber,
        user_type: userType,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData.firstName}`
      } : {
        first_name: vendorData.firstName,
        last_name: vendorData.lastName,
        company: vendorData.company,
        business_type: vendorData.businessType,
        phone_number: vendorData.phoneNumber,
        user_type: userType,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${vendorData.firstName}`
      };

      const { error } = await signUp(currentData.email, currentData.password, userData);
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created!",
          description: `Welcome to ISA as a ${userType}! Please check your email to verify your account.`,
        });
        
        // Create user object for the app
        const appUser = userType === 'customer' ? {
          name: `${customerData.firstName} ${customerData.lastName}`,
          email: customerData.email,
          dob: customerData.dob,
          location: `${customerData.constituency}, ${customerData.county}`,
          gender: customerData.gender,
          phoneNumber: customerData.phoneNumber,
          userType: userType,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData.firstName}`
        } : {
          name: `${vendorData.firstName} ${vendorData.lastName}`,
          email: vendorData.email,
          company: vendorData.company,
          businessType: vendorData.businessType,
          phoneNumber: vendorData.phoneNumber,
          userType: userType,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${vendorData.firstName}`
        };
        
        onAuthSuccess(appUser);
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

  const getAvailableConstituencies = () => {
    if (!customerData.county) return [];
    return countyConstituencyData[customerData.county as keyof typeof countyConstituencyData] || [];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-md bg-white backdrop-blur-sm border-gray-200 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {userType === 'customer' ? 'Create Your Account' : 'Apply as Vendor'}
            </CardTitle>
            {userType === 'customer' && (
              <div className="flex items-center justify-center mt-2">
                <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-gray-600">Join as a Customer</span>
              </div>
            )}
            {userType === 'vendor' && (
              <div className="flex items-center justify-center mt-2">
                <Store className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-gray-600">Apply to Sell Products</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {userType === 'customer' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-first-name" className="mb-1 block">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="customer-first-name"
                          type="text" 
                          placeholder="First Name" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={customerData.firstName}
                          onChange={(e) => handleCustomerInputChange('firstName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customer-last-name" className="mb-1 block">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="customer-last-name"
                          type="text" 
                          placeholder="Last Name" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={customerData.lastName}
                          onChange={(e) => handleCustomerInputChange('lastName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customer-dob" className="mb-1 block">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="customer-dob"
                        type="date" 
                        placeholder="Date of Birth" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.dob}
                        onChange={(e) => handleCustomerInputChange('dob', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">County</Label>
                      <Select value={customerData.county} onValueChange={(value) => handleCustomerInputChange('county', value)}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select County" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 z-50">
                          {Object.keys(countyConstituencyData).map((county) => (
                            <SelectItem key={county} value={county} className="text-gray-900 hover:bg-gray-100">
                              {county}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1 block">Constituency</Label>
                      <Select 
                        value={customerData.constituency} 
                        onValueChange={(value) => handleCustomerInputChange('constituency', value)}
                        disabled={!customerData.county}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select Constituency" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 z-50">
                          {getAvailableConstituencies().map((constituency) => (
                            <SelectItem key={constituency} value={constituency} className="text-gray-900 hover:bg-gray-100">
                              {constituency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Gender</Label>
                    <Select value={customerData.gender} onValueChange={(value) => handleCustomerInputChange('gender', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select Gender" className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 z-50">
                        <SelectItem value="male" className="text-gray-900 hover:bg-gray-100">Male</SelectItem>
                        <SelectItem value="female" className="text-gray-900 hover:bg-gray-100">Female</SelectItem>
                        <SelectItem value="other" className="text-gray-900 hover:bg-gray-100">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say" className="text-gray-900 hover:bg-gray-100">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="customer-phone" className="mb-1 block">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="customer-phone"
                        type="tel" 
                        placeholder="Phone Number" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.phoneNumber}
                        onChange={(e) => handleCustomerInputChange('phoneNumber', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customer-email" className="mb-1 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="customer-email"
                        type="email" 
                        placeholder="Email" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={customerData.email}
                        onChange={(e) => handleCustomerInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-password" className="mb-1 block">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="customer-password"
                          type="password" 
                          placeholder="Password" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={customerData.password}
                          onChange={(e) => handleCustomerInputChange('password', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customer-confirm-password" className="mb-1 block">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="customer-confirm-password"
                          type="password" 
                          placeholder="Confirm Password" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={customerData.confirmPassword}
                          onChange={(e) => handleCustomerInputChange('confirmPassword', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="vendor-company" className="mb-1 block">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="vendor-company"
                        type="text" 
                        placeholder="Company Name" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.company}
                        onChange={(e) => handleVendorInputChange('company', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendor-business-type" className="mb-1 block">Type of Business/Products</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="vendor-business-type"
                        type="text" 
                        placeholder="Type of Business/Products" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.businessType}
                        onChange={(e) => handleVendorInputChange('businessType', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor-first-name" className="mb-1 block">Rep First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="vendor-first-name"
                          type="text" 
                          placeholder="Rep First Name" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={vendorData.firstName}
                          onChange={(e) => handleVendorInputChange('firstName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vendor-last-name" className="mb-1 block">Rep Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="vendor-last-name"
                          type="text" 
                          placeholder="Rep Last Name" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={vendorData.lastName}
                          onChange={(e) => handleVendorInputChange('lastName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendor-phone" className="mb-1 block">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="vendor-phone"
                        type="tel" 
                        placeholder="Phone Number" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.phoneNumber}
                        onChange={(e) => handleVendorInputChange('phoneNumber', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vendor-email" className="mb-1 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="vendor-email"
                        type="email" 
                        placeholder="Email" 
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                        value={vendorData.email}
                        onChange={(e) => handleVendorInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor-password" className="mb-1 block">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="vendor-password"
                          type="password" 
                          placeholder="Password" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={vendorData.password}
                          onChange={(e) => handleVendorInputChange('password', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vendor-confirm-password" className="mb-1 block">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="vendor-confirm-password"
                          type="password" 
                          placeholder="Confirm Password" 
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500" 
                          value={vendorData.confirmPassword}
                          onChange={(e) => handleVendorInputChange('confirmPassword', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12" disabled={isLoading}>
                {isLoading ? "Creating account..." : `Create ${userType} account`}
              </Button>

              {userType === 'vendor' && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={onBack}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthSignUp;
