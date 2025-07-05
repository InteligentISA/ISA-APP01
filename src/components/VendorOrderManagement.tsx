
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { OrderService } from '@/services/orderService';
import { OrderWithDetails, OrderStatus } from '@/types/order';

interface VendorOrderManagementProps {
  user: any;
}

const VendorOrderManagement = ({ user }: VendorOrderManagementProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // For now, just get all orders - we'll implement vendor filtering later
      const ordersList = await OrderService.getOrders(user.id);
      const ordersWithDetails = await Promise.all(
        ordersList.map(order => OrderService.getOrderById(order.id))
      );
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      await loadOrders(); // Reload orders
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button onClick={loadOrders} variant="outline">
          Refresh Orders
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_number}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">KES {order.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fulfillment Method</p>
                    <p className="font-medium capitalize">{order.fulfillment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium capitalize">{order.payment_status}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span>KES {item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                      size="sm"
                    >
                      Confirm Order
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                      size="sm"
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'processing' && order.fulfillment_method === 'delivery' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                      size="sm"
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {((order.status === 'shipped' && order.fulfillment_method === 'delivery') || 
                    (order.status === 'processing' && order.fulfillment_method === 'pickup')) && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                      size="sm"
                      variant="destructive"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrderManagement;
