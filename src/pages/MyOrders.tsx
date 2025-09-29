import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Eye,
  CheckCircle, 
  Truck, 
  Package,
  Clock,
  AlertCircle,
  Loader2,
  Star,
  RotateCcw,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { OrderService } from "@/services/orderService";
import { OrderWithDetails, OrderStatus } from "@/types/order";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { OrderDetails } from "@/components/OrderDetails";
import { ReturnRequestForm } from "@/components/ReturnRequestForm";

const MyOrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    
    if (user?.id) {
      loadOrders();
    }
  }, [user, authLoading, navigate]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await OrderService.getUserOrders(user.id);
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      confirmed: { label: "Confirmed", variant: "default" as const },
      processing: { label: "Processing", variant: "default" as const },
      shipped: { label: "Shipped", variant: "default" as const },
      delivered: { label: "Delivered", variant: "default" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
      refunded: { label: "Refunded", variant: "outline" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canReturnOrder = (order: OrderWithDetails) => {
    if (order.status !== 'delivered') return false;
    if (!order.actual_delivery_date) return false;
    
    const deliveryDate = new Date(order.actual_delivery_date);
    const now = new Date();
    const hoursSinceDelivery = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceDelivery <= 24;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReturnRequest = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setShowReturnForm(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-600">Track and manage your orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 text-center">
                  {searchQuery || statusFilter !== "all" 
                    ? "No orders match your current filters." 
                    : "You haven't placed any orders yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium text-gray-900">Order #{order.order_number}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </span>
                          {order.actual_delivery_date && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-4 h-4" />
                              Delivered {formatDate(order.actual_delivery_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">{item.quantity}x</span>
                            <span className="text-gray-900">{item.product_name}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        
                        {canReturnOrder(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnRequest(order)}
                            className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Return
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onReturnRequest={() => {
                setShowOrderDetails(false);
                handleReturnRequest(selectedOrder);
              }}
              canReturn={canReturnOrder(selectedOrder)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Return Request Dialog */}
      <Dialog open={showReturnForm} onOpenChange={setShowReturnForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ReturnRequestForm 
              order={selectedOrder}
              onSuccess={() => {
                setShowReturnForm(false);
                loadOrders(); // Refresh orders
                toast({
                  title: "Return Request Submitted",
                  description: "Your return request has been submitted successfully. Expect a call from ISA soon.",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyOrdersPage;
