import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OrderService } from "@/services/orderService";
import { OrderWithDetails } from "@/types/order";
import { format } from "date-fns";
import { ArrowLeft, Package, MapPin, FileText, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrderMessaging from "./OrderMessaging";

interface VendorOrderDetailProps {
  orderId: string;
  vendorId: string;
  onBack: () => void;
}

const VendorOrderDetail = ({ orderId, vendorId, onBack }: VendorOrderDetailProps) => {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMessaging, setShowMessaging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId && vendorId) {
      fetchOrderDetails();
    }
  }, [orderId, vendorId]);

  const fetchOrderDetails = async () => {
    try {
      const orderDetails = await OrderService.getOrderById(orderId);
      setOrder(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      await OrderService.updateOrderStatus(orderId, {
        order_id: orderId,
        status: 'processing'
      });
      
      // Send notification to customer
      // TODO: Implement notification service
      
      toast({
        title: "Order Accepted",
        description: "Order is now ready for pickup. Customer has been notified.",
      });
      
      fetchOrderDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive"
      });
    }
  };

  const handleDeclineOrder = async () => {
    try {
      await OrderService.updateOrderStatus(orderId, {
        order_id: orderId,
        status: 'cancelled'
      });
      
      toast({
        title: "Order Declined",
        description: "Order has been cancelled.",
        variant: "destructive"
      });
      
      fetchOrderDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline order",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-600">
              Placed on {order.created_at ? format(new Date(order.created_at), 'MMMM dd, yyyy') : 'N/A'}
            </p>
          </div>
        </div>
        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
          {order.status}
        </Badge>
      </div>

      {/* Action Buttons */}
      {order.status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button onClick={handleAcceptOrder} className="flex-1">
                <Package className="h-4 w-4 mr-2" />
                Accept Order - Ready for Pickup
              </Button>
              <Button onClick={handleDeclineOrder} variant="destructive" className="flex-1">
                Decline Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  {item.product_image && (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold">{order.currency} {item.total_price}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{order.currency} {order.total_amount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Customer</span>
            </div>
            {order.shipping_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Delivery Address:</p>
                  <p className="text-sm text-gray-600">
                    {typeof order.shipping_address === 'string' 
                      ? order.shipping_address 
                      : `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.country}`}
                  </p>
                </div>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Order Notes:</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.notes && (
              <div className="mb-4">
                <p className="font-medium text-sm mb-2">Order Notes:</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {order.notes}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Order Status:</p>
                <p className="capitalize">{order.status}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Fulfillment Method:</p>
                <p className="capitalize">delivery</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Order Date:</p>
                <p>{order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Estimated Delivery:</p>
                <p>{order.estimated_delivery_date ? format(new Date(order.estimated_delivery_date), 'MMM dd, yyyy') : 'TBD'}</p>
              </div>
            </div>
            {!order.notes && (
              <p className="text-sm text-gray-500 mt-4">No additional notes for this order.</p>
            )}
          </CardContent>
        </Card>

        {/* Messaging */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Customer Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowMessaging(!showMessaging)}
              variant="outline"
              className="w-full"
            >
              {showMessaging ? "Hide Messages" : "View/Send Messages"}
            </Button>
            {showMessaging && (
              <div className="mt-4">
                <OrderMessaging 
                  orderId={orderId} 
                  userType="vendor"
                  userId={vendorId}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOrderDetail;
