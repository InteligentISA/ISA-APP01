import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const AdminVendors = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
    fetchPendingVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingVendors(data || []);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    }
  };

  const handleStatusUpdate = async (vendorId: string, newStatus: string, reason?: string) => {
    try {
      setProcessingAction(true);
      const updateData: any = { status: newStatus };
      
      // Only include rejection_reason if we're rejecting and have a reason
      if (newStatus === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      }
      // Note: We don't clear rejection_reason when approving to avoid column issues

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Vendor status updated to ${newStatus}`,
      });

      // Refresh data
      fetchVendors();
      fetchPendingVendors();
      
      // Close modals
      setShowDetailsModal(false);
      setShowRejectModal(false);
      setSelectedVendor(null);
      setRejectionReason("");
    } catch (error) {
      console.error('Error updating vendor status:', error);
      
      // Handle specific error for missing rejection_reason column
      if (error && typeof error === 'object' && 'message' in error && 
          error.message?.includes('rejection_reason')) {
        toast({
          title: "Database Update Required",
          description: "Please run the database migration to add the rejection_reason column, or contact your administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update vendor status",
          variant: "destructive"
        });
      }
    } finally {
      setProcessingAction(false);
    }
  };

  const handleViewDetails = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handleReject = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowRejectModal(true);
  };

  const handleRejectWithReason = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }
    handleStatusUpdate(selectedVendor.id, 'rejected', rejectionReason);
  };

  const filteredVendors = selectedStatus === "all" 
    ? vendors 
    : vendors.filter(vendor => vendor.status === selectedStatus);

  const VendorDetailsModal = () => (
    <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vendor Application Details
          </DialogTitle>
        </DialogHeader>
        
        {selectedVendor && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-sm">
                    {selectedVendor.first_name && selectedVendor.last_name 
                      ? `${selectedVendor.first_name} ${selectedVendor.last_name}`
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{selectedVendor.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="text-sm">{selectedVendor.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-sm">{selectedVendor.location || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                  <p className="text-sm">
                    {selectedVendor.date_of_birth 
                      ? new Date(selectedVendor.date_of_birth).toLocaleDateString()
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gender</Label>
                  <p className="text-sm">{selectedVendor.gender || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                  <p className="text-sm">{selectedVendor.business_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Company</Label>
                  <p className="text-sm">{selectedVendor.company || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Business Type</Label>
                  <p className="text-sm">{selectedVendor.business_type || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tax ID</Label>
                  <p className="text-sm">{selectedVendor.tax_id || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Company Website</Label>
                  <p className="text-sm">
                    {selectedVendor.company_website ? (
                      <a 
                        href={selectedVendor.company_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedVendor.company_website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Application Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Application Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application Date</Label>
                  <p className="text-sm">
                    {selectedVendor.created_at 
                      ? new Date(selectedVendor.created_at).toLocaleDateString()
                      : 'Not available'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge 
                    variant={
                      selectedVendor.status === 'approved' ? 'default' : 
                      selectedVendor.status === 'pending' ? 'secondary' : 
                      selectedVendor.status === 'rejected' ? 'destructive' : 'outline'
                    }
                  >
                    {selectedVendor.status || 'pending'}
                  </Badge>
                </div>
                {selectedVendor.rejection_reason && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {selectedVendor.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedVendor.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleStatusUpdate(selectedVendor.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  disabled={processingAction}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleReject(selectedVendor);
                  }}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 flex-1"
                  disabled={processingAction}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const RejectModal = () => (
    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Reject Vendor Application
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Reason for Rejection *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a reason for rejecting this vendor application..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleRejectWithReason}
              variant="destructive"
              className="flex-1"
              disabled={processingAction || !rejectionReason.trim()}
            >
              {processingAction ? 'Rejecting...' : 'Reject Application'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedVendor(null);
              }}
              variant="outline"
              className="flex-1"
              disabled={processingAction}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-2">Manage vendor applications and vendor data</p>
      </div>

      {/* Pending Applications */}
      {pendingVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Applications ({pendingVendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                      {vendor.first_name && vendor.last_name 
                        ? `${vendor.first_name} ${vendor.last_name}`
                        : vendor.email?.split('@')[0] || 'N/A'
                      }
                    </TableCell>
                    <TableCell>{vendor.email || 'N/A'}</TableCell>
                    <TableCell>{vendor.business_name || vendor.company || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vendor.location || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {vendor.created_at 
                        ? new Date(vendor.created_at).toLocaleDateString() 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processingAction}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(vendor)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          disabled={processingAction}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Vendors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Vendors</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
                <TableHead>Business</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    {vendor.first_name && vendor.last_name 
                      ? `${vendor.first_name} ${vendor.last_name}`
                      : vendor.email?.split('@')[0] || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{vendor.email || 'N/A'}</TableCell>
                  <TableCell>{vendor.business_name || vendor.company || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {vendor.location || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        vendor.status === 'approved' ? 'default' : 
                        vendor.status === 'pending' ? 'secondary' : 
                        vendor.status === 'rejected' ? 'destructive' : 'outline'
                      }
                    >
                      {vendor.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      let preferences = vendor.preferences;
                      if (typeof preferences === 'string') {
                        try { preferences = JSON.parse(preferences); } catch { preferences = {}; }
                      }
                      const plan = (preferences && typeof preferences === 'object' && 'plan' in preferences && typeof preferences.plan === 'string') 
                        ? preferences.plan.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : 'Free';
                      return <Badge variant="outline">{plan}</Badge>;
                    })()}
                  </TableCell>
                  <TableCell>
                    {vendor.created_at 
                      ? new Date(vendor.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(vendor)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {vendor.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(vendor.id, 'suspended')}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          disabled={processingAction}
                        >
                          Suspend
                        </Button>
                      )}
                      {vendor.status === 'suspended' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processingAction}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredVendors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {selectedStatus === "all" 
                ? "No vendors found" 
                : `No vendors with status: ${selectedStatus}`
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <VendorDetailsModal />
      <RejectModal />
    </div>
  );
};

export default AdminVendors; 