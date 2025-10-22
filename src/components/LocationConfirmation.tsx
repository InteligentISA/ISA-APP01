import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit3, Check, X } from 'lucide-react';
import { DeliveryLocation } from '@/services/deliveryCostService';
import { useToast } from '@/hooks/use-toast';
import LocationSelect from './auth/LocationSelect';

interface LocationConfirmationProps {
  currentLocation: DeliveryLocation;
  onLocationUpdate: (location: DeliveryLocation) => void;
  onConfirm: (location: DeliveryLocation) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  className?: string;
}

export function LocationConfirmation({
  currentLocation,
  onLocationUpdate,
  onConfirm,
  isEditing = false,
  onEditToggle,
  className = ''
}: LocationConfirmationProps) {
  const [selectedCounty, setSelectedCounty] = useState(currentLocation.county || '');
  const [selectedConstituency, setSelectedConstituency] = useState(currentLocation.constituency || '');
  const [selectedWard, setSelectedWard] = useState(currentLocation.ward || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentLocation.whatsapp_number || '');
  const { toast } = useToast();

  const handleLocationChange = (county: string, constituency: string, ward?: string) => {
    setSelectedCounty(county);
    setSelectedConstituency(constituency);
    setSelectedWard(ward || '');
  };

  const handleSave = () => {
    if (!selectedCounty) {
      toast({
        title: "Validation Error",
        description: "Please select a county.",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappNumber) {
      toast({
        title: "Validation Error",
        description: "Please provide a WhatsApp number for delivery.",
        variant: "destructive",
      });
      return;
    }

    const newLocation: DeliveryLocation = {
      county: selectedCounty,
      constituency: selectedConstituency || undefined,
      ward: selectedWard || undefined,
      whatsapp_number: whatsappNumber
    };

    onLocationUpdate(newLocation);
    onConfirm(newLocation);
    
    toast({
      title: "Location Updated",
      description: "Your delivery location has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setSelectedCounty(currentLocation.county || '');
    setSelectedConstituency(currentLocation.constituency || '');
    setSelectedWard(currentLocation.ward || '');
    setWhatsappNumber(currentLocation.whatsapp_number || '');
    if (onEditToggle) onEditToggle();
  };

  const formatLocationString = (location: DeliveryLocation) => {
    const parts = [location.county];
    if (location.constituency) parts.push(location.constituency);
    if (location.ward) parts.push(location.ward);
    return parts.join(', ');
  };

  if (!isEditing) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Location
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
            {currentLocation.whatsapp_number && (
              <div>
                <Label className="text-sm font-medium text-gray-600">WhatsApp Number</Label>
                <p className="text-sm text-gray-900">{currentLocation.whatsapp_number}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                From Profile
              </Badge>
              <p className="text-xs text-gray-500">
                This location is from your profile. Click Edit to change it.
              </p>
            </div>
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
          Confirm Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Location Selection */}
          <LocationSelect 
            onLocationChange={handleLocationChange}
            required
            initialLocation={{
              county: selectedCounty,
              constituency: selectedConstituency,
              ward: selectedWard
            }}
          />

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+254 700 000 000"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              For door delivery coordination
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Confirm Location
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
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
      </CardContent>
    </Card>
  );
}
