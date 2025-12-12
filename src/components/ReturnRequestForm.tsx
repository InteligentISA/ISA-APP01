import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { OrderWithDetails, CreateReturnRequestRequest } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReturnRequestFormProps {
  order: OrderWithDetails;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  { value: "wrong_item", label: "Wrong item received" },
  { value: "dont_like_size", label: "Don't like the size" },
  { value: "received_broken", label: "Received broken item" },
  { value: "product_missing", label: "Product is missing from package" },
  { value: "quality_not_as_described", label: "Product quality is not as described" },
  { value: "product_defective", label: "Product is defective" }
];

const RETURN_TYPES = [
  { 
    value: "replacement", 
    label: "Replacement", 
    description: "Get the same item replaced",
    icon: <RefreshCw className="w-5 h-5" />
  },
  { 
    value: "exchange", 
    label: "Exchange", 
    description: "Exchange for a different item",
    icon: <Package className="w-5 h-5" />
  },
  { 
    value: "refund", 
    label: "Refund", 
    description: "Get money back to your ISA wallet",
    icon: <DollarSign className="w-5 h-5" />
  }
];

export const ReturnRequestForm = ({ order, onSuccess }: ReturnRequestFormProps) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [message, setMessage] = useState("");
  const [returnType, setReturnType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedReason || !returnType) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and return type",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get the first item for return (in a real app, you might want to let users select which items)
      const firstItem = order.items[0];
      
      // Insert into order_returns table instead of return_requests
      const { error } = await supabase
        .from('order_returns')
        .insert({
          order_id: order.id,
          customer_id: order.user_id,
          reason: selectedReason,
          description: message.trim() || undefined,
          status: 'pending'
        });

      if (error) throw error;

      setStep(4); // Success step
      onSuccess();
    } catch (error) {
      console.error('Error creating return request:', error);
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getReasonLabel = (value: string) => {
    return RETURN_REASONS.find(r => r.value === value)?.label || value;
  };

  const getReturnTypeInfo = (value: string) => {
    return RETURN_TYPES.find(t => t.value === value);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>

      {/* Step 1: Select Reason */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Why are you returning this item?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                {RETURN_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!selectedReason}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Additional Message */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide any additional details about your return..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Return Type */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              What would you like in return?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RadioGroup value={returnType} onValueChange={setReturnType}>
                {RETURN_TYPES.map((type) => (
                  <div key={type.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {returnType === 'refund' && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Refunds will be credited to your ISA wallet, which you can use for future purchases.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!returnType || submitting}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {step === 4 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Return Request Submitted</h3>
            <p className="text-gray-600 text-center mb-6">
              Your return request has been submitted successfully. Expect a call from ISA soon.
            </p>
            <div className="text-sm text-gray-500 text-center">
              <p>Reason: {getReasonLabel(selectedReason)}</p>
              <p>Return Type: {getReturnTypeInfo(returnType)?.label}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};