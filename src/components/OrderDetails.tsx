import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Truck, 
  Package,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Star,
  RotateCcw,
  Calendar
} from "lucide-react";
import { OrderWithDetails } from "@/types/order";
import { useCurrency } from "@/hooks/useCurrency";
import { RatingDialog } from "./RatingDialog";

interface OrderDetailsProps {
  order: OrderWithDetails;
  onReturnRequest: () => void;
  canReturn: boolean;
}

export const OrderDetails = ({ order, onReturnRequest, canReturn }: OrderDetailsProps) => {
  const { formatPrice } = useCurrency();
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingType, setRatingType] = useState<'product' | 'delivery'>('product');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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

  const handleRating = (type: 'product' | 'delivery') => {
    setRatingType(type);
    setShowRatingDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order #{order.order_number}</h2>
            <p className="text-sm text-gray-600">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatPrice(order.total_amount)}
            </div>
            <div className="text-sm text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                {item.product_image && (
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                  {item.product_sku && (
                    <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                  
                  {/* Return Policy Info */}
                  {item.product_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      {/* This would need to be populated from the product data */}
                      <p>Return policy: Check product details for return eligibility</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              {order.shipping_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(order.shipping_amount)}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              {order.status === 'delivered' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleRating('product')}
                  >
                    <Star className="w-4 h-4" />
                    Rate Product
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleRating('delivery')}
                  >
                    <Truck className="w-4 h-4" />
                    Rate Delivery
                  </Button>
                </>
              )}
              
              {canReturn && (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={onReturnRequest}
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Return
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.shipping_address.street}</p>
                {order.shipping_address.apartment && (
                  <p>Apt: {order.shipping_address.apartment}</p>
                )}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {order.customer_email}
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.customer_phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.estimated_delivery_date && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Estimated Delivery</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {formatDate(order.estimated_delivery_date)}
              </p>
            </div>
          )}

          {order.actual_delivery_date && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Delivered</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {formatDate(order.actual_delivery_date)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        order={order}
        type={ratingType}
        onSuccess={() => {
          setShowRatingDialog(false);
          // Optionally refresh order data
        }}
      />
    </div>
  );
};
