import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShippingRecord {
  id: string;
  order_id: string;
  tracking_number?: string;
  status: string;
  shipping_address: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  order?: {
    id: string;
    total_amount: number;
    items?: Array<{
      product_name: string;
      quantity: number;
      price: number;
    }>;
  };
}

interface MyShippingProps {
  user: any;
}

const MyShipping = ({ user }: MyShippingProps) => {
  const [shippingRecords, setShippingRecords] = useState<ShippingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadShippingRecords();
    }
  }, [user]);

  const loadShippingRecords = async () => {
    try {
      // Load shipping records with order details
      const { data, error } = await supabase
        .from('shipping')
        .select(`
          *,
          order:orders!shipping_order_id_fkey (
            id,
            total_amount,
            items:order_items (
              product_name,
              quantity,
              price
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading shipping records:', error);
        return;
      }

      setShippingRecords(data || []);
    } catch (error) {
      console.error('Error loading shipping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_transit':
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (shippingRecords.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shipping Records</h3>
          <p className="text-gray-600">You haven't made any orders yet. Start shopping to see your shipping history!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Truck className="w-6 h-6" />
            <span>My Shipping Records</span>
          </CardTitle>
          <p className="text-sm text-blue-600">Track your orders and delivery history</p>
        </CardHeader>
      </Card>

      {/* Shipping Records */}
      <div className="space-y-4">
        {shippingRecords.map((record) => (
          <Card key={record.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Order #{record.order_id.slice(-8)}
                      </h3>
                      {record.tracking_number && (
                        <p className="text-sm text-gray-600">
                          Tracking: {record.tracking_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(record.status)} border`}>
                    {formatStatus(record.status)}
                  </Badge>
                </div>

                {/* Order Details */}
                {record.order && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <span className="font-medium text-gray-800">Order Value</span>
                      <span className="text-lg font-bold text-green-600">
                        KES {record.order.total_amount.toLocaleString()}
                      </span>
                    </div>
                    
                    {record.order.items && record.order.items.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Items:</span>
                        <div className="space-y-1">
                          {record.order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600">
                              <span>{item.product_name} (x{item.quantity})</span>
                              <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          {record.order.items.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{record.order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Delivery Address</p>
                        <p className="text-sm text-gray-600">{record.shipping_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Order Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {record.estimated_delivery && (
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {record.status === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.actual_delivery || record.estimated_delivery).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyShipping;
