
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Smartphone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

const MpesaPaymentModal = ({ isOpen, onClose, order, onSuccess }: MpesaPaymentModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'phone' | 'pin' | 'processing'>('phone');
  const { toast } = useToast();

  const handleSendPaymentRequest = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid M-Pesa phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Simulate M-Pesa payment request
      // In production, this would call your M-Pesa API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful payment
      toast({
        title: "Payment successful!",
        description: "Your M-Pesa payment has been processed.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setStep('phone');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-md">
        <CardHeader className="relative text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
            <Smartphone className="w-6 h-6 text-green-600" />
            <span>M-Pesa Payment</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Amount to Pay</p>
            <p className="text-3xl font-bold text-green-600">KES {order.total_amount}</p>
            <p className="text-sm text-gray-600">Order #{order.order_number}</p>
          </div>

          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254700000000"
                  type="tel"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              <Button 
                onClick={handleSendPaymentRequest}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!phoneNumber}
              >
                Send Payment Request
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <div>
                <p className="font-semibold">Processing Payment...</p>
                <p className="text-sm text-gray-600">
                  A payment request has been sent to {phoneNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Please enter your M-Pesa PIN on your phone to complete the payment
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Secure Payment</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment is processed securely through Safaricom M-Pesa. 
              We do not store your payment information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaPaymentModal;
