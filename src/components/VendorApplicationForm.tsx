import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  MapPin,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  X
} from 'lucide-react';

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

const getAvailableConstituencies = (county: string) => {
  return countyConstituencyData[county as keyof typeof countyConstituencyData] || [];
};

interface VendorApplicationFormProps {
  userId: string;
  onComplete: () => void;
  onProgressChange?: (progress: number) => void;
}

const VendorApplicationForm = ({ userId, onComplete, onProgressChange }: VendorApplicationFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    accountType: '',
    businessName: '',
    brandName: '',
    email: '',
    phone: '',
    businessType: '',
    otherBusinessType: '',
    description: '',
    websiteUrl: '',
    location: { county: '', constituency: '' },
    heardAboutUs: '',
    otherHeardAboutUs: '',
    documents: {
      idCard: null as File | null,
      businessLicense: null as File | null,
      bankName: '',
      accountNumber: '',
      accountHolderName: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpData, setHelpData] = useState({ phone: '', message: '' });
  const [submittingHelp, setSubmittingHelp] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Account Type', description: 'Basic information' },
    { id: 2, title: 'Contact Details', description: 'Contact information' },
    { id: 3, title: 'Business Info', description: 'Business details' },
    { id: 4, title: 'Documents', description: 'Required documents' }
  ];

  // Calculate progress
  const totalFields = 15; // Updated total fields
  const completedFields = [
    formData.accountType,
    formData.businessName,
    formData.brandName,
    formData.heardAboutUs,
    formData.email,
    formData.phone,
    formData.businessType,
    formData.description,
    formData.websiteUrl,
    formData.location.county,
    formData.location.constituency,
    formData.documents.idCard,
    formData.documents.businessLicense,
    formData.documents.bankName,
    formData.documents.accountNumber,
    formData.documents.accountHolderName
  ].filter(Boolean).length;

  const progress = (completedFields / totalFields) * 100;

  // Update progress callback
  React.useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.accountType && formData.businessName && formData.brandName && formData.heardAboutUs;
      case 2:
        return formData.email && formData.phone && formData.location.county && formData.location.constituency;
      case 3:
        return formData.businessType && formData.description && formData.websiteUrl;
      case 4:
        return formData.documents.idCard && formData.documents.bankName && formData.documents.accountNumber && formData.documents.accountHolderName;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (field: keyof typeof formData.documents, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Upload files to Supabase Storage using the correct bucket
      const idCardUrl = formData.documents.idCard ? await uploadFile(formData.documents.idCard, 'id-card') : null;
      const businessLicenseUrl = formData.documents.businessLicense ? await uploadFile(formData.documents.businessLicense, 'business-license') : null;

      // Save application data
      const { error } = await supabase
        .from('vendor_application_steps')
        .upsert({
          user_id: userId,
          step_name: 'application_form',
          step_data: {
            accountType: formData.accountType,
            businessName: formData.businessName,
            brandName: formData.brandName,
            email: formData.email,
            phone: formData.phone,
            businessType: formData.businessType,
            otherBusinessType: formData.otherBusinessType,
            description: formData.description,
            websiteUrl: formData.websiteUrl,
            location: formData.location,
            heardAboutUs: formData.heardAboutUs,
            otherHeardAboutUs: formData.otherHeardAboutUs,
            documents: {
              idCard: idCardUrl,
              businessLicense: businessLicenseUrl,
              bankName: formData.documents.bankName,
              accountNumber: formData.documents.accountNumber,
              accountHolderName: formData.documents.accountHolderName
            }
          },
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update profiles table with new fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.brandName,
          last_name: formData.businessName,
          email: formData.email,
          phone_number: formData.phone,
          company: formData.businessName,
          business_type: formData.businessType,
          location: `${formData.location.county}, ${formData.location.constituency}`,
          heard_about_us: formData.heardAboutUs,
          brand_name: formData.brandName,
          website_url: formData.websiteUrl,
          bank_name: formData.documents.bankName,
          account_number: formData.documents.accountNumber,
          account_holder_name: formData.documents.accountHolderName
        })
        .eq('id', userId);

      if (profileError) throw profileError;



      toast({
        title: "Application Submitted",
        description: "Your vendor application has been submitted successfully. We'll review it and get back to you soon.",
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, fileName: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `vendor-documents/${userId}/${fileName}.${fileExt}`;

      // Try to upload directly first
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // If bucket doesn't exist, try to create it or use a different approach
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          throw new Error('Storage bucket not configured. Please contact support.');
        }
        
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  };

  const submitHelpRequest = async () => {
    if (!helpData.phone || !helpData.message) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and message.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingHelp(true);
    try {
      // Insert support request directly into the table
      const { error } = await supabase
        .from('support_requests' as any)
        .insert({
          user_id: userId,
          phone_number: helpData.phone,
          message: helpData.message,
          request_type: 'onboarding_help'
        });

      if (error) throw error;

      toast({
        title: "Help Request Submitted",
        description: "We'll get back to you shortly. Thank you for reaching out!",
      });

      setShowHelpModal(false);
      setHelpData({ phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast({
        title: "Error",
        description: "Failed to submit help request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingHelp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowHelpModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
      {/* Progress Steps */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Application Progress</h2>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-green-50 border border-green-200'
                        : isCurrent
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Account Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Account Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please provide your basic account information. This will help us set up your vendor profile correctly.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="heardAboutUs" className="text-sm font-medium text-gray-700">
                    How did you hear about us? *
                  </Label>
                  <Select
                    value={formData.heardAboutUs}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, heardAboutUs: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select how you heard about us" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contacted_by_isa">I was contacted by ISA</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="tv_ads">TV Ads</SelectItem>
                      <SelectItem value="referred_by_friend">Referred by friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.heardAboutUs === 'other' && (
                  <div>
                    <Label htmlFor="otherHeardAboutUs" className="text-sm font-medium text-gray-700">
                      Please specify
                    </Label>
                    <Input
                      id="otherHeardAboutUs"
                      value={formData.otherHeardAboutUs}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherHeardAboutUs: e.target.value }))}
                      placeholder="How did you hear about us?"
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="accountType" className="text-sm font-medium text-gray-700">
                    Account Type *
                  </Label>
                  <RadioGroup
                    value={formData.accountType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="cursor-pointer">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="cursor-pointer">Business</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                    Business Name *
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="brandName" className="text-sm font-medium text-gray-700">
                    Brand Name *
                  </Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Enter your brand name"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Contact Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please provide your contact details so we can reach you regarding your application and future business.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="254712345678"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                    County *
                  </Label>
                  <Select
                    value={formData.location.county}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, county: value, constituency: '' }
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(countyConstituencyData).map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="constituency" className="text-sm font-medium text-gray-700">
                    Constituency *
                  </Label>
                  <Select
                    value={formData.location.constituency}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, constituency: value }
                    }))}
                    disabled={!formData.location.county}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your constituency" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableConstituencies(formData.location.county).map((constituency) => (
                        <SelectItem key={constituency} value={constituency}>
                          {constituency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Business Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Business Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Tell us more about your business to help us understand your operations and provide better support.
                </p>
              </div>

              <div>
                <Label htmlFor="businessType" className="text-sm font-medium text-gray-700">
                  In what industry does your business operate? *
                </Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your business industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="electronics">Electronics & Technology</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                    <SelectItem value="sports">Sports & Outdoor</SelectItem>
                    <SelectItem value="books">Books & Media</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="food">Food & Beverages</SelectItem>
                    <SelectItem value="jewelry">Jewelry & Accessories</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="art">Art & Crafts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.businessType === 'other' && (
                <div>
                  <Label htmlFor="otherBusinessType" className="text-sm font-medium text-gray-700">
                    Please specify your business type
                  </Label>
                  <Input
                    id="otherBusinessType"
                    value={formData.otherBusinessType}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherBusinessType: e.target.value }))}
                    placeholder="Describe your business type"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Business Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business, products, and what makes you unique..."
                  className="w-full min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
                  Website/Social Media URL
                </Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://your-website.com or social media profile"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Required Documents</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please upload the required documents to complete your application. All documents will be kept secure and confidential.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="idCard" className="text-sm font-medium text-gray-700">
                    National ID / Passport *
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">Required for verification</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="idCard"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('idCard', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="idCard" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.documents.idCard ? formData.documents.idCard.name : 'Click to upload ID/Passport'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessLicense" className="text-sm font-medium text-gray-700">
                    Business License (Optional)
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">If you have a business license, please upload it</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="businessLicense"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="businessLicense" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.documents.businessLicense ? formData.documents.businessLicense.name : 'Click to upload Business License'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                        Bank Name (for withdrawals) *
                      </Label>
                      <Input
                        id="bankName"
                        value={formData.documents.bankName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, bankName: e.target.value }
                        }))}
                        placeholder="e.g., Equity Bank, KCB, Co-op Bank"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                        Account Number *
                      </Label>
                      <Input
                        id="accountNumber"
                        value={formData.documents.accountNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, accountNumber: e.target.value }
                        }))}
                        placeholder="Enter your account number"
                        className="w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700">
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountHolderName"
                        value={formData.documents.accountHolderName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documents: { ...prev.documents, accountHolderName: e.target.value }
                        }))}
                        placeholder="Name as it appears on the bank account"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Application</span>
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Help</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="helpPhone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="helpPhone"
                  value={helpData.phone}
                  onChange={(e) => setHelpData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="helpMessage" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <Textarea
                  id="helpMessage"
                  value={helpData.message}
                  onChange={(e) => setHelpData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe what you need help with..."
                  className="w-full min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowHelpModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitHelpRequest}
                  disabled={submittingHelp || !helpData.phone || !helpData.message}
                  className="flex-1"
                >
                  {submittingHelp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApplicationForm;

