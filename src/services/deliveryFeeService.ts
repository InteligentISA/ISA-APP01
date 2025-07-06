// Delivery Fee Calculation Service
// This service calculates delivery fees based on various factors

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  county: string;
}

export interface DeliveryFeeRequest {
  pickupLocation: DeliveryLocation;
  deliveryLocation: DeliveryLocation;
  items: Array<{
    weight: number; // in kg
    quantity: number;
    isFragile: boolean;
  }>;
  deliveryType: 'standard' | 'express' | 'same_day';
}

export interface DeliveryFeeResponse {
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  fragileFee: number;
  expressFee: number;
  totalFee: number;
  estimatedDeliveryTime: string; // e.g., "2-3 business days"
  distance: number; // in km
}

export class DeliveryFeeService {
  // Base delivery fees (in KES)
  private static readonly BASE_FEES = {
    standard: 500,
    express: 800,
    same_day: 1200
  };

  // Distance fee per km (in KES)
  private static readonly DISTANCE_FEE_PER_KM = 50;

  // Weight fee per kg (in KES)
  private static readonly WEIGHT_FEE_PER_KG = 30;

  // Fragile item fee (in KES)
  private static readonly FRAGILE_FEE = 200;

  // Express delivery multiplier
  private static readonly EXPRESS_MULTIPLIER = 1.5;

  // Same day delivery multiplier
  private static readonly SAME_DAY_MULTIPLIER = 2.0;

  // Calculate distance between two points using Haversine formula
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Get coordinates from address (simplified - in real app, use geocoding service)
  private static async getCoordinatesFromAddress(address: string, city: string): Promise<{lat: number, lng: number}> {
    // This is a simplified implementation
    // In a real application, you would use a geocoding service like Google Maps API
    
    // For now, return default coordinates for Nairobi
    const defaultCoordinates = {
      'Nairobi': { lat: -1.2921, lng: 36.8219 },
      'Mombasa': { lat: -4.0435, lng: 39.6682 },
      'Kisumu': { lat: -0.1022, lng: 34.7617 },
      'Nakuru': { lat: -0.3031, lng: 36.0800 },
      'Eldoret': { lat: 0.5204, lng: 35.2699 }
    };

    // Try to match city name
    for (const [cityName, coords] of Object.entries(defaultCoordinates)) {
      if (city.toLowerCase().includes(cityName.toLowerCase()) || 
          address.toLowerCase().includes(cityName.toLowerCase())) {
        return coords;
      }
    }

    // Default to Nairobi if no match found
    return defaultCoordinates['Nairobi'];
  }

  // Calculate total weight of items
  private static calculateTotalWeight(items: Array<{weight: number, quantity: number}>): number {
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  }

  // Calculate delivery fee
  static async calculateDeliveryFee(request: DeliveryFeeRequest): Promise<DeliveryFeeResponse> {
    try {
      // Get coordinates for pickup and delivery locations
      const pickupCoords = await this.getCoordinatesFromAddress(
        request.pickupLocation.address, 
        request.pickupLocation.city
      );
      const deliveryCoords = await this.getCoordinatesFromAddress(
        request.deliveryLocation.address, 
        request.deliveryLocation.city
      );

      // Calculate distance
      const distance = this.calculateDistance(
        pickupCoords.lat, pickupCoords.lng,
        deliveryCoords.lat, deliveryCoords.lng
      );

      // Calculate total weight
      const totalWeight = this.calculateTotalWeight(request.items);

      // Calculate base fee
      const baseFee = this.BASE_FEES[request.deliveryType];

      // Calculate distance fee
      const distanceFee = distance * this.DISTANCE_FEE_PER_KM;

      // Calculate weight fee
      const weightFee = totalWeight * this.WEIGHT_FEE_PER_KG;

      // Calculate fragile fee
      const fragileItems = request.items.filter(item => item.isFragile);
      const fragileFee = fragileItems.length > 0 ? this.FRAGILE_FEE : 0;

      // Calculate express fee
      let expressFee = 0;
      if (request.deliveryType === 'express') {
        expressFee = baseFee * (this.EXPRESS_MULTIPLIER - 1);
      } else if (request.deliveryType === 'same_day') {
        expressFee = baseFee * (this.SAME_DAY_MULTIPLIER - 1);
      }

      // Calculate total fee
      const totalFee = baseFee + distanceFee + weightFee + fragileFee + expressFee;

      // Determine estimated delivery time
      let estimatedDeliveryTime = '';
      if (request.deliveryType === 'same_day') {
        estimatedDeliveryTime = 'Same day (if ordered before 2 PM)';
      } else if (request.deliveryType === 'express') {
        estimatedDeliveryTime = '1-2 business days';
      } else {
        if (distance <= 10) {
          estimatedDeliveryTime = '1-2 business days';
        } else if (distance <= 50) {
          estimatedDeliveryTime = '2-3 business days';
        } else {
          estimatedDeliveryTime = '3-5 business days';
        }
      }

      return {
        baseFee,
        distanceFee,
        weightFee,
        fragileFee,
        expressFee,
        totalFee: Math.round(totalFee), // Round to nearest whole number
        estimatedDeliveryTime,
        distance
      };
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      // Return default fee if calculation fails
      return {
        baseFee: this.BASE_FEES.standard,
        distanceFee: 0,
        weightFee: 0,
        fragileFee: 0,
        expressFee: 0,
        totalFee: this.BASE_FEES.standard,
        estimatedDeliveryTime: '2-3 business days',
        distance: 0
      };
    }
  }

  // Get delivery zones and their base fees
  static getDeliveryZones(): Array<{
    zone: string;
    baseFee: number;
    estimatedTime: string;
    description: string;
  }> {
    return [
      {
        zone: 'Nairobi CBD',
        baseFee: 300,
        estimatedTime: 'Same day (if ordered before 2 PM)',
        description: 'Central Business District and immediate surroundings'
      },
      {
        zone: 'Nairobi Metro',
        baseFee: 500,
        estimatedTime: '1-2 business days',
        description: 'Greater Nairobi area including suburbs'
      },
      {
        zone: 'Nairobi County',
        baseFee: 800,
        estimatedTime: '2-3 business days',
        description: 'All areas within Nairobi County'
      },
      {
        zone: 'Other Counties',
        baseFee: 1200,
        estimatedTime: '3-5 business days',
        description: 'All other counties in Kenya'
      }
    ];
  }

  // Validate delivery address
  static validateDeliveryAddress(address: string, city: string): {
    isValid: boolean;
    message: string;
    suggestedZone?: string;
  } {
    if (!address || !city) {
      return {
        isValid: false,
        message: 'Please provide both address and city'
      };
    }

    // Check if it's a valid Kenyan city
    const validCities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kakamega'];
    const isValidCity = validCities.some(validCity => 
      city.toLowerCase().includes(validCity.toLowerCase())
    );

    if (!isValidCity) {
      return {
        isValid: false,
        message: 'Delivery is currently only available in major Kenyan cities',
        suggestedZone: 'Other Counties'
      };
    }

    return {
      isValid: true,
      message: 'Address is valid for delivery',
      suggestedZone: city.toLowerCase().includes('nairobi') ? 'Nairobi County' : 'Other Counties'
    };
  }
} 