import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminSuspendedScreen = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Access Temporarily Limited</CardTitle>
          <CardDescription>
            Your admin access has been temporarily suspended
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your account access has been temporarily limited. Please contact the main administrator for more information.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-center">
              <strong>Support Email:</strong> isashoppingai@gmail.com
            </p>
          </div>
          <Button onClick={handleLogout} className="w-full" variant="outline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuspendedScreen;
