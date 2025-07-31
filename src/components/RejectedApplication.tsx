import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, LogOut, Mail, Phone } from "lucide-react";

interface RejectedApplicationProps {
  user: any;
  onLogout: () => void;
  rejectionReason?: string;
}

const RejectedApplication = ({ user, onLogout, rejectionReason }: RejectedApplicationProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Rejected
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your vendor application does not meet our terms of service
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto border-4 border-red-100"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.name || user?.first_name || 'Vendor'}
              </h3>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
              {user?.company && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.company}
                </p>
              )}
            </div>

            {rejectionReason && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900">Reason for Rejection</h4>
                    <p className="text-sm text-red-800 mt-2">
                      {rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Need Help?</h4>
                  <p className="text-sm text-gray-700 mt-2">
                    If you believe this was an error or have questions about our requirements, 
                    please contact our support team.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>support@isa.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>+254 700 000 000</span>
                </div>
              </div>
              
              <Button 
                onClick={onLogout}
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Thank you for your interest in joining ISA</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RejectedApplication; 