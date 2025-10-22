import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { locationData, getCounties, getConstituenciesByCounty, getWardsByConstituency, hasWards } from '@/lib/locationData';

interface LocationSelectorProps {
  selectedCounty: string;
  selectedConstituency: string;
  selectedWard: string;
  onCountyChange: (county: string) => void;
  onConstituencyChange: (constituency: string) => void;
  onWardChange: (ward: string) => void;
  className?: string;
  showWard?: boolean; // Optional prop to force show/hide ward selection
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedCounty,
  selectedConstituency,
  selectedWard,
  onCountyChange,
  onConstituencyChange,
  onWardChange,
  className = "",
  showWard
}) => {
  const [availableConstituencies, setAvailableConstituencies] = useState<string[]>([]);
  const [availableWards, setAvailableWards] = useState<string[]>([]);
  const [shouldShowWard, setShouldShowWard] = useState<boolean>(false);

  const counties = getCounties();

  // Update constituencies when county changes
  useEffect(() => {
    if (selectedCounty) {
      const constituencies = getConstituenciesByCounty(selectedCounty);
      setAvailableConstituencies(constituencies);
      
      // Reset constituency and ward when county changes
      if (selectedConstituency && !constituencies.includes(selectedConstituency)) {
        onConstituencyChange("");
        onWardChange("");
      }
      
      // Check if this county has wards
      const countyHasWards = hasWards(selectedCounty);
      setShouldShowWard(countyHasWards && (showWard !== false));
    } else {
      setAvailableConstituencies([]);
      setShouldShowWard(false);
    }
  }, [selectedCounty, selectedConstituency, onConstituencyChange, onWardChange, showWard]);

  // Update wards when constituency changes
  useEffect(() => {
    if (selectedCounty && selectedConstituency && shouldShowWard) {
      const wards = getWardsByConstituency(selectedCounty, selectedConstituency);
      setAvailableWards(wards);
      
      // Reset ward if current selection is not available
      if (selectedWard && !wards.includes(selectedWard)) {
        onWardChange("");
      }
    } else {
      setAvailableWards([]);
      if (!shouldShowWard && selectedWard) {
        onWardChange("");
      }
    }
  }, [selectedCounty, selectedConstituency, selectedWard, shouldShowWard, onWardChange]);

  const handleCountyChange = (county: string) => {
    onCountyChange(county);
    onConstituencyChange("");
    onWardChange("");
  };

  const handleConstituencyChange = (constituency: string) => {
    onConstituencyChange(constituency);
    onWardChange("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* County Selection */}
      <div className="space-y-2">
        <Label htmlFor="county" className="text-sm font-medium">
          County *
        </Label>
        <Select value={selectedCounty} onValueChange={handleCountyChange}>
          <SelectTrigger id="county" className="w-full">
            <SelectValue placeholder="Select your county" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((county) => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Constituency Selection */}
      {selectedCounty && (
        <div className="space-y-2">
          <Label htmlFor="constituency" className="text-sm font-medium">
            Constituency *
          </Label>
          <Select 
            value={selectedConstituency} 
            onValueChange={handleConstituencyChange}
            disabled={!selectedCounty}
          >
            <SelectTrigger id="constituency" className="w-full">
              <SelectValue placeholder="Select your constituency" />
            </SelectTrigger>
            <SelectContent>
              {availableConstituencies.map((constituency) => (
                <SelectItem key={constituency} value={constituency}>
                  {constituency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ward Selection - Only show for counties with wards */}
      {shouldShowWard && selectedConstituency && (
        <div className="space-y-2">
          <Label htmlFor="ward" className="text-sm font-medium">
            Ward *
          </Label>
          <Select 
            value={selectedWard} 
            onValueChange={onWardChange}
            disabled={!selectedConstituency}
          >
            <SelectTrigger id="ward" className="w-full">
              <SelectValue placeholder="Select your ward" />
            </SelectTrigger>
            <SelectContent>
              {availableWards.map((ward) => (
                <SelectItem key={ward} value={ward}>
                  {ward}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
