import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, User, Mail, MapPin, Calendar, Building, Store, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { userProfile } = useAuth();

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
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                  {userProfile?.first_name?.charAt(0) || userProfile?.last_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
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
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading profile information...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                        {userProfile.first_name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                        {userProfile.last_name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                    <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                      {userProfile.email || 'Not provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Date of Birth
                      </label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                        {userProfile.date_of_birth || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded capitalize">
                        {userProfile.gender || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </label>
                    <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                      {userProfile.location || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                      {userProfile.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Vendor Information (if applicable) */}
                {userProfile.user_type === 'vendor' && (
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Store className="w-5 h-5 mr-2 text-blue-600" />
                      Business Information
                    </h3>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        Company Name
                      </label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                        {userProfile.company || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Business Type</label>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded capitalize">
                        {userProfile.business_type || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileModal;