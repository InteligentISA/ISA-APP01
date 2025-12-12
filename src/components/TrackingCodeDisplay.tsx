import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Copy, 
  Check, 
  Truck,
  MapPin,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackingCodeDisplayProps {
  orderId: string;
}

interface TrackingData {
  trackingCode?: string;
  fikishaOrderId?: string;
  status?: string;
  deliveryAddress?: string;
  vendorWhatsapp?: string;
  customerWhatsapp?: string;
}

interface TrackingUpdate {
  type?: string;
  fikisha_tracking_code?: string;
  fikisha_order_id?: string;
  product?: any;
}

export const TrackingCodeDisplay: React.FC<TrackingCodeDisplayProps> = ({ orderId }) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      // First, try to get tracking data from delivery_orders table
      const { data: deliveryOrder, error: deliveryError } = await supabase
        .from('delivery_orders')
        .select(`
          *,
          order:orders(
            order_number,
            customer_email,
            customer_phone,
            user:profiles(
              first_name,
              last_name,
              phone_number,
              whatsapp_number,
              county,
              constituency,
              ward
            )
          )
        `)
        .eq('order_id', orderId)
        .single();

      if (deliveryError || !deliveryOrder) {
        console.log('No delivery order found for this order');
        setTrackingData(null);
        return;
      }

      // Extract tracking code from tracking_updates if available
      let trackingCode = '';
      let fikishaOrderId = '';
      
      if (deliveryOrder.tracking_updates && Array.isArray(deliveryOrder.tracking_updates)) {
        const fikishaUpdate = (deliveryOrder.tracking_updates as TrackingUpdate[]).find(
          (update) => update.type === 'sent_to_fikisha'
        );
        if (fikishaUpdate) {
          trackingCode = fikishaUpdate.fikisha_tracking_code || '';
          fikishaOrderId = fikishaUpdate.fikisha_order_id || '';
        }
      }

      // Get order items with vendor info
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            vendor_id
          )
        `)
        .eq('order_id', orderId)
        .limit(1);

      let vendorWhatsapp = '';
      if (orderItems && orderItems.length > 0 && orderItems[0].products) {
        const vendorId = (orderItems[0].products as any).vendor_id;
        if (vendorId) {
          const { data: vendorProfile } = await supabase
            .from('profiles')
            .select('whatsapp_number')
            .eq('id', vendorId)
            .single();
          vendorWhatsapp = vendorProfile?.whatsapp_number || '';
        }
      }

      const customerProfile = (deliveryOrder.order as any)?.user;

      setTrackingData({
        trackingCode,
        fikishaOrderId,
        status: deliveryOrder.status,
        deliveryAddress: deliveryOrder.delivery_location_address,
        vendorWhatsapp,
        customerWhatsapp: customerProfile?.whatsapp_number || customerProfile?.phone_number
      });

    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Tracking code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy tracking code",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = (phoneNumber: string, message?: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const defaultMessage = message || 'Hello, I have a question about my order delivery.';
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading tracking info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData || !trackingData.trackingCode) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No tracking information available yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Tracking code will appear once delivery is arranged
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          Delivery Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tracking Code */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Your Tracking Code</span>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {trackingData.status || 'Active'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono text-center">
              {trackingData.trackingCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(trackingData.trackingCode!)}
              className="flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            📱 Show this code to the delivery person when they arrive
          </p>
        </div>

        {/* Delivery Information */}
        {trackingData.deliveryAddress && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Delivery Address</p>
                <p className="text-sm text-gray-600">{trackingData.deliveryAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <p className="text-sm font-medium text-gray-900">Need Help?</p>
          <div className="flex flex-wrap gap-2">
            {trackingData.vendorWhatsapp && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => openWhatsApp(trackingData.vendorWhatsapp!, 'Hi, I have a question about my order pickup.')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Vendor
              </Button>
            )}
            {trackingData.customerWhatsapp && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => openWhatsApp(trackingData.customerWhatsapp!, 'Hi, I have a question about my order delivery.')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-yellow-900 mb-1">📋 Delivery Instructions</p>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Keep this tracking code ready when delivery arrives</li>
            <li>• The delivery person will ask for this code</li>
            <li>• Only give the code after receiving your order</li>
            <li>• Contact vendor or support if you have questions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};