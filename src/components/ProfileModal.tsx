import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { X, User, Mail, MapPin, Calendar, Edit3, Save, Camera, Building, Store, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileService } from "@/services/userProfileService";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

const ProfileModal = ({ isOpen, onClose, user, onUserUpdate }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    location: "",
    gender: "",
    phoneNumber: "",
    avatar: "",
    company: "",
    businessType: ""
  });
  const { toast } = useToast();
  const { user: authUser, userProfile, refreshUserProfile } = useAuth();

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        dob: userProfile.date_of_birth || "",
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        phoneNumber: userProfile.phone_number || "",
        avatar: userProfile.avatar_url || "",
        company: userProfile.company || "",
        businessType: userProfile.business_type || ""
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;

    setIsLoading(true);
    try {
      // Upload to cloud storage
      const { url, error } = await UserProfileService.uploadProfilePicture(file, authUser.id);
      
      if (error) {
        toast({
          title: "Upload Failed",
          description: error,
          variant: "destructive"
        });
        return;
      }

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, avatar: url }));
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) return;
    
    setIsLoading(true);
    try {
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dob,
        gender: formData.gender,
        location: formData.location,
        phone_number: formData.phoneNumber,
        avatar_url: formData.avatar,
        ...(userProfile?.user_type === 'vendor' && {
          company: formData.company,
          business_type: formData.businessType
        })
      };

      const { success, error } = await UserProfileService.updateUserProfile(authUser.id, updateData);
      
      if (!success) {
        toast({
          title: "Update Failed",
          description: error || "Failed to update profile.",
          variant: "destructive"
        });
        return;
      }

      setIsEditing(false);
      
      // Refresh the user profile in the auth context
      await refreshUserProfile();
      
      // Update the user object in the app
      const updatedUser = {
        ...user,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        dob: formData.dob,
        location: formData.location,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar,
        ...(userProfile?.user_type === 'vendor' && {
          company: formData.company,
          businessType: formData.businessType
        })
      };
      
      onUserUpdate(updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
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

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        dob: userProfile.date_of_birth || "",
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        phoneNumber: userProfile.phone_number || "",
        avatar: userProfile.avatar_url || "",
        company: userProfile.company || "",
        businessType: userProfile.business_type || ""
      });
    }
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-md bg-white backdrop-blur-sm border-gray-200 max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {formData.firstName?.charAt(0) || formData.lastName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">My Profile</CardTitle>
              {userProfile && (
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userProfile.user_type === 'vendor' ? 'Vendor' : 'Customer'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!userProfile ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name" className="mb-1 block">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="first-name"
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-900" 
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="last-name" className="mb-1 block">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input 
                        id="last-name"
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-gray-900" 
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="mb-1 block">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="email"
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900" 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dob" className="mb-1 block">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="dob"
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900" 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location" className="mb-1 block">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="location"
                      type="text" 
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900" 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="mb-1 block">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="phone"
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900" 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-1 block">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 z-50">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor-specific fields */}
                {userProfile?.user_type === 'vendor' && (
                  <>
                    <div>
                      <Label htmlFor="company" className="mb-1 block">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="company"
                          type="text" 
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="pl-10 bg-white border-gray-300 text-gray-900" 
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="business-type" className="mb-1 block">Business Type</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input 
                          id="business-type"
                          type="text" 
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="pl-10 bg-white border-gray-300 text-gray-900" 
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Add View Shipping Records button at the bottom */}
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => window.open('/my-shipping', '_blank')}
                className="w-full"
              >
                View My Shipping Records
              </Button>
            </div>

            <div className="flex gap-2 pt-4">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!userProfile}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileModal;
