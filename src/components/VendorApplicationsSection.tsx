import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { AdminService, VendorApplication } from '@/services/adminService';

const VendorApplicationsSection = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorApplications(selectedStatus);
  }, [selectedStatus]);

  const fetchVendorApplications = async (status: 'pending' | 'approved' | 'rejected') => {
    setLoading(true);
    try {
      let data: VendorApplication[] = [];
      if (status === 'pending') {
        data = await AdminService.getPendingVendorApplications();
      } else if (status === 'approved') {
        data = await AdminService.getApprovedVendorApplications();
      } else if (status === 'rejected') {
        data = await AdminService.getRejectedVendorApplications();
      }
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: `Failed to fetch vendor applications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication || !adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide admin notes",
        variant: "destructive"
      });
      return;
    }

    setProcessingAction(true);
    try {
      await AdminService.approveVendorApplication(selectedApplication.id, adminNotes);

      toast({
        title: "Success",
        description: "Vendor application approved successfully"
      });

      await fetchVendorApplications(selectedStatus);
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication || !adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide admin notes",
        variant: "destructive"
      });
      return;
    }

    setProcessingAction(true);
    try {
      await AdminService.rejectVendorApplication(selectedApplication.id, adminNotes);

      toast({
        title: "Success",
        description: "Vendor application rejected"
      });

      await fetchVendorApplications(selectedStatus);
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    // These counts are now only for the selected status list, so we need to fetch all counts for the badges
    // For now, keep the old logic, but ideally, fetch all counts in parallel for accuracy
    // We'll use the applications array for the current tab, and show 0 for others
    return {
      pending: selectedStatus === 'pending' ? applications.length : 0,
      approved: selectedStatus === 'approved' ? applications.length : 0,
      rejected: selectedStatus === 'rejected' ? applications.length : 0,
    };
  };
  const statusCounts = getStatusCounts();

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Vendor Applications
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchVendorApplications(selectedStatus)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          <div className="flex gap-2 text-sm">
            <Button
              size="sm"
              variant={selectedStatus === 'pending' ? 'secondary' : 'outline'}
              onClick={() => setSelectedStatus('pending')}
              className={selectedStatus === 'pending' ? 'font-bold' : ''}
            >
              {statusCounts.pending} Pending
            </Button>
            <Button
              size="sm"
              variant={selectedStatus === 'approved' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('approved')}
              className={selectedStatus === 'approved' ? 'font-bold' : ''}
            >
              {statusCounts.approved} Approved
            </Button>
            <Button
              size="sm"
              variant={selectedStatus === 'rejected' ? 'destructive' : 'outline'}
              onClick={() => setSelectedStatus('rejected')}
              className={selectedStatus === 'rejected' ? 'font-bold' : ''}
            >
              {statusCounts.rejected} Rejected
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vendor applications found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.business_name}</div>
                        <div className="text-sm text-gray-500">{application.business_description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {application.first_name} {application.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{application.business_phone}</div>
                        <div>{application.business_email}</div>
                        {application.admin_notes && (
                          <div className="text-xs text-gray-500 mt-1">Admin Notes: {application.admin_notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {selectedStatus === 'pending' && application.status === 'pending' ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Application</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Business Name</label>
                                  <p className="text-sm">{application.business_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Applicant</label>
                                  <p className="text-sm">
                                    {application.first_name} {application.last_name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Business Email</label>
                                  <p className="text-sm">{application.business_email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Business Phone</label>
                                  <p className="text-sm">{application.business_phone}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Business Address</label>
                                  <p className="text-sm">{application.business_address}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Business Description</label>
                                  <p className="text-sm">{application.business_description}</p>
                                </div>
                                {(application.company_website || application.business_website) && (
                                  <div>
                                    <label className="text-sm font-medium">Website/Social Media Pages</label>
                                    <p className="text-sm">
                                      {application.company_website || application.business_website}
                                    </p>
                                  </div>
                                )}
                                {(application.tax_id) && (
                                  <div>
                                    <label className="text-sm font-medium">Tax ID/KRA PIN</label>
                                    <p className="text-sm">{application.tax_id}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Admin Notes</label>
                                <Textarea
                                  placeholder="Add notes about your decision..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplication(null);
                                    setAdminNotes('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={handleRejectApplication}
                                  disabled={processingAction}
                                >
                                  {processingAction ? 'Rejecting...' : 'Reject'}
                                </Button>
                                <Button
                                  onClick={handleApproveApplication}
                                  disabled={processingAction}
                                >
                                  {processingAction ? 'Approving...' : 'Approve'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {application.admin_notes && (
                            <div className="max-w-xs truncate" title={application.admin_notes}>
                              {application.admin_notes}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorApplicationsSection; 