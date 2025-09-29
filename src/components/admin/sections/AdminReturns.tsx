import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Eye,
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RotateCcw,
  Calendar,
  User,
  Package
} from "lucide-react";
import { ReturnService } from "@/services/returnService";
import { ReturnRequest } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

const AdminReturns = () => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadReturnRequests();
  }, []);

  const loadReturnRequests = async () => {
    setLoading(true);
    try {
      const data = await ReturnService.getAllReturnRequests();
      setReturnRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load return requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      approved: { label: "Approved", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      completed: { label: "Completed", variant: "default" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    setProcessing(requestId);
    try {
      await ReturnService.updateReturnRequest({
        return_request_id: requestId,
        status: newStatus as any,
        admin_notes: adminNotes.trim() || undefined
      });

      toast({
        title: "Status Updated",
        description: `Return request ${newStatus} successfully`,
      });

      await loadReturnRequests();
      setAdminNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update return request status",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const filteredRequests = returnRequests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (request.user as any)?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (request.user as any)?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
          <p className="text-gray-600">Manage customer return requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search return requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Return Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests found</h3>
              <p className="text-gray-600 text-center">
                {searchQuery || statusFilter !== "all" 
                  ? "No return requests match your current filters." 
                  : "There are no return requests at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium text-gray-900">Request #{request.id.slice(-8)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {(request.user as any)?.first_name} {(request.user as any)?.last_name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{(request.product as any)?.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Reason:</strong> {request.reason}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Return Type:</strong> {request.return_type}
                      </div>
                      {request.message && (
                        <div className="text-sm text-gray-600">
                          <strong>Message:</strong> {request.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Order #{(request.order as any)?.order_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPrice((request.order as any)?.total_amount || 0)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                            disabled={processing === request.id}
                            className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                          >
                            {processing === request.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            disabled={processing === request.id}
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {processing === request.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Return Request Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Request ID</label>
                      <p className="text-gray-900">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedRequest.status)}
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Return Type</label>
                      <p className="text-gray-900 capitalize">{selectedRequest.return_type}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reason</label>
                    <p className="text-gray-900">{selectedRequest.reason}</p>
                  </div>
                  
                  {selectedRequest.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Message</label>
                      <p className="text-gray-900">{selectedRequest.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Number</label>
                      <p className="text-gray-900">#{(selectedRequest.order as any)?.order_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Order Total</label>
                      <p className="text-gray-900">{formatPrice((selectedRequest.order as any)?.total_amount || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer</label>
                      <p className="text-gray-900">{(selectedRequest.user as any)?.first_name} {(selectedRequest.user as any)?.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vendor</label>
                      <p className="text-gray-900">{(selectedRequest.vendor as any)?.first_name} {(selectedRequest.vendor as any)?.last_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {selectedRequest.status === 'pending' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this return request..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                        disabled={processing === selectedRequest.id}
                        className="flex items-center gap-2"
                      >
                        {processing === selectedRequest.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve Request
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                        disabled={processing === selectedRequest.id}
                        className="flex items-center gap-2"
                      >
                        {processing === selectedRequest.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Notes */}
              {(selectedRequest.admin_notes || selectedRequest.vendor_notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRequest.admin_notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                        <p className="text-gray-900">{selectedRequest.admin_notes}</p>
                      </div>
                    )}
                    {selectedRequest.vendor_notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vendor Notes</label>
                        <p className="text-gray-900">{selectedRequest.vendor_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReturns;
