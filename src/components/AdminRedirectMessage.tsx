import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, ArrowLeft } from "lucide-react";

interface AdminRedirectMessageProps {
  onLogout: () => void;
}

const AdminRedirectMessage = ({ onLogout }: AdminRedirectMessageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Admin dashboard access is only available through the website. Please visit our website to access the admin panel.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => window.open('https://your-website.com/admin', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Website Admin
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="w-full text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This app is designed for customers and vendors only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRedirectMessage;