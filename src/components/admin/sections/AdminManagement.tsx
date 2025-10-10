import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  user_id: string;
  role: string;
  is_active: boolean;
  is_suspended: boolean;
  created_at: string;
  email?: string;
  must_reset_password: boolean;
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("");

  const roleOptions = [
    { value: "vendor_admin", label: "Vendor Admin (Neptune)" },
    { value: "customer_service", label: "Customer Service (Jupiter)" },
    { value: "order_admin", label: "Order Admin (Mars)" },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data: adminRoles, error } = await supabase
        .from("admin_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch emails from auth.users
      const userIds = adminRoles?.map((a) => a.user_id) || [];
      const adminsWithEmails = await Promise.all(
        (adminRoles || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", admin.user_id)
            .single();
          
          return {
            ...admin,
            email: profile?.email || "Unknown",
          };
        })
      );

      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async () => {
    if (!newAdminEmail || !newAdminRole) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("create_admin_user", {
        _email: newAdminEmail,
        _role: newAdminRole,
        _created_by: user.id,
      });

      if (error) throw error;

      toast.success(`Admin created! Default password: Recipe@2025`);
      setNewAdminEmail("");
      setNewAdminRole("");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin");
    }
  };

  const toggleSuspension = async (userId: string, suspend: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("toggle_admin_suspension", {
        _user_id: userId,
        _suspend: suspend,
        _suspended_by: user.id,
      });

      if (error) throw error;

      toast.success(`Admin ${suspend ? "suspended" : "activated"} successfully`);
      fetchAdmins();
    } catch (error: any) {
      console.error("Error toggling suspension:", error);
      toast.error(error.message || "Failed to update admin status");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "main_admin":
        return "bg-purple-500";
      case "vendor_admin":
        return "bg-blue-500";
      case "customer_service":
        return "bg-green-500";
      case "order_admin":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "main_admin":
        return "Main Admin (Earth)";
      case "vendor_admin":
        return "Vendor Admin (Neptune)";
      case "customer_service":
        return "Customer Service (Jupiter)";
      case "order_admin":
        return "Order Admin (Mars)";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">Manage admin users and roles</p>
        </div>
      </div>

      {/* Create New Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Admin Role</Label>
              <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={createAdmin} className="w-full">
                Create Admin
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Default password: <strong>Recipe@2025</strong> (Admin will be required to reset on first login)
          </p>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.user_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{admin.email}</span>
                    {admin.must_reset_password && (
                      <Badge variant="outline" className="bg-yellow-50">
                        Password Reset Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(admin.role)}>
                      {getRoleDisplayName(admin.role)}
                    </Badge>
                    {admin.is_suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                    {!admin.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                {admin.role !== "main_admin" && (
                  <div className="flex gap-2">
                    {admin.is_suspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSuspension(admin.user_id, false)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSuspension(admin.user_id, true)}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
