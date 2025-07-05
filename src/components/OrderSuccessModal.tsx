
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, MapPin, Phone } from "lucide-react";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderSuccessModal = ({ isOpen, onClose, order }: OrderSuccessModalProps) => {
  const handleDownloadReceipt = () => {
    // Create a simple receipt content
    const receiptContent = `
ISA MARKETPLACE - ORDER RECEIPT
================================
Order Number: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleDateString()}
Customer: ${order.customer_email}
Phone: ${order.customer_phone}

ITEMS:
${order.items?.map((item: any) => 
  `${item.product_name} x ${item.quantity} - KES ${item.total_price}`
).join('\n') || 'Items loading...'}

PAYMENT DETAILS:
Subtotal: KES ${order.subtotal}
${order.tax_amount > 0 ? `Tax: KES ${order.tax_amount}` : ''}
${order.shipping_amount > 0 ? `Delivery: KES ${order.shipping_amount}` : ''}
Total: KES ${order.total_amount}

FULFILLMENT:
Method: ${order.fulfillment_method === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}
${order.fulfillment_method === 'pickup' && order.pickup_location ? 
  `Pickup Location: ${order.pickup_location}` : ''}
${order.fulfillment_method === 'pickup' && order.pickup_phone ? 
  `Pickup Contact: ${order.pickup_phone}` : ''}

Payment Method: ${order.payment_method === 'mpesa' ? 'M-Pesa' : 
  order.payment_method === 'pay_after_pickup' ? 'Pay after pickup' : 'Pay after delivery'}
Payment Status: ${order.payment_status}

Thank you for shopping with ISA Marketplace!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISA-Receipt-${order.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Order Placed Successfully!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Order Number</p>
            <p className="text-2xl font-bold text-gray-800">{order.order_number}</p>
            <p className="text-sm text-gray-600">Total: KES {order.total_amount}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fulfillment Method:</span>
                <span className="font-medium">
                  {order.fulfillment_method === 'pickup' ? 'Pickup from vendor' : 'ISA Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">
                  {order.payment_method === 'mpesa' ? 'M-Pesa' : 
                   order.payment_method === 'pay_after_pickup' ? 'Pay after pickup' : 'Pay after delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {order.fulfillment_method === 'pickup' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Pickup Information</span>
              </div>
              <div className="text-sm text-blue-700">
                <p><strong>Location:</strong> {order.pickup_location || 'Vendor will contact you'}</p>
                <p><strong>Contact:</strong> {order.pickup_phone || 'TBD'}</p>
                <p className="mt-2 text-xs">
                  The vendor will contact you within 24 hours to arrange pickup details.
                </p>
              </div>
            </div>
          )}

          {order.fulfillment_method === 'delivery' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Delivery Information</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Your order will be delivered to the address provided.</p>
                <p>Estimated delivery: 2-5 business days</p>
                <p className="mt-2 text-xs">
                  You will receive SMS updates about your delivery status.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex-1 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Receipt</span>
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Continue Shopping
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Thank you for shopping with ISA Marketplace!</p>
            <p>Check your email for order confirmation details.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccessModal;
