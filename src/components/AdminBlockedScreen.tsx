import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminBlockedScreen = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            Wrong Device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Monitor className="h-5 w-5" />
              <p className="text-sm">Admin access is only available on the web platform</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Admin Portal:</strong> Please access the admin dashboard from your computer browser at the main website.
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              This mobile app is designed for customers and vendors only. All administrative functions must be performed through the web dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={handleLogout} className="w-full" variant="destructive">
              Logout
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Contact support: isashoppingai@gmail.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBlockedScreen;
