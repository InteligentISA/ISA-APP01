export interface DeliveryLocation {
  county: string;
  constituency?: string;
  ward?: string;
  whatsapp_number?: string;
}

export interface DeliveryCostCalculation {
  baseCost: number;
  countyCost: number;
  constituencyCost: number;
  wardCost: number;
  totalCost: number;
  breakdown: {
    base: number;
    county: number;
    constituency: number;
    ward: number;
  };
}

export class DeliveryCostService {
  // Static delivery cost configuration
  private static readonly BASE_COST = 200;
  private static readonly COUNTY_COST_MULTIPLIER = 100;
  private static readonly CONSTITUENCY_COST_MULTIPLIER = 50;
  private static readonly WARD_COST_MULTIPLIER = 25;

  // Major counties that typically have higher delivery costs
  private static readonly MAJOR_COUNTIES = [
    'Nairobi County',
    'Mombasa County',
    'Kisumu County',
    'Nakuru County'
  ];

  // Counties with ward data (hotspot counties)
  private static readonly HOTSPOT_COUNTIES = [
    'Nairobi County',
    'Kiambu County', 
    'Kajiado County',
    'Machakos County'
  ];

  /**
   * Calculate delivery cost between two locations using static rules
   * Formula: Total Cost = Base Cost + County Cost + Constituency Cost + Ward Cost
   */
  static async calculateDeliveryCost(
    fromLocation: DeliveryLocation,
    toLocation: DeliveryLocation
  ): Promise<{ data: DeliveryCostCalculation | null; error: any }> {
    try {
      const baseCost = this.BASE_COST;
      let countyCost = 0;
      let constituencyCost = 0;
      let wardCost = 0;

      // Calculate county cost - different counties have different costs
      if (fromLocation.county !== toLocation.county) {
        // Base county cost
        countyCost = this.COUNTY_COST_MULTIPLIER;
        
        // Additional cost for major counties
        if (this.MAJOR_COUNTIES.includes(toLocation.county)) {
          countyCost += 50;
        }
        
        // Additional cost if from major county
        if (this.MAJOR_COUNTIES.includes(fromLocation.county)) {
          countyCost += 25;
        }
      }

      // Calculate constituency cost - only if same county
      if (fromLocation.constituency && toLocation.constituency && 
          fromLocation.county === toLocation.county &&
          fromLocation.constituency !== toLocation.constituency) {
        constituencyCost = this.CONSTITUENCY_COST_MULTIPLIER;
      }

      // Calculate ward cost - only if same constituency and county is hotspot
      if (fromLocation.ward && toLocation.ward && 
          fromLocation.constituency === toLocation.constituency &&
          fromLocation.ward !== toLocation.ward &&
          this.HOTSPOT_COUNTIES.includes(fromLocation.county)) {
        wardCost = this.WARD_COST_MULTIPLIER;
      }

      const totalCost = baseCost + countyCost + constituencyCost + wardCost;

      const calculation: DeliveryCostCalculation = {
        baseCost,
        countyCost,
        constituencyCost,
        wardCost,
        totalCost,
        breakdown: {
          base: baseCost,
          county: countyCost,
          constituency: constituencyCost,
          ward: wardCost
        }
      };

      return { data: calculation, error: null };
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      // Return default cost if calculation fails
      const defaultCost = {
        baseCost: this.BASE_COST,
        countyCost: 0,
        constituencyCost: 0,
        wardCost: 0,
        totalCost: this.BASE_COST,
        breakdown: {
          base: this.BASE_COST,
          county: 0,
          constituency: 0,
          ward: 0
        }
      };
      return { data: defaultCost, error: null };
    }
  }

  /**
   * Calculate delivery cost for a product to a customer location
   * Uses a default pickup location (Nairobi) for simplicity
   */
  static async calculateProductDeliveryCost(
    productId: string,
    customerLocation: DeliveryLocation
  ): Promise<{ data: DeliveryCostCalculation | null; error: any }> {
    try {
      // Default pickup location (Nairobi) - you can modify this based on your needs
      const pickupLocation: DeliveryLocation = {
        county: 'Nairobi County',
        constituency: 'Westlands',
        ward: 'Kitisuru'
      };

      return await this.calculateDeliveryCost(pickupLocation, customerLocation);
    } catch (error) {
      console.error('Error calculating product delivery cost:', error);
      return { data: null, error };
    }
  }

  /**
   * Format delivery cost for display
   */
  static formatDeliveryCost(cost: DeliveryCostCalculation): string {
    return `Ksh ${cost.totalCost.toFixed(0)}`;
  }

  /**
   * Get delivery cost breakdown for display
   */
  static getDeliveryCostBreakdown(cost: DeliveryCostCalculation): string {
    const parts = [];
    
    if (cost.breakdown.base > 0) {
      parts.push(`Base: Ksh ${cost.breakdown.base}`);
    }
    if (cost.breakdown.county > 0) {
      parts.push(`County: Ksh ${cost.breakdown.county}`);
    }
    if (cost.breakdown.constituency > 0) {
      parts.push(`Constituency: Ksh ${cost.breakdown.constituency}`);
    }
    if (cost.breakdown.ward > 0) {
      parts.push(`Ward: Ksh ${cost.breakdown.ward}`);
    }

    return parts.join(' + ');
  }

  // Get delivery cost for multiple products (for checkout) - grouped by vendor
  static async getCartDeliveryCost(
    products: Array<{ id: string; quantity: number; vendor_id?: string }>,
    customerLocation: DeliveryLocation
  ): Promise<{ data: { totalCost: number; breakdown: Array<{ productId: string; cost: number; vendor_id?: string }>; vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> } | null; error: any }> {
    try {
      const breakdown: Array<{ productId: string; cost: number; vendor_id?: string }> = [];
      const vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> = [];
      let totalCost = 0;

      // Group products by vendor
      const vendorGroups = new Map<string, Array<{ id: string; quantity: number; vendor_id?: string }>>();
      
      for (const product of products) {
        const vendorId = product.vendor_id || 'default'; // Use 'default' for products without vendor
        if (!vendorGroups.has(vendorId)) {
          vendorGroups.set(vendorId, []);
        }
        vendorGroups.get(vendorId)!.push(product);
      }

      // Calculate delivery cost once per vendor
      for (const [vendorId, vendorProducts] of vendorGroups) {
        if (vendorProducts.length === 0) continue;

        // Calculate delivery cost for the first product of this vendor (since all products from same vendor have same pickup location)
        const firstProduct = vendorProducts[0];
        const { data: deliveryCost, error } = await this.calculateProductDeliveryCost(firstProduct.id, customerLocation);
        
        if (error || !deliveryCost) {
          console.error(`Error calculating delivery cost for vendor ${vendorId}:`, error);
          continue;
        }

        // Charge delivery cost only once per vendor, regardless of number of products
        const vendorDeliveryCost = deliveryCost.totalCost;
        totalCost += vendorDeliveryCost;

        // Add to vendor breakdown
        vendorBreakdown.push({
          vendor_id: vendorId,
          cost: vendorDeliveryCost,
          productCount: vendorProducts.length
        });

        // Add individual product breakdown (showing 0 cost for additional products from same vendor)
        for (let i = 0; i < vendorProducts.length; i++) {
          const product = vendorProducts[i];
          const productCost = i === 0 ? vendorDeliveryCost : 0; // Only first product pays delivery cost
          
          breakdown.push({
            productId: product.id,
            cost: productCost,
            vendor_id: product.vendor_id
          });
        }
      }

      return { data: { totalCost, breakdown, vendorBreakdown }, error: null };
    } catch (error) {
      console.error('Error calculating cart delivery cost:', error);
      return { data: null, error };
    }
  }

  // Get delivery cost for cart items (with product information) - grouped by vendor
  static async getCartItemsDeliveryCost(
    cartItems: Array<{ product: { id: string; vendor_id?: string }; quantity: number }>,
    customerLocation: DeliveryLocation
  ): Promise<{ data: { totalCost: number; breakdown: Array<{ productId: string; cost: number; vendor_id?: string }>; vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> } | null; error: any }> {
    try {
      const breakdown: Array<{ productId: string; cost: number; vendor_id?: string }> = [];
      const vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> = [];
      let totalCost = 0;

      // Group cart items by vendor
      const vendorGroups = new Map<string, Array<{ product: { id: string; vendor_id?: string }; quantity: number }>>();
      
      for (const cartItem of cartItems) {
        const vendorId = cartItem.product.vendor_id || 'default'; // Use 'default' for products without vendor
        if (!vendorGroups.has(vendorId)) {
          vendorGroups.set(vendorId, []);
        }
        vendorGroups.get(vendorId)!.push(cartItem);
      }

      // Calculate delivery cost once per vendor
      for (const [vendorId, vendorCartItems] of vendorGroups) {
        if (vendorCartItems.length === 0) continue;

        // Calculate delivery cost for the first product of this vendor (since all products from same vendor have same pickup location)
        const firstCartItem = vendorCartItems[0];
        const { data: deliveryCost, error } = await this.calculateProductDeliveryCost(firstCartItem.product.id, customerLocation);
        
        if (error || !deliveryCost) {
          console.error(`Error calculating delivery cost for vendor ${vendorId}:`, error);
          continue;
        }

        // Charge delivery cost only once per vendor, regardless of number of products
        const vendorDeliveryCost = deliveryCost.totalCost;
        totalCost += vendorDeliveryCost;

        // Add to vendor breakdown
        vendorBreakdown.push({
          vendor_id: vendorId,
          cost: vendorDeliveryCost,
          productCount: vendorCartItems.length
        });

        // Add individual product breakdown (showing 0 cost for additional products from same vendor)
        for (let i = 0; i < vendorCartItems.length; i++) {
          const cartItem = vendorCartItems[i];
          const productCost = i === 0 ? vendorDeliveryCost : 0; // Only first product pays delivery cost
          
          breakdown.push({
            productId: cartItem.product.id,
            cost: productCost,
            vendor_id: cartItem.product.vendor_id
          });
        }
      }

      return { data: { totalCost, breakdown, vendorBreakdown }, error: null };
    } catch (error) {
      console.error('Error calculating cart items delivery cost:', error);
      return { data: null, error };
    }
  }

  // Validate delivery location (simplified validation)
  static async validateDeliveryLocation(location: DeliveryLocation): Promise<{ isValid: boolean; message: string }> {
    try {
      if (!location.county) {
        return { isValid: false, message: 'County is required' };
      }

      if (!location.whatsapp_number) {
        return { isValid: false, message: 'WhatsApp number is required for delivery' };
      }

      return { isValid: true, message: 'Valid delivery location' };
    } catch (error) {
      return { isValid: false, message: 'Error validating location' };
    }
  }
}
