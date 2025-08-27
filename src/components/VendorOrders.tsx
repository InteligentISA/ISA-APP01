import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/services/orderService";
import { OrderWithDetails } from "@/types/order";
import { format } from "date-fns";
import { Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorOrdersProps {
  vendorId: string;
}

const VendorOrders = ({ vendorId }: VendorOrdersProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      fetchOrders();
    }
  }, [vendorId]);

  const verifyVendorAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== vendorId) {
      toast({
        title: "Access Denied",
        description: "Unauthorized access to orders.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    if (!vendorId) {
      console.log('Vendor ID not available, skipping fetchOrders');
      setLoading(false);
      return;
    }
    
    // Verify vendor authorization first
    if (!(await verifyVendorAuth())) {
      setLoading(false);
      return;
    }

    try {
      const vendorOrders = await OrderService.getVendorOrders(vendorId);
      setOrders(vendorOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      await fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'shipped':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => ['delivered', 'shipped'].includes(order.status));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading orders...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Completed Orders</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{completedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
              No orders found for your products yet.
            </div>
          ) : (
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Order Number</TableHead>
                    <TableHead className="text-xs md:text-sm">Customer</TableHead>
                    <TableHead className="text-xs md:text-sm">Items</TableHead>
                    <TableHead className="text-xs md:text-sm">Total</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm">Date</TableHead>
                    <TableHead className="text-xs md:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{order.order_number}</TableCell>
                      <TableCell className="text-xs md:text-sm">{order.customer_email}</TableCell>
                      <TableCell className="text-xs md:text-sm">{order.order_items?.length || 0} items</TableCell>
                      <TableCell className="text-xs md:text-sm">{order.currency} {order.total_amount}</TableCell>
                      <TableCell className="text-xs md:text-sm">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {order.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="text-xs"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="text-xs"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="text-xs"
                          >
                            Mark Shipped
                          </Button>
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
    </div>
  );
};

export default VendorOrders; 