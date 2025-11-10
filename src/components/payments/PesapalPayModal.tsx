import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { initiatePesapalPayment, getPesapalPaymentStatus } from "@/services/pesapalService";
import { Loader2 } from "lucide-react";

interface PesapalPayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  onSuccess?: (tx: { transaction_id: string; provider: string }) => void;
  onFailure?: () => void;
}

export default function PesapalPayModal({
  open,
  onOpenChange,
  userId,
  amount,
  currency = 'KES',
  orderId,
  description,
  onSuccess,
  onFailure
}: PesapalPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const { toast } = useToast();

  async function initializePayment() {
    try {
      setLoading(true);
      setStatus('pending');
      setStatusMessage('Initializing payment...');

      const resp = await initiatePesapalPayment({
        user_id: userId,
        amount,
        currency,
        order_id: orderId,
        description
      });

      setTransactionId(resp.transaction_id);

      if (resp.iframe_url) {
        setIframeUrl(resp.iframe_url);
        setStatusMessage('Complete payment in the window below');
        startPolling(resp.transaction_id);
      } else if (resp.status === 'success') {
        handleSuccess(resp.transaction_id);
      } else if (resp.status === 'failed') {
        handleFailure();
      }
    } catch (e: any) {
      console.error('PesaPal initialization error:', e);
      toast({
        title: 'Payment Initialization Failed',
        description: e?.message ?? 'Unable to start payment process',
        variant: 'destructive'
      });
      handleFailure();
    } finally {
      setLoading(false);
    }
  }

  function startPolling(id: string) {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    
    pollStartRef.current = Date.now();
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await getPesapalPaymentStatus(id);
        
        if (res.status === 'success') {
          handleSuccess(id);
        } else if (res.status === 'failed') {
          handleFailure();
        } else {
          setStatusMessage('Waiting for payment confirmation...');
        }
      } catch (err) {
        console.error('Status check error:', err);
      }

      // Timeout after 3 minutes
      if (pollStartRef.current && Date.now() - pollStartRef.current > 180000) {
        stopPolling();
        setStatusMessage('Payment verification taking longer than expected. We\'ll notify you once confirmed.');
      }
    }, 3000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function handleSuccess(txId: string) {
    setStatus('success');
    setStatusMessage('Payment successful!');
    stopPolling();
    
    if (onSuccess) {
      onSuccess({ transaction_id: txId, provider: 'PesaPal' });
    }
    
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  }

  function handleFailure() {
    setStatus('failed');
    setStatusMessage('Payment failed. Please try again.');
    stopPolling();
    
    if (onFailure) {
      onFailure();
    }
  }

  useEffect(() => {
    if (open && status === 'idle') {
      initializePayment();
    }
    
    if (!open) {
      stopPolling();
      setTransactionId(null);
      setStatus('idle');
      setStatusMessage('');
      setIframeUrl(null);
    }

    return () => {
      stopPolling();
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug Pay" className="h-6" />
            <span>Secure Payment - Powered by PesaPal</span>
          </DialogTitle>
          <DialogDescription>
            Complete your payment securely. All transactions are encrypted and protected.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          )}

          {iframeUrl && !loading && (
            <div className="flex-1 flex flex-col">
              <iframe
                src={iframeUrl}
                className="w-full flex-1 border rounded-md"
                title="PesaPal Payment"
                allow="payment"
              />
            </div>
          )}

          {status !== 'idle' && !iframeUrl && !loading && (
            <div className="rounded-md border p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                {status === 'pending' && (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
                    <div className="font-medium">Processing Payment</div>
                  </>
                )}
                {status === 'success' && (
                  <>
                    <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="font-medium text-green-600">Payment Successful!</div>
                  </>
                )}
                {status === 'failed' && (
                  <>
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="font-medium text-red-600">Payment Failed</div>
                  </>
                )}
                <div className="text-muted-foreground">{statusMessage}</div>
                {transactionId && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Transaction ID: {transactionId}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            <p>🔒 Secured by MyPlug Technologies Limited</p>
            <p className="mt-1">Payments processed by PesaPal - Your payment information is encrypted and secure</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
