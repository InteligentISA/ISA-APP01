import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Edit3, Truck, Package, Plus } from 'lucide-react';
import { DeliveryCostService, DeliveryLocation, DeliveryCostCalculation } from '@/services/deliveryCostService';
import { LocationConfirmation } from './LocationConfirmation';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  product?: {
    id: string;
    vendor_id?: string;
  };
}

interface CheckoutDeliveryCostsProps {
  cartItems: CartItem[];
  customerLocation?: DeliveryLocation;
  onLocationUpdate?: (location: DeliveryLocation) => void;
  className?: string;
}

export function CheckoutDeliveryCosts({
  cartItems,
  customerLocation,
  onLocationUpdate,
  className = ''
}: CheckoutDeliveryCostsProps) {
  const [deliveryCosts, setDeliveryCosts] = useState<DeliveryCostCalculation[]>([]);
  const [totalDeliveryCost, setTotalDeliveryCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLocationConfirmation, setShowLocationConfirmation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(customerLocation || null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentLocation && cartItems.length > 0) {
      calculateDeliveryCosts();
    }
  }, [cartItems, currentLocation]);

  const calculateDeliveryCosts = async () => {
    if (!currentLocation || cartItems.length === 0) return;

    try {
      setLoading(true);
      
      // Use the new vendor-grouped delivery cost calculation
      const { data: deliveryData, error } = await DeliveryCostService.getCartItemsDeliveryCost(
        cartItems.map(item => ({
          product: {
            id: item.product?.id || item.id,
            vendor_id: item.product?.vendor_id
          },
          quantity: item.quantity
        })),
        currentLocation
      );

      if (error || !deliveryData) {
        throw new Error('Failed to calculate delivery costs');
      }

      // Create individual delivery costs for display (showing 0 for additional products from same vendor)
      const individualCosts: DeliveryCostCalculation[] = [];
      for (const item of cartItems) {
        const productId = item.product?.id || item.id;
        const breakdown = deliveryData.breakdown.find(b => b.productId === productId);
        
        if (breakdown) {
          // Create a mock DeliveryCostCalculation for display
          individualCosts.push({
            baseCost: breakdown.cost > 0 ? 200 : 0, // Base cost only for first product of vendor
            countyCost: 0,
            constituencyCost: 0,
            wardCost: 0,
            totalCost: breakdown.cost,
            breakdown: {
              base: breakdown.cost > 0 ? 200 : 0,
              county: 0,
              constituency: 0,
              ward: 0
            }
          });
        }
      }

      setDeliveryCosts(individualCosts);
      setTotalDeliveryCost(deliveryData.totalCost);
    } catch (error) {
      console.error('Error calculating delivery costs:', error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery costs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (location: DeliveryLocation) => {
    setCurrentLocation(location);
    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  };

  const handleLocationConfirm = (location: DeliveryLocation) => {
    setCurrentLocation(location);
    setShowLocationConfirmation(false);
    if (onLocationUpdate) {
      onLocationUpdate(location);
    }
  };

  const formatLocationString = (location: DeliveryLocation) => {
    const parts = [location.county];
    if (location.constituency) parts.push(location.constituency);
    if (location.ward) parts.push(location.ward);
    return parts.join(', ');
  };

  const getItemDeliveryCost = (index: number) => {
    return deliveryCosts[index]?.totalCost || 0;
  };

  if (showLocationConfirmation) {
    return (
      <LocationConfirmation
        currentLocation={currentLocation || { county: '', constituency: '', ward: '' }}
        onLocationUpdate={handleLocationUpdate}
        onConfirm={handleLocationConfirm}
        isEditing={true}
        onEditToggle={() => setShowLocationConfirmation(false)}
        className={className}
      />
    );
  }

  if (!currentLocation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Delivery Location Set</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please complete your profile with location information to calculate delivery costs
            </p>
            <Button onClick={() => setShowLocationConfirmation(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Set Location
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocationConfirmation(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Change Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Delivering to {formatLocationString(currentLocation)}
            </p>
            {currentLocation.whatsapp_number && (
              <p className="text-xs text-gray-500">
                WhatsApp: {currentLocation.whatsapp_number}
              </p>
            )}
          </div>
        </div>

        {/* Delivery Costs */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-sm text-gray-600">Calculating delivery costs...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Individual Item Delivery Costs */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Delivery Costs by Item
              </h4>
              {cartItems.map((item, index) => {
                const deliveryCost = getItemDeliveryCost(index);
                const costBreakdown = deliveryCosts[index];
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-slate-600 rounded">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {costBreakdown && (
                          <p className="text-xs text-gray-500">
                            {DeliveryCostService.getDeliveryCostBreakdown(costBreakdown)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {DeliveryCostService.formatDeliveryCost({ totalCost: deliveryCost } as DeliveryCostCalculation)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity > 1 ? `${DeliveryCostService.formatDeliveryCost({ totalCost: deliveryCost / item.quantity } as DeliveryCostCalculation)} each` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Total Delivery Cost */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-t">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Total Delivery Cost</span>
              </div>
              <Badge variant="secondary" className="text-lg font-semibold">
                {DeliveryCostService.formatDeliveryCost({ totalCost: totalDeliveryCost } as DeliveryCostCalculation)}
              </Badge>
            </div>

            {/* Delivery Info */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Delivery Information:</p>
              <ul className="space-y-1">
                <li>• Delivery cost is charged once per vendor, regardless of number of products</li>
                <li>• Multiple products from the same vendor share a single delivery fee</li>
                <li>• Estimated delivery time: 2-5 business days</li>
                <li>• Delivery costs are calculated using county, constituency, and ward data</li>
                <li>• Contact will be made via WhatsApp for door delivery coordination</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
