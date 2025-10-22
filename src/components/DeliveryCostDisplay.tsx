import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit3, Truck, Clock, Info } from 'lucide-react';
import { DeliveryCostService, DeliveryLocation, DeliveryCostCalculation } from '@/services/deliveryCostService';
import { LocationConfirmation } from './LocationConfirmation';
import { useToast } from '@/hooks/use-toast';

interface DeliveryCostDisplayProps {
  productId: string;
  customerLocation?: DeliveryLocation;
  onLocationUpdate?: (location: DeliveryLocation) => void;
  className?: string;
  showLocationSelector?: boolean;
}

export function DeliveryCostDisplay({
  productId,
  customerLocation,
  onLocationUpdate,
  className = '',
  showLocationSelector = true
}: DeliveryCostDisplayProps) {
  const [deliveryCost, setDeliveryCost] = useState<DeliveryCostCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLocationConfirmation, setShowLocationConfirmation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(customerLocation || null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentLocation) {
      calculateDeliveryCost();
    }
  }, [productId, currentLocation]);

  const calculateDeliveryCost = async () => {
    if (!currentLocation) return;

    try {
      setLoading(true);
      const { data, error } = await DeliveryCostService.getProductDeliveryCost(productId, currentLocation);
      
      if (error) {
        console.error('Error calculating delivery cost:', error);
        toast({
          title: "Error",
          description: "Failed to calculate delivery cost. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setDeliveryCost(data);
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery cost. Please try again.",
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Delivery cost not available</span>
            </div>
            {showLocationSelector && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationConfirmation(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Set Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Location and Edit Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Delivery to {formatLocationString(currentLocation)}
                </p>
                {currentLocation.whatsapp_number && (
                  <p className="text-xs text-gray-500">
                    WhatsApp: {currentLocation.whatsapp_number}
                  </p>
                )}
              </div>
            </div>
            {showLocationSelector && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationConfirmation(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Change
              </Button>
            )}
          </div>

          {/* Delivery Cost */}
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm text-gray-600">Calculating delivery cost...</span>
            </div>
          ) : deliveryCost ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Delivery Cost</span>
                </div>
                <Badge variant="secondary" className="text-lg font-semibold">
                  Ksh {deliveryCost.totalCost.toLocaleString()}
                </Badge>
              </div>

              {/* Cost Breakdown */}
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Base cost:</span>
                  <span>Ksh {deliveryCost.breakdown.base.toLocaleString()}</span>
                </div>
                {deliveryCost.breakdown.county > 0 && (
                  <div className="flex justify-between">
                    <span>County cost:</span>
                    <span>Ksh {deliveryCost.breakdown.county.toLocaleString()}</span>
                  </div>
                )}
                {deliveryCost.breakdown.constituency > 0 && (
                  <div className="flex justify-between">
                    <span>Constituency cost:</span>
                    <span>Ksh {deliveryCost.breakdown.constituency.toLocaleString()}</span>
                  </div>
                )}
                {deliveryCost.breakdown.ward > 0 && (
                  <div className="flex justify-between">
                    <span>Ward cost:</span>
                    <span>Ksh {deliveryCost.breakdown.ward.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Estimated delivery: 2-5 business days</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Info className="h-4 w-4" />
              <span>Unable to calculate delivery cost for this location</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
