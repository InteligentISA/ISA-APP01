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
  MapPin
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
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    otherBusinessType: '',
    description: '',
    location: { county: '', constituency: '' },
    documents: {
      idCard: null as File | null,
      businessCert: null as File | null,
      pinCert: null as File | null,
      bankDetails: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    updateProgress();
  };

  const handleLocationChange = (county: string, constituency: string) => {
    setFormData(prev => ({
      ...prev,
      location: { county, constituency }
    }));
    updateProgress();
  };

  const handleDocumentUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
    updateProgress();
  };

  const updateProgress = () => {
    let completedFields = 0;
    let totalFields = 0;

    // Step 1: Account Type (2 fields)
    totalFields += 2;
    if (formData.accountType) completedFields++;
    if (formData.businessName) completedFields++;
    if (formData.contactPerson) completedFields++;

    // Step 2: Contact Details (4 fields)
    totalFields += 4;
    if (formData.email) completedFields++;
    if (formData.phone) completedFields++;
    if (formData.businessType) completedFields++;
    if (formData.businessType === 'other' ? formData.otherBusinessType : true) completedFields++;
    if (formData.location.county) completedFields++;
    if (formData.location.constituency) completedFields++;

    // Step 3: Business Description (1 field)
    totalFields += 1;
    if (formData.description) completedFields++;

    // Step 4: Documents (2 required fields)
    totalFields += 2;
    if (formData.documents.idCard) completedFields++;
    if (formData.documents.bankDetails) completedFields++;

    const progress = Math.round((completedFields / totalFields) * 100);
    onProgressChange?.(progress);
  };

  const uploadDocument = async (file: File, fileName: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `vendor-documents/${userId}/${fileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Upload documents
      const documentUrls: Record<string, string> = {};
      if (formData.documents.idCard) {
        documentUrls.idCard = await uploadDocument(formData.documents.idCard, 'id-card');
      }
      if (formData.documents.businessCert) {
        documentUrls.businessCert = await uploadDocument(formData.documents.businessCert, 'business-cert');
      }
      if (formData.documents.pinCert) {
        documentUrls.pinCert = await uploadDocument(formData.documents.pinCert, 'pin-cert');
      }

      // Insert vendor application step record - using type assertion for Supabase types
      const { error: appError } = await supabase
        .from('vendor_application_steps' as any)
        .insert([
          {
            user_id: userId,
            step_name: 'application_form',
            step_data: {
              accountType: formData.accountType,
              businessName: formData.businessName,
              contactPerson: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              businessType: formData.businessType,
              otherBusinessType: formData.otherBusinessType,
              description: formData.description,
              location: formData.location,
              documents: {
                bankDetails: formData.documents.bankDetails,
                ...documentUrls
              }
            },
            is_completed: true,
            completed_at: new Date().toISOString()
          },
        ]);
      if (appError) throw appError;

      // Update profile with vendor status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.contactPerson.split(' ')[0] || formData.contactPerson,
          last_name: formData.contactPerson.split(' ').slice(1).join(' ') || '',
          company: formData.businessName,
          business_type: formData.businessType === 'other' ? formData.otherBusinessType : formData.businessType,
          phone_number: formData.phone,
          user_type: 'vendor',
          status: 'pending',
          location: `${formData.location.county}, ${formData.location.constituency}`
        })
        .eq('id', userId);
      if (profileError) throw profileError;

      toast({
        title: "Application Submitted",
        description: "Your vendor application has been submitted successfully!"
      });
      onComplete();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.accountType && formData.businessName && formData.contactPerson;
      case 2:
        return formData.email && formData.phone && formData.businessType && 
               (formData.businessType !== 'other' || formData.otherBusinessType) &&
               formData.location.county && formData.location.constituency;
      case 3:
        return formData.description;
      case 4:
        return formData.documents.idCard && formData.documents.bankDetails;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Account Type</Label>
              <RadioGroup 
                value={formData.accountType} 
                onValueChange={(value) => handleInputChange('accountType', value)}
                className="mt-2 space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="text-sm">Individual Seller (small business or single person)</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="corporate" id="corporate" />
                  <Label htmlFor="corporate" className="text-sm">Corporate Seller (registered business/brand)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business/Personal Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business or personal name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Primary contact person name"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+254 XXX XXX XXX"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion">Fashion & Clothing</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                  <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  <SelectItem value="books">Books & Media</SelectItem>
                  <SelectItem value="toys">Toys & Games</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.businessType === 'other' && (
              <div>
                <Label htmlFor="otherBusinessType">Please specify your business type</Label>
                <Input
                  id="otherBusinessType"
                  value={formData.otherBusinessType}
                  onChange={(e) => handleInputChange('otherBusinessType', e.target.value)}
                  placeholder="e.g., Food & Beverage, Health & Wellness, etc."
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Business Location
              </Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="county" className="text-sm font-medium">County</Label>
                  <Select 
                    value={formData.location.county} 
                    onValueChange={(value) => handleLocationChange(value, '')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(countyConstituencyData).map(county => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="constituency" className="text-sm font-medium">Constituency</Label>
                  <Select 
                    value={formData.location.constituency} 
                    onValueChange={(value) => handleLocationChange(formData.location.county, value)}
                    disabled={!formData.location.county}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={formData.location.county ? "Select constituency" : "Select county first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableConstituencies(formData.location.county).map(constituency => (
                        <SelectItem key={constituency} value={constituency}>
                          {constituency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your business, products you sell, and what makes you unique..."
                rows={5}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Required Documents</Label>
              <p className="text-sm text-gray-600 mt-1">
                Upload the following documents based on your account type
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="idCard">National ID / Passport *</Label>
                <Input
                  id="idCard"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload('idCard', e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              {formData.accountType === 'corporate' && (
                <>
                  <div>
                    <Label htmlFor="businessCert">Certificate of Incorporation</Label>
                    <Input
                      id="businessCert"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload('businessCert', e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pinCert">PIN/VAT Certificate</Label>
                    <Input
                      id="pinCert"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload('pinCert', e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="bankDetails">Bank Account Details *</Label>
                <Textarea
                  id="bankDetails"
                  value={formData.documents.bankDetails}
                  onChange={(e) => handleInputChange('documents', {
                    ...formData.documents,
                    bankDetails: e.target.value
                  })}
                  placeholder="Bank name, account number, account holder name..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: "Account Type", icon: User },
    { number: 2, title: "Contact Details", icon: Phone },
    { number: 3, title: "Business Info", icon: Building },
    { number: 4, title: "Documents", icon: FileText }
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 p-4">
      {/* Progress Steps */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-green-800">Step {currentStep} of {steps.length}</span>
            <span className="text-sm font-medium text-green-700">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-3 bg-green-100" />
          <div className="mt-4">
            <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
              {(() => {
                const IconComponent = steps[currentStep - 1]?.icon;
                return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
              })()}
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-green-700 mt-1">
              {currentStep === 1 && "Tell us about your business type and basic information"}
              {currentStep === 2 && "Provide your contact details and business location"}
              {currentStep === 3 && "Describe your business and what makes you unique"}
              {currentStep === 4 && "Upload required documents to complete your application"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          {renderStep()}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="flex items-center justify-center order-2 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700 flex items-center justify-center order-1 sm:order-2"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {currentStep === steps.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Almost Done!</h4>
                <p className="text-sm text-green-700">
                  After submitting your application, you'll proceed to vendor training to learn about our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorApplicationForm;

