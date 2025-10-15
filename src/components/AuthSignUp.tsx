import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Lock, User, MapPin, Calendar, Store, ShoppingBag, Phone, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PrivacyPolicy from "@/components/PrivacyPolicy";

interface AuthSignUpProps {
  onBack: () => void;
  onAuthSuccess: (user: any) => void;
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

const AuthSignUp = ({ onBack, onAuthSuccess }: AuthSignUpProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'vendor' | null>(null);
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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Sync email/password fields between both states
  const handleCommonInputChange = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerInputChange = (field: string, value: string) => {
    if (["email", "password", "confirmPassword"].includes(field)) {
      handleCommonInputChange(field as any, value);
    } else {
      setCustomerData(prev => {
        const newData = { ...prev, [field]: value };
        if (field === 'county') {
          newData.constituency = "";
        }
        return newData;
      });
    }
  };

  const handleVendorInputChange = (field: string, value: string) => {
    if (["email", "password", "confirmPassword"].includes(field)) {
      handleCommonInputChange(field as any, value);
    } else {
      setVendorData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;
    if (!agreedToTerms) return;
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
      // Calculate age from date of birth for customers
      let calculatedAge = null;
      if (userType === 'customer' && customerData.dob) {
        const birthDate = new Date(customerData.dob);
        const today = new Date();
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }

      // Check if customer has all required fields for complete setup
      const hasCompleteCustomerData = userType === 'customer' && 
        customerData.firstName && 
        customerData.lastName && 
        customerData.phoneNumber && 
        customerData.dob && 
        customerData.gender && 
        customerData.county && 
        customerData.constituency;

      const userData = userType === 'customer' ? {
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        date_of_birth: customerData.dob,
        age: calculatedAge,
        location: `${customerData.constituency}, ${customerData.county}`,
        gender: customerData.gender,
        phone_number: customerData.phoneNumber,
        email: customerData.email,
        user_type: userType,
        account_setup_completed: hasCompleteCustomerData,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${customerData.firstName}`
      } : {
        first_name: vendorData.firstName,
        last_name: vendorData.lastName,
        email: vendorData.email,
        user_type: userType,
        status: 'pending',
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
        if (userType === 'vendor') {
          // Wait for Supabase to finish syncing the new user before updating the profile
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Update the vendor profile using the email as the identifier
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              user_type: 'vendor',
              status: 'pending'
            })
            .eq('email', vendorData.email);
          if (updateError) {
            toast({
              title: "Profile Update Failed",
              description: updateError.message,
              variant: "destructive"
            });
          }
        }
        toast({
          title: "Account created!",
          description: userType === 'vendor' 
            ? "Your vendor application has been submitted! Please wait for admin approval."
            : `Welcome to ISA as a ${userType}! Please check your email to verify your account.`,
        });
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
          userType: userType,
          status: 'pending',
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

  // Check if email, password, and confirmPassword are filled
  const canSelectType =
    (customerData.email && customerData.password && customerData.confirmPassword) ||
    (vendorData.email && vendorData.password && vendorData.confirmPassword);

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
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common fields */}
              <div>
                <Label htmlFor="signup-email" className="mb-1 block">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    value={customerData.email}
                    onChange={e => handleCommonInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-password" className="mb-1 block">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password"
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      value={customerData.password}
                      onChange={e => handleCommonInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-confirm-password" className="mb-1 block">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm Password"
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      value={customerData.confirmPassword}
                      onChange={e => handleCommonInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* User type selection, only after common fields are filled */}
              {canSelectType && (
                <div className="flex items-center justify-center gap-4 mt-2">
                  <Button
                    type="button"
                    variant={userType === 'customer' ? 'default' : 'outline'}
                    className={userType === 'customer' ? 'bg-blue-600 text-white' : ''}
                    onClick={() => setUserType('customer')}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" /> Customer
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'vendor' ? 'default' : 'outline'}
                    className={userType === 'vendor' ? 'bg-blue-600 text-white' : ''}
                    onClick={() => setUserType('vendor')}
                  >
                    <Store className="w-5 h-5 mr-2" /> Vendor
                  </Button>
                </div>
              )}
              {/* User type specific fields */}
              {userType === 'customer' && (
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
                          onChange={e => handleCustomerInputChange('firstName', e.target.value)}
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
                          onChange={e => handleCustomerInputChange('lastName', e.target.value)}
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
                        onChange={e => handleCustomerInputChange('dob', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">County</Label>
                      <Select value={customerData.county} onValueChange={value => handleCustomerInputChange('county', value)}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select County" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 z-50">
                          {Object.keys(countyConstituencyData).map(county => (
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
                        onValueChange={value => handleCustomerInputChange('constituency', value)}
                        disabled={!customerData.county}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select Constituency" className="text-gray-500" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300 z-50">
                          {getAvailableConstituencies().map(constituency => (
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
                    <Select value={customerData.gender} onValueChange={value => handleCustomerInputChange('gender', value)}>
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
                        onChange={e => handleCustomerInputChange('phoneNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              {userType === 'vendor' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor-first-name" className="mb-1 block">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="vendor-first-name"
                          type="text"
                          placeholder="First Name"
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                          value={vendorData.firstName}
                          onChange={e => handleVendorInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vendor-last-name" className="mb-1 block">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="vendor-last-name"
                          type="text"
                          placeholder="Last Name"
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                          value={vendorData.lastName}
                          onChange={e => handleVendorInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Click create vendor account</li>
                      <li>• Complete vendor application form</li>
                      <li>• Go through vendor training</li>
                      <li>• Wait for admin approval (Normally within 24 hours)</li>
                      <li>• Start selling your products!</li>
                    </ul>
                  </div>
                </>
              )}
              {/* Terms of Service and Privacy Policy Checkbox */}
              {(userType === 'customer' || userType === 'vendor') && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={checked => setAgreedToTerms(Boolean(checked))}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 select-none">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms & Conditions
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setShowPrivacy(true)}
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              )}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12" disabled={isLoading || !userType || !agreedToTerms}>
                {isLoading
                  ? "Creating account..."
                  : userType
                    ? `Create ${userType} account`
                    : "Continue"}
              </Button>
            </form>
            {/* Terms of Service Dialog */}
            <Dialog open={showTerms} onOpenChange={setShowTerms}>
              <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Terms of Service</DialogTitle>
                </DialogHeader>
                <div className="prose prose-sm sm:prose-base max-w-none">
                  {userType === 'vendor' ? (
                    <div className="text-sm sm:text-base leading-relaxed text-gray-700 space-y-4">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <h2 className="text-lg font-bold text-blue-900 mb-2">ISA AI SHOPPING ASSISTANT – VENDOR TERMS & CONDITIONS</h2>
                        <p className="text-blue-800 text-sm">
                          <strong>Effective Date:</strong> 7/17/2025<br/>
                          <strong>Version:</strong> 1.0
                        </p>
                      </div>
                      
                      <p className="text-gray-800">
                        These Terms and Conditions ("Agreement") govern the participation of vendors ("Vendor", "You", or "Your") on the ISA AI Shopping Assistant platform ("ISA", "we", "us", or "our"), operated by ISA AI Shopping Assistant Ltd., a company registered in Kenya. By listing your products or services on ISA or engaging with the ISA team, you agree to abide by these Terms in full.
                      </p>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">1. DEFINITIONS</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>"ISA Platform"</strong> – The AI-powered mobile and web platform, application interface, API systems, databases, and related services used by customers for smart shopping assistance.</li>
                          <li><strong>"Vendor Account"</strong> – The registered profile ISA creates or grants access to for managing listings and commercial activity.</li>
                          <li><strong>"Product"</strong> – Any goods, services, or offers listed by a Vendor.</li>
                          <li><strong>"Customer"</strong> – End-users or shoppers who use ISA to browse, compare, and purchase Products.</li>
                          <li><strong>"Commission"</strong> – A percentage fee retained by ISA from sales, unless otherwise negotiated.</li>
                          <li><strong>"Listing"</strong> – A product's profile including description, pricing, images, stock info, and delivery options.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">2. ELIGIBILITY & ONBOARDING</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>2.1 Vendor Approval:</strong> Vendors must complete the ISA onboarding process and be approved by ISA before listing any Products.</li>
                          <li><strong>2.2 Accurate Information:</strong> All information provided during onboarding (including business details, contact info, product categories, etc.) must be truthful and regularly updated.</li>
                          <li><strong>2.3 Legal Status:</strong> Vendors must be legally registered businesses or individuals eligible to operate and sell products in their respective jurisdiction.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">3. PRODUCT LISTINGS & CONTENT</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>3.1 Responsibility:</strong> Vendors are solely responsible for ensuring all listed Products comply with applicable laws, are accurately described, safe, and meet quality standards.</li>
                          <li><strong>3.2 Accuracy:</strong> Product names, descriptions, prices, images, shipping timelines, stock levels, and variations must be complete and truthful. Misleading content may result in removal.</li>
                          <li><strong>3.3 Intellectual Property:</strong> Vendors must not use copyrighted content, trademarks, or logos without permission. You agree to indemnify ISA against claims related to IP violations.</li>
                          <li><strong>3.4 Restricted Items:</strong> Vendors may not list illegal products, counterfeit goods, expired items, or anything ISA deems unsafe or unethical (e.g., weapons, hate merchandise, etc.).</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">4. ORDER FULFILMENT & CUSTOMER SERVICE</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>4.1 Timeliness:</strong> Vendors must fulfill orders within the agreed timeline. Delays must be communicated to ISA and customers in real time.</li>
                          <li><strong>4.2 Delivery:</strong> Where Vendors manage logistics, clear shipping policies and delivery schedules must be defined. Vendors are liable for damaged or undelivered goods if using third-party couriers.</li>
                          <li><strong>4.3 Returns & Refunds:</strong> Vendors must adhere to ISA's refund/return policy or provide an equivalent policy approved during onboarding.</li>
                          <li><strong>4.4 Customer Complaints:</strong> Vendors are expected to respond to any customer-related complaint or inquiry referred by ISA within 24–48 hours.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">5. COMMISSIONS, PAYMENTS & FEES</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>5.1 Commission Structure:</strong> ISA retains a commission on each sale, as agreed upon during onboarding or updated periodically with notice. This may vary by category or volume.</li>
                          <li><strong>5.2 Payouts:</strong> Net revenue (after commissions and applicable charges) will be remitted to the Vendor on a [weekly/bi-weekly/monthly] basis, depending on the payout schedule.</li>
                          <li><strong>5.3 Deductions:</strong> ISA reserves the right to deduct amounts for:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Refunds or chargebacks</li>
                              <li>• Promotional discounts</li>
                              <li>• Platform service fees</li>
                              <li>• Regulatory deductions (e.g., taxes or levies)</li>
                            </ul>
                          </li>
                          <li><strong>5.4 Taxes:</strong> Vendors are responsible for declaring and remitting their own taxes (e.g., VAT, income tax) to the relevant authorities.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">6. PROMOTIONS & MARKETING</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>6.1 Platform Campaigns:</strong> ISA may run promotional campaigns involving Vendor products. Participation may be voluntary or opt-in unless included in partnership agreements.</li>
                          <li><strong>6.2 Use of Vendor Content:</strong> Vendors authorize ISA to use their brand name, product images, and offers for platform promotion, newsletters, or AI-generated recommendations.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">7. DATA USE & PRIVACY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>7.1 Confidentiality:</strong> Any commercial terms, internal data, or proprietary insights exchanged between the Vendor and ISA are strictly confidential.</li>
                          <li><strong>7.2 Data Ownership:</strong> Customer data (emails, Browse behavior, purchase patterns) collected by ISA remains the property of ISA and may be used in accordance with its Privacy Policy.</li>
                          <li><strong>7.3 AI Personalization:</strong> Vendors acknowledge that their product data may be used to train recommendation systems or improve AI user experience.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">8. INTELLECTUAL PROPERTY (IP)</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>8.1</strong> Vendors retain ownership of their own IP, including logos, product designs, and branded assets.</li>
                          <li><strong>8.2</strong> Any technology, code, AI system, or platform developed by ISA (including interface logic, chatbot systems, or analytics dashboards) remains ISA's exclusive IP.</li>
                          <li><strong>8.3</strong> Vendors may not reverse engineer, replicate, or commercialize ISA's platform or proprietary features.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">9. SUSPENSION & TERMINATION</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>9.1</strong> ISA reserves the right to suspend or terminate a Vendor account at any time, with or without notice, if the Vendor:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Breaches these Terms</li>
                              <li>• Provides false or harmful listings</li>
                              <li>• Damages ISA's brand or user trust</li>
                              <li>• Violates laws or ethical guidelines</li>
                            </ul>
                          </li>
                          <li><strong>9.2 Upon termination:</strong>
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• All listings are removed from the platform</li>
                              <li>• Outstanding dues will be settled after accounting for refunds, claims, and disputes</li>
                            </ul>
                          </li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">10. LIABILITY & INDEMNITY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>10.1</strong> Vendors agree to indemnify and hold harmless ISA, its officers, and agents from any claims, damages, or liabilities resulting from:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Product defects, misinformation, or regulatory violations</li>
                              <li>• Intellectual property disputes</li>
                              <li>• Loss or injury related to delivered goods</li>
                            </ul>
                          </li>
                          <li><strong>10.2</strong> ISA is not liable for:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Vendor-side delivery failures</li>
                              <li>• Third-party payment gateway interruptions</li>
                              <li>• Technical downtime beyond its control</li>
                            </ul>
                          </li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">11. RELATIONSHIP</h3>
                        <p className="text-sm">These Terms do not create any partnership, joint venture, or employment relationship. Vendors act as independent parties.</p>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">12. MODIFICATIONS</h3>
                        <p className="text-sm">ISA may update these Terms from time to time. Vendors will be notified of major changes via email or platform notice. Continued use of the platform constitutes acceptance.</p>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">13. GOVERNING LAW & DISPUTES</h3>
                        <p className="text-sm">These Terms are governed by the laws of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kenya.</p>
                      </section>
                    </div>
                  ) : (
                    <div className="text-sm sm:text-base leading-relaxed text-gray-700 space-y-4">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <h2 className="text-lg font-bold text-green-900 mb-2">ISA AI SHOPPING ASSISTANT – CUSTOMER TERMS & CONDITIONS</h2>
                        <p className="text-green-800 text-sm">
                          <strong>Effective Date:</strong> 7/17/2025<br/>
                          <strong>Version:</strong> 1.0
                        </p>
                      </div>
                      
                      <p className="text-gray-800">
                        These Terms and Conditions ("Terms") govern your use of the ISA AI Shopping Assistant platform ("ISA", "we", "us", or "our"), which provides intelligent shopping assistance via app, web, or messaging platforms. By accessing or using ISA, you ("User", "Customer", or "You") agree to be bound by these Terms and our Privacy Policy.
                      </p>
                      <p className="text-gray-800 font-medium">Please read them carefully before using the service.</p>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">1. OVERVIEW</h3>
                        <p className="text-sm">ISA is a smart shopping assistant that uses AI to help users discover, compare, and shop from a variety of brands and vendors. Through ISA, users can:</p>
                        <ul className="space-y-1 text-sm ml-4">
                          <li>• Receive personalized product recommendations</li>
                          <li>• Compare prices, styles, and features across vendors</li>
                          <li>• Make purchases directly or be redirected to third-party vendor platforms</li>
                          <li>• Save favorite items, track orders, and receive promotional deals</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">2. ELIGIBILITY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>2.1 Minimum Age:</strong> You must be at least 18 years old or have the consent of a parent or legal guardian to use the platform.</li>
                          <li><strong>2.2 Location:</strong> Some services or offers may only be available in specific countries or regions (e.g., Kenya). It is your responsibility to check availability.</li>
                          <li><strong>2.3 Account Accuracy:</strong> You agree to provide accurate and current information when creating an account or placing orders. ISA reserves the right to suspend or delete accounts with fraudulent or misleading information.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">3. PLATFORM USE</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>3.1 License:</strong> ISA grants you a limited, non-exclusive, non-transferable license to use the platform for personal shopping purposes.</li>
                          <li><strong>3.2 Prohibited Use:</strong> You agree not to:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Use the platform for illegal or harmful purposes</li>
                              <li>• Copy, distribute, or modify ISA's technology</li>
                              <li>• Harass or abuse vendors or other users</li>
                              <li>• Attempt to reverse-engineer ISA's AI systems</li>
                              <li>• Use bots or automated systems to scrape or exploit data</li>
                            </ul>
                          </li>
                          <li><strong>3.3 Content Ownership:</strong> ISA retains all rights to its technology, content, recommendation engines, and interface. You may not use ISA's content for commercial purposes without prior written consent.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">4. PRODUCT LISTINGS & PRICING</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>4.1 Vendor Responsibility:</strong> All products listed on ISA are supplied by third-party vendors. While ISA aims to curate high-quality, verified listings, the ultimate responsibility for product descriptions, pricing, availability, and delivery lies with the vendor.</li>
                          <li><strong>4.2 Pricing Errors:</strong> If an item is listed at an incorrect price, ISA reserves the right to cancel the transaction. You will be notified and refunded in such cases.</li>
                          <li><strong>4.3 Availability:</strong> Product availability is subject to change and may differ from real-time listings due to inventory or vendor system delays.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">5. ORDERS, PAYMENTS & DELIVERY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>5.1 Order Process:</strong> You may purchase items directly through ISA or via vendor redirection. You will receive confirmation once an order is successfully placed.</li>
                          <li><strong>5.2 Payment Methods:</strong> Payments can be made through supported mobile money, debit/credit cards, or other approved payment gateways.</li>
                          <li><strong>5.3 ISA as Facilitator:</strong> In most cases, ISA acts only as a facilitator, not the seller. The transaction contract is between you and the vendor.</li>
                          <li><strong>5.4 Delivery:</strong> Delivery times and logistics depend on the vendor or courier service. Estimated delivery times are provided for convenience but are not guaranteed.</li>
                          <li><strong>5.5 Fees & Charges:</strong> ISA may charge a service fee, convenience fee, or include promotional discounts. All charges will be clearly displayed before purchase confirmation.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">6. CANCELLATIONS, RETURNS & REFUNDS</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>6.1 Cancellation Policy:</strong> Cancellations may be allowed within a specific timeframe. Please check the vendor's terms or contact ISA support for help.</li>
                          <li><strong>6.2 Returns & Refunds:</strong> Refunds are handled per the vendor's policy. If a product is defective, incorrect, or undelivered, ISA may assist in dispute resolution but is not liable for compensation unless it is a direct seller.</li>
                          <li><strong>6.3 Refund Timeline:</strong> Refunds (where approved) may take up to 14 working days depending on your payment method.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">7. PROMOTIONS, OFFERS & REWARDS</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>7.1 Eligibility:</strong> Some promotions may be limited to specific users, regions, or product categories.</li>
                          <li><strong>7.2 ISA Discretion:</strong> ISA may cancel or modify offers without prior notice. Abuse or misuse of promotions may lead to account suspension.</li>
                          <li><strong>7.3 Referral Program:</strong> If ISA runs a referral program, rewards are only granted if terms are followed strictly (e.g., minimum spend, first-time user, etc.).</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">8. DATA PRIVACY & COMMUNICATION</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>8.1 Privacy Policy:</strong> Use of ISA is subject to our Privacy Policy. We collect and process your data to provide personalized shopping experiences, improve our services, and for operational analytics.</li>
                          <li><strong>8.2 Marketing Communication:</strong> By using ISA, you may receive promotional emails, SMS, or in-app notifications. You can opt-out at any time via your account settings.</li>
                          <li><strong>8.3 Third-Party Data:</strong> ISA may share non-personal data with vendors or partners to improve product recommendations and service delivery.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">9. ACCOUNT SECURITY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>9.1 Responsibility:</strong> You are responsible for maintaining the confidentiality of your account login details. ISA is not liable for unauthorized access resulting from negligence.</li>
                          <li><strong>9.2 Termination:</strong> ISA reserves the right to suspend or terminate accounts that violate these Terms, post offensive content, engage in fraud, or harm the platform's reputation.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">10. LIMITATION OF LIABILITY</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>10.1</strong> ISA is not liable for:
                            <ul className="ml-4 mt-1 space-y-1">
                              <li>• Any direct or indirect damage resulting from vendor errors, failed deliveries, or product defects</li>
                              <li>• Loss of data, income, or business opportunities</li>
                              <li>• Platform downtimes, bugs, or technical issues beyond our control</li>
                            </ul>
                          </li>
                          <li><strong>10.2</strong> ISA's total liability in any matter shall be limited to the value of the transaction in question or KES 5,000.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">11. DISPUTES & GOVERNING LAW</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>11.1 Dispute Resolution:</strong> If you are dissatisfied, please first contact isashoppingai@gmail.com. We aim to resolve issues promptly and fairly.</li>
                          <li><strong>11.2 Legal Jurisdiction:</strong> These Terms are governed by the laws of Kenya. Any legal proceedings must be brought before courts located in Kenya.</li>
                        </ul>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">12. MODIFICATIONS</h3>
                        <p className="text-sm">ISA reserves the right to update or modify these Terms at any time. Changes will be communicated via email or posted on the platform. Continued use after updates indicates acceptance of the new Terms.</p>
                        <p className="text-sm font-medium">By accessing or using ISA, you agree to be bound by these Terms and our Privacy Policy.</p>
                      </section>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Privacy Policy Dialog */}
            <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
              <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Privacy Policy</DialogTitle>
                </DialogHeader>
                <PrivacyPolicy />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthSignUp;
