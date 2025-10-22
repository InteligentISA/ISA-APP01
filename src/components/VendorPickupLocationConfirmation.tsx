import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit3, Check, X, AlertCircle } from 'lucide-react';
import { DeliveryCostService, DeliveryLocation } from '@/services/deliveryCostService';
import { useToast } from '@/hooks/use-toast';

interface VendorPickupLocationConfirmationProps {
  currentLocation?: DeliveryLocation;
  onLocationUpdate: (location: DeliveryLocation) => void;
  onConfirm: (location: DeliveryLocation) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  className?: string;
  required?: boolean;
}

export function VendorPickupLocationConfirmation({
  currentLocation,
  onLocationUpdate,
  onConfirm,
  isEditing = false,
  onEditToggle,
  className = '',
  required = true
}: VendorPickupLocationConfirmationProps) {
  const [counties, setCounties] = useState<Array<{ id: string; name: string; is_hotspot: boolean }>>([]);
  const [constituencies, setConstituencies] = useState<Array<{ id: string; name: string }>>([]);
  const [wards, setWards] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState(currentLocation?.county || '');
  const [selectedConstituency, setSelectedConstituency] = useState(currentLocation?.constituency || '');
  const [selectedWard, setSelectedWard] = useState(currentLocation?.ward || '');
  const [isHotspot, setIsHotspot] = useState(false);
  const { toast } = useToast();

  // Load counties on component mount
  useEffect(() => {
    loadCounties();
  }, []);

  // Load constituencies when county changes
  useEffect(() => {
    if (selectedCounty) {
      loadConstituencies(selectedCounty);
    } else {
      setConstituencies([]);
      setWards([]);
      setSelectedConstituency('');
      setSelectedWard('');
    }
  }, [selectedCounty]);

  // Load wards when constituency changes
  useEffect(() => {
    if (selectedConstituency && isHotspot) {
      loadWards(selectedConstituency);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedConstituency, isHotspot]);

  const loadCounties = async () => {
    try {
      const { data, error } = await DeliveryCostService.getCounties();
      if (error) throw error;
      setCounties(data);
    } catch (error) {
      console.error('Error loading counties:', error);
      toast({
        title: "Error",
        description: "Failed to load counties. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadConstituencies = async (countyName: string) => {
    try {
      setLoading(true);
      const { data: countyData } = await DeliveryCostService.getCountyByName(countyName);
      if (!countyData) return;

      setIsHotspot(countyData.is_hotspot);
      
      const { data, error } = await DeliveryCostService.getConstituenciesByCounty(countyData.id);
      if (error) throw error;
      setConstituencies(data);
    } catch (error) {
      console.error('Error loading constituencies:', error);
      toast({
        title: "Error",
        description: "Failed to load constituencies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (constituencyName: string) => {
    try {
      setLoading(true);
      const { data: countyData } = await DeliveryCostService.getCountyByName(selectedCounty);
      if (!countyData) return;

      const { data: constituencyData } = await DeliveryCostService.getConstituencyByName(constituencyName, countyData.id);
      if (!constituencyData) return;

      const { data, error } = await DeliveryCostService.getWardsByConstituency(constituencyData.id);
      if (error) throw error;
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
      toast({
        title: "Error",
        description: "Failed to load wards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCounty) {
      toast({
        title: "Validation Error",
        description: "Please select a county for pickup location.",
        variant: "destructive",
      });
      return;
    }

    const newLocation: DeliveryLocation = {
      county: selectedCounty,
      constituency: selectedConstituency || undefined,
      ward: selectedWard || undefined
    };

    // Validate the location
    const validation = await DeliveryCostService.validateDeliveryLocation(newLocation);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    onLocationUpdate(newLocation);
    onConfirm(newLocation);
    
    toast({
      title: "Pickup Location Updated",
      description: "Your pickup location has been confirmed successfully.",
    });
  };

  const handleCancel = () => {
    setSelectedCounty(currentLocation?.county || '');
    setSelectedConstituency(currentLocation?.constituency || '');
    setSelectedWard(currentLocation?.ward || '');
    if (onEditToggle) onEditToggle();
  };

  const formatLocationString = (location: DeliveryLocation) => {
    const parts = [location.county];
    if (location.constituency) parts.push(location.constituency);
    if (location.ward) parts.push(location.ward);
    return parts.join(', ');
  };

  if (!isEditing && currentLocation) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pickup Location
            </CardTitle>
            {onEditToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditToggle}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Location</Label>
              <p className="text-sm text-gray-900">
                {formatLocationString(currentLocation)}
              </p>
            </div>
            <Badge variant="secondary" className="w-fit">
              <Check className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Confirm Pickup Location
        </CardTitle>
        {required && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            Required for delivery cost calculation
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* County Selection */}
          <div className="space-y-2">
            <Label htmlFor="county">County *</Label>
            <Select
              value={selectedCounty}
              onValueChange={(value) => {
                setSelectedCounty(value);
                setSelectedConstituency('');
                setSelectedWard('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pickup county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county.id} value={county.name}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Constituency Selection */}
          <div className="space-y-2">
            <Label htmlFor="constituency">Constituency</Label>
            <Select
              value={selectedConstituency}
              onValueChange={(value) => {
                setSelectedConstituency(value);
                setSelectedWard('');
              }}
              disabled={!selectedCounty || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select constituency" />
              </SelectTrigger>
              <SelectContent>
                {constituencies.map((constituency) => (
                  <SelectItem key={constituency.id} value={constituency.name}>
                    {constituency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ward Selection (only for hotspot counties) */}
          {isHotspot && (
            <div className="space-y-2">
              <Label htmlFor="ward">Ward</Label>
              <Select
                value={selectedWard}
                onValueChange={setSelectedWard}
                disabled={!selectedConstituency || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.name}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Confirm Pickup Location
          </Button>
          {onEditToggle && (
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {/* Location Preview */}
        {selectedCounty && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-600">Preview</Label>
            <p className="text-sm text-gray-900">
              {formatLocationString({
                county: selectedCounty,
                constituency: selectedConstituency,
                ward: selectedWard
              })}
            </p>
          </div>
        )}

        {/* Info about delivery cost calculation */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Delivery Cost Calculation</p>
              <p className="text-xs mt-1">
                This location will be used to calculate delivery costs for your products. 
                More specific locations (county → constituency → ward) provide more accurate pricing.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
