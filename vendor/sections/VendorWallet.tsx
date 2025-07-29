import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, DollarSign, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  mpesa_number: string;
  created_at: string;
  processed_at?: string | null;
  vendor_id: string;
  updated_at: string;
}

interface PayoutPreferences {
  mpesa_number?: string;
  last_updated?: string;
}

interface VendorWalletProps {
  vendorId: string;
}

const VendorWallet = ({ vendorId }: VendorWalletProps) => {
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [payoutLastUpdated, setPayoutLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();
  const [canWithdraw, setCanWithdraw] = useState(true);

  useEffect(() => {
    fetchWalletData();
    fetchWithdrawals();
    fetchPayoutInfo();
  }, [vendorId]);

  const fetchWalletData = async () => {
    // Verify vendor authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== vendorId) {
      toast({
        title: "Access Denied",
        description: "Unauthorized access to wallet data.",
        variant: "destructive"
      });
      return;
    }

    // Fetch all orders for this vendor with proper filtering
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`*, order_items(*, products!inner(vendor_id))`)
      .eq('order_items.products.vendor_id', vendorId);
    
    if (error) {
      setBalance({ available: 0, pending: 0 });
      return;
    }
    
    // Calculate available and pending balances
    let available = 0;
    let pending = 0;
    const COMMISSION = 0.1; // 10% for free plan, adjust as needed
    
    for (const order of orders || []) {
      // Only count orders for this vendor
      const vendorOrderItems = (order.order_items || []).filter((item: any) => item.products?.vendor_id === vendorId);
      const total = vendorOrderItems.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
      
      if (order.status === 'completed') {
        available += total * (1 - COMMISSION);
      } else {
        pending += total * (1 - COMMISSION);
      }
    }
    
    // Subtract already withdrawn amounts
    const { data: withdrawnAmounts } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('vendor_id', vendorId)
      .eq('status', 'completed');
    
    const totalWithdrawn = withdrawnAmounts?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
    available = Math.max(0, available - totalWithdrawn);
    
    setBalance({ available, pending });
  };

  const fetchWithdrawals = async () => {
    // Fetch real withdrawal history from withdrawals table
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) {
      setWithdrawals([]);
      return;
    }
    setWithdrawals(data || []);
  };

  const fetchPayoutInfo = async () => {
    // Verify vendor authorization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== vendorId) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', vendorId)
      .single();
    
    if (error || !data) return;
    
    let preferences: any = data.preferences;
    if (typeof preferences === 'string') {
      try { 
        preferences = JSON.parse(preferences); 
      } catch { 
        preferences = {}; 
      }
    }
    
    const payout = (preferences as any)?.payout || {};
    setMpesaNumber(payout.mpesa_number || '');
    setPayoutLastUpdated(payout.last_updated || null);
    
    // Enforce 24hr rule
    if (payout.last_updated) {
      const last = new Date(payout.last_updated).getTime();
      const now = Date.now();
      setCanWithdraw(now - last > 24 * 60 * 60 * 1000);
    } else {
      setCanWithdraw(true);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive"
      });
      return;
    }
    if (amount > balance.available) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance for this withdrawal.",
        variant: "destructive"
      });
      return;
    }
    if (!mpesaNumber || mpesaNumber.length < 10) {
      toast({
        title: "Invalid Payout Number",
        description: "Please update your payout info in Settings.",
        variant: "destructive"
      });
      return;
    }
    if (!canWithdraw) {
      toast({
        title: "Withdrawal Restricted",
        description: "You can only withdraw 24 hours after updating your payout info.",
        variant: "destructive"
      });
      return;
    }
    // Insert withdrawal into withdrawals table
    const { error } = await supabase
      .from('withdrawals')
      .insert({
        vendor_id: vendorId,
        amount,
        mpesa_number: mpesaNumber,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    if (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Could not submit withdrawal request.",
        variant: "destructive"
      });
      return;
    }
    fetchWithdrawals();
    setWithdrawAmount("");
    setIsWithdrawDialogOpen(false);
    toast({
      title: "Withdrawal Initiated",
      description: `Your withdrawal of KES ${amount.toLocaleString()} has been submitted for processing.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {balance.available.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              KES {balance.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing withdrawals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Available for withdrawal: <span className="font-medium">KES {balance.available.toLocaleString()}</span>
              </p>
              <p className="text-xs text-gray-500">
                Withdrawals are processed within 24 hours during business days.
              </p>
            </div>
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2" disabled={balance.available <= 0}>
                  <Download className="h-4 w-4" />
                  <span>Withdraw Funds</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription className="sr-only">
                    Withdraw your available funds to your M-Pesa account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      max={balance.available}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpesa">M-Pesa Number</Label>
                    <Input
                      id="mpesa"
                      value={mpesaNumber}
                      readOnly
                      placeholder="254712345678"
                    />
                  </div>
                  {!canWithdraw && (
                    <div className="text-xs text-red-600">You can only withdraw 24 hours after updating your payout info.</div>
                  )}
                  <Button onClick={handleWithdraw} className="w-full">
                    Initiate Withdrawal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No withdrawals yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>M-Pesa Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="font-medium">
                      KES {withdrawal.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{withdrawal.mpesa_number}</TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell>
                      {format(new Date(withdrawal.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_at 
                        ? format(new Date(withdrawal.processed_at), 'MMM dd, yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorWallet;