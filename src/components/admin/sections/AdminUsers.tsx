import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [usersByCounty, setUsersByCounty] = useState<any[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchUsersByCounty();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'customer')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByCounty = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_type', 'customer');

      if (error) throw error;

      const countyCounts: Record<string, number> = {};
      data?.forEach((profile) => {
        const county = profile.location || 'Unknown';
        countyCounts[county] = (countyCounts[county] || 0) + 1;
      });

      const countyData = Object.entries(countyCounts)
        .map(([county, count]) => ({ county, count }))
        .sort((a, b) => b.count - a.count);

      setUsersByCounty(countyData);
    } catch (error) {
      console.error('Error fetching users by county:', error);
    }
  };

  const filteredUsers = selectedCounty === "all" 
    ? users 
    : users.filter(user => (user.location || 'Unknown') === selectedCounty);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage platform users and view statistics by county</p>
      </div>

      {/* Users by County Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Users by County</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {usersByCounty.map((item) => (
              <div
                key={item.county}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedCounty(item.county)}
              >
                <div className="font-semibold text-lg">{item.county}</div>
                <div className="text-2xl font-bold text-blue-600">{item.count} users</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by county" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {usersByCounty.map((item) => (
                  <SelectItem key={item.county} value={item.county}>
                    {item.county} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.email?.split('@')[0] || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.location || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone_number || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'approved' ? 'default' : 'secondary'}>
                      {user.status || 'approved'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedCounty === "all" 
                ? "No users found" 
                : `No users found in ${selectedCounty}`
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers; 