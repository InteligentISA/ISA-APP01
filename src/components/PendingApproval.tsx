import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut, RefreshCw } from "lucide-react";

interface PendingApprovalProps {
  user: any;
  onLogout: () => void;
  onRefresh: () => void;
}

const PendingApproval = ({ user, onLogout, onRefresh }: PendingApprovalProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Application Pending
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your vendor application is under review
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`}
                  alt="Profile" 
                  className="w-20 h-20 rounded-full mx-auto border-4 border-blue-100"
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

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">What happens next?</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Our admin team will review your application</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• Once approved, you can start selling products</li>
                    <li>• This usually takes 1-2 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={onRefresh}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Approval Status
              </Button>
              
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
              <p>Need help? Contact support at support@isa.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApproval; 