import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/services/orderService';
import { OrderWithDetails, OrderStatus, ShippingStatus } from '@/types/order';

interface VendorOrderManagementProps {
  vendorId: string;
}

const VendorOrderManagement: React.FC<VendorOrderManagementProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [vendorId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const vendorOrders = await OrderService.getVendorOrders(vendorId);
      setOrders(vendorOrders);
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

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, {
        order_id: orderId,
        status: newStatus,
        notes
      });

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}.`,
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

  const handleUpdateShipping = async (orderId: string, trackingNumber: string, carrier: string) => {
    try {
      await OrderService.updateShippingInfo(orderId, trackingNumber, carrier);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              shipping: order.shipping ? {
                ...order.shipping,
                tracking_number: trackingNumber,
                carrier,
                status: 'shipped'
              } : undefined
            }
          : order
      ));

      toast({
        title: "Shipping Updated",
        description: "Shipping information has been updated.",
      });
    } catch (error) {
      console.error('Error updating shipping:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping information.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage orders for your products</p>
        </div>
        <Button onClick={loadOrders} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by order number, customer email, or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Order #{OrderService.formatOrderNumber(order.order_number)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Customer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{order.customer_phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Shipping Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.shipping_address.street}<br />
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                      >
                        Start Processing
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                      >
                        Mark Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Details - #{OrderService.formatOrderNumber(selectedOrder.order_number)}</span>
                <Button variant="ghost" size="sm" onClick={() => setShowOrderDetails(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Status History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status History</h3>
                <div className="space-y-2">
                  {selectedOrder.status_history.map((history, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(history.status)}
                        <Badge className={getStatusColor(history.status)}>
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(history.created_at)}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              {selectedOrder.payment && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Method</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {selectedOrder.payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                      <Badge className={selectedOrder.payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedOrder.payment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Amount</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatPrice(selectedOrder.payment.amount)}
                      </p>
                    </div>
                    {selectedOrder.payment.transaction_id && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Transaction ID</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedOrder.payment.transaction_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              {selectedOrder.shipping && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Carrier</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {selectedOrder.shipping.carrier}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Method</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {selectedOrder.shipping.shipping_method}
                      </p>
                    </div>
                    {selectedOrder.shipping.tracking_number && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Tracking Number</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedOrder.shipping.tracking_number}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                      <Badge className={getStatusColor(selectedOrder.shipping.status as OrderStatus)}>
                        {selectedOrder.shipping.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorOrderManagement; 