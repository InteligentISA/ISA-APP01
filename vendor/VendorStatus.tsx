
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useVendor } from "@/contexts/VendorContext";
import { supabase } from "@/integrations/supabase/client";

const VendorStatus = () => {
  const { vendorStatus, setVendorStatus, setIsVendor } = useVendor();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVendorStatus = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, status')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.user_type === 'vendor') {
            setIsVendor(true);
            setVendorStatus((profile.status as 'pending' | 'approved' | 'rejected') || 'pending');
          }
        }
      } catch (error) {
        console.error('Error fetching vendor status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if vendorStatus is null (not set yet)
    if (vendorStatus === null) {
      fetchVendorStatus();
    } else {
      setLoading(false);
    }
  }, [vendorStatus, setVendorStatus, setIsVendor]);

  const getStatusIcon = () => {
    switch (vendorStatus) {
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (vendorStatus) {
      case 'approved':
        return {
          title: "Application Approved! 🎉",
          message: "Congratulations! Your vendor application has been approved. You can now start adding products and managing your store.",
          action: "Go to Dashboard"
        };
      case 'pending':
        return {
          title: "Application Under Review ⏳",
          message: "Thank you for your application! We're currently reviewing your submission. We'll notify you once we have an update. This usually takes 24-72 hours.",
          action: "Back to Home"
        };
      case 'rejected':
        return {
          title: "Application Needs Attention ❌",
          message: "Unfortunately, your application didn't meet our current requirements. Don't worry - you can update your information and reapply.",
          action: "Appeal Application"
        };
      default:
        return {
          title: "Status Unknown",
          message: "We couldn't determine your application status. Please contact support.",
          action: "Contact Support"
        };
    }
  };

  const handleAction = () => {
    if (vendorStatus === 'approved') {
      window.location.href = '/vendor-dashboard';
    } else if (vendorStatus === 'rejected') {
      window.location.href = '/vendors';
    } else {
      window.location.href = '/';
    }
  };

  const status = getStatusMessage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Loading vendor status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">{status.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600 leading-relaxed">
            {status.message}
          </p>
          
          {vendorStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-yellow-700 space-y-1 text-left">
                <li>• We review your business information</li>
                <li>• We verify your product quality standards</li>
                <li>• We check compliance with our policies</li>
                <li>• You'll receive an email with the decision</li>
              </ul>
            </div>
          )}

          {vendorStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Common reasons for rejection:</h4>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Incomplete business information</li>
                <li>• Product quality concerns</li>
                <li>• Policy compliance issues</li>
                <li>• Insufficient business documentation</li>
              </ul>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleAction}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {status.action}
            </Button>
            
            {vendorStatus !== 'approved' && (
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorStatus;
