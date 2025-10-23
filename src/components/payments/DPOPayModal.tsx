import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { initiateDPOPayment, getDPOPaymentStatus, DPOPayMethod } from "@/services/dpoPayService";
import DPOPayTerms from "./DPOPayTerms";

interface DPOPayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  paymentMethod?: 'mpesa' | 'airtel' | 'card' | 'bank';
  paymentDetails?: {
    phoneNumber?: string;
    cardDetails?: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      cardholderName: string;
    };
    bankDetails?: {
      accountNumber: string;
      bankName: string;
      accountHolderName: string;
    };
  };
  onSuccess?: (tx: { transaction_id: string; provider: string }) => void;
}

export default function DPOPayModal({ open, onOpenChange, userId, amount, currency = 'KES', orderId, description, paymentMethod, paymentDetails, onSuccess }: DPOPayModalProps) {
  const [loading, setLoading] = useState<DPOPayMethod | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const pollRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const { toast } = useToast();

  async function handlePay(method: DPOPayMethod) {
    try {
      setLoading(method);
      setRetryCount(0);
      
      // Prepare payment parameters based on method
      const paymentParams: any = {
        user_id: userId, 
        amount, 
        currency, 
        method, 
        order_id: orderId, 
        description 
      };

      // Add method-specific details
      if (method === 'mpesa' || method === 'airtel') {
        paymentParams.phone_number = paymentDetails?.phoneNumber;
      } else if (method === 'card') {
        paymentParams.card_details = paymentDetails?.cardDetails;
      } else if (method === 'bank') {
        paymentParams.bank_details = paymentDetails?.bankDetails;
      }

      const resp = await initiateDPOPayment(paymentParams);
      setTransactionId(resp.transaction_id);
      setStatus('pending');
      setStatusMessage('Processing payment with DPO...');
      
      if (resp.redirect_url) {
        window.location.href = resp.redirect_url;
      } else {
        startPolling(resp.transaction_id);
      }
    } catch (e: any) {
      setStatus('failed');
      setStatusMessage('Payment initiation failed. Please try again.');
      toast({ 
        title: 'Payment Failed', 
        description: e?.message ?? 'Failed to initiate payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleRetry() {
    if (!transactionId) return;
    
    setRetryCount(prev => prev + 1);
    setStatus('pending');
    setStatusMessage('Retrying payment...');
    startPolling(transactionId);
  }

  function startPolling(id: string) {
    if (pollRef.current) { 
      clearInterval(pollRef.current); 
      pollRef.current = null; 
    }
    pollStartRef.current = Date.now();
    setStatus('pending');
    setStatusMessage('Waiting for payment confirmation...');
    
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await getDPOPaymentStatus(id);
        if (res.status === 'success') {
          setStatus('success');
          setStatusMessage('Payment confirmed! Processing your order...');
          if (onSuccess) onSuccess({ transaction_id: id, provider: res.provider });
          stopPolling();
          setTimeout(() => onOpenChange(false), 2000);
        } else if (res.status === 'failed') {
          setStatus('failed');
          setStatusMessage('Payment failed. You can try again or use a different payment method.');
          stopPolling();
        } else {
          setStatus('pending');
          setStatusMessage('Payment is being processed. Please wait...');
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
      }
      
      // Timeout after 3 minutes
      if (pollStartRef.current && Date.now() - pollStartRef.current > 180000) {
        setStatus('failed');
        setStatusMessage('Payment is taking longer than expected. Please check your payment method or try again.');
        stopPolling();
      }
    }, 4000);
  }

  function stopPolling() {
    if (pollRef.current) { 
      clearInterval(pollRef.current); 
      pollRef.current = null; 
    }
  }

  useEffect(() => {
    if (!open) {
      stopPolling();
      setTransactionId(null);
      setStatus('idle');
      setStatusMessage('');
      setRetryCount(0);
    }
    return () => { stopPolling(); };
  }, [open]);

  const getPaymentMethodLabel = (method: DPOPayMethod) => {
    switch (method) {
      case 'mpesa': return 'M-Pesa';
      case 'airtel': return 'Airtel Money';
      case 'card': return 'Card Payment';
      case 'bank': return 'Bank Transfer';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
              DPO
            </div>
            <span>Secure Payment with DPO</span>
          </DialogTitle>
          <DialogDescription>
            All payments are processed securely by DPO Group. Your payment information is encrypted and protected.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {paymentMethod === 'mpesa' && (
            <Button 
              disabled={loading !== null} 
              onClick={() => handlePay('mpesa')} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading === 'mpesa' ? 'Processing...' : 'Pay with M-Pesa'}
            </Button>
          )}
          
          {paymentMethod === 'airtel' && (
            <Button 
              disabled={loading !== null} 
              onClick={() => handlePay('airtel')} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading === 'airtel' ? 'Processing...' : 'Pay with Airtel Money'}
            </Button>
          )}
          
          {paymentMethod === 'card' && (
            <Button 
              disabled={loading !== null} 
              onClick={() => handlePay('card')} 
              variant="outline" 
              className="w-full"
            >
              {loading === 'card' ? 'Processing...' : 'Pay with Card'}
            </Button>
          )}
          
          {paymentMethod === 'bank' && (
            <Button 
              disabled={loading !== null} 
              onClick={() => handlePay('bank')} 
              variant="secondary" 
              className="w-full"
            >
              {loading === 'bank' ? 'Processing...' : 'Pay with Bank Transfer'}
            </Button>
          )}

          {status !== 'idle' && (
            <div className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Payment Status</div>
                  <div className="text-muted-foreground">{statusMessage}</div>
                  {transactionId && (
                    <div className="text-xs mt-1 text-muted-foreground">Ref: {transactionId}</div>
                  )}
                  {retryCount > 0 && (
                    <div className="text-xs mt-1 text-muted-foreground">Retry: {retryCount}</div>
                  )}
                </div>
                <div className="ml-4">
                  {status === 'pending' && <span className="animate-pulse inline-block h-3 w-3 rounded-full bg-amber-500" />}
                  {status === 'success' && <span className="inline-block h-3 w-3 rounded-full bg-green-600" />}
                  {status === 'failed' && <span className="inline-block h-3 w-3 rounded-full bg-red-600" />}
                </div>
              </div>
              
              {status === 'failed' && (
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleRetry}
                    disabled={retryCount >= 3}
                    className="flex-1"
                  >
                    {retryCount >= 3 ? 'Max Retries' : 'Try Again'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            Secured by DPO Group™ • All payments processed by DPO
          </div>
          
          <details className="text-[10px] text-muted-foreground">
            <summary className="cursor-pointer text-center">View Terms of Service</summary>
            <div className="mt-2">
              <DPOPayTerms />
            </div>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
