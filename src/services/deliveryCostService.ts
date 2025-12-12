import { supabase } from "@/integrations/supabase/client";

export interface DeliveryLocation {
  county: string;
  constituency?: string;
  ward?: string;
  whatsapp_number?: string;
  apartment_landmark?: string;
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
  private static readonly BASE_COST = 200;

  // Hotspot counties with ward-level delivery
  private static readonly HOTSPOT_COUNTIES = [
    'Nairobi',
    'Kiambu', 
    'Kajiado',
    'Machakos'
  ];

  // Get all counties
  static async getCounties(): Promise<{ data: Array<{ id: string; name: string; is_hotspot: boolean }>; error: any }> {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('id, name, is_hotspot')
        .order('name');
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get county by name
  static async getCountyByName(name: string): Promise<{ data: { id: string; name: string; is_hotspot: boolean } | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('id, name, is_hotspot')
        .eq('name', name)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get constituencies by county
  static async getConstituenciesByCounty(countyId: string): Promise<{ data: Array<{ id: string; name: string }>; error: any }> {
    try {
      const { data, error } = await supabase
        .from('constituencies')
        .select('id, name')
        .eq('county_id', countyId)
        .order('name');
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get constituency by name
  static async getConstituencyByName(name: string, countyId: string): Promise<{ data: { id: string; name: string } | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('constituencies')
        .select('id, name')
        .eq('name', name)
        .eq('county_id', countyId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get wards by constituency
  static async getWardsByConstituency(constituencyId: string): Promise<{ data: Array<{ id: string; name: string }>; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wards')
        .select('id, name')
        .eq('constituency_id', constituencyId)
        .order('name');
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Calculate delivery cost between two locations
  static async calculateDeliveryCost(
    fromLocation: DeliveryLocation,
    toLocation: DeliveryLocation
  ): Promise<{ data: DeliveryCostCalculation | null; error: any }> {
    try {
      // Get base cost from database
      const { data: baseCostData } = await supabase
        .from('delivery_base_cost')
        .select('base_cost')
        .eq('is_active', true)
        .single();

      const baseCost = baseCostData?.base_cost || this.BASE_COST;
      let countyCost = 0;
      let constituencyCost = 0;
      let wardCost = 0;

      // Calculate county cost
      if (fromLocation.county !== toLocation.county) {
        const { data: countyData } = await supabase
          .from('delivery_county_costs')
          .select('cost')
          .or(`and(from_county_id.eq.${fromLocation.county},to_county_id.eq.${toLocation.county}),and(from_county_id.eq.${toLocation.county},to_county_id.eq.${fromLocation.county})`)
          .eq('is_active', true)
          .single();
        
        countyCost = countyData?.cost || 100;
      }

      // Calculate constituency cost (same county, different constituency)
      if (fromLocation.county === toLocation.county && 
          fromLocation.constituency && toLocation.constituency &&
          fromLocation.constituency !== toLocation.constituency) {
        constituencyCost = 50;
      }

      // Calculate ward cost (same constituency, different ward, hotspot area)
      if (fromLocation.constituency === toLocation.constituency &&
          fromLocation.ward && toLocation.ward &&
          fromLocation.ward !== toLocation.ward &&
          this.HOTSPOT_COUNTIES.some(c => fromLocation.county?.includes(c))) {
        wardCost = 25;
      }

      const totalCost = baseCost + countyCost + constituencyCost + wardCost;

      return {
        data: {
          baseCost,
          countyCost,
          constituencyCost,
          wardCost,
          totalCost,
          breakdown: { base: baseCost, county: countyCost, constituency: constituencyCost, ward: wardCost }
        },
        error: null
      };
    } catch (error) {
      return {
        data: { baseCost: this.BASE_COST, countyCost: 0, constituencyCost: 0, wardCost: 0, totalCost: this.BASE_COST, breakdown: { base: this.BASE_COST, county: 0, constituency: 0, ward: 0 } },
        error: null
      };
    }
  }

  // Get delivery cost for a product
  static async getProductDeliveryCost(
    productId: string,
    customerLocation: DeliveryLocation
  ): Promise<{ data: DeliveryCostCalculation | null; error: any }> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('pickup_county, pickup_constituency, pickup_ward')
        .eq('id', productId)
        .single();

      const pickupLocation: DeliveryLocation = {
        county: product?.pickup_county || 'Nairobi',
        constituency: product?.pickup_constituency,
        ward: product?.pickup_ward
      };

      return this.calculateDeliveryCost(pickupLocation, customerLocation);
    } catch (error) {
      return { data: null, error };
    }
  }

  // Format delivery cost
  static formatDeliveryCost(cost: DeliveryCostCalculation): string {
    return `Ksh ${cost.totalCost.toFixed(0)}`;
  }

  // Validate delivery location
  static async validateDeliveryLocation(location: DeliveryLocation): Promise<{ isValid: boolean; message: string }> {
    if (!location.county) return { isValid: false, message: 'County is required' };
    return { isValid: true, message: 'Valid location' };
  }

  // Get cart delivery cost grouped by vendor
  static async getCartDeliveryCost(
    products: Array<{ id: string; quantity: number; vendor_id?: string }>,
    customerLocation: DeliveryLocation
  ): Promise<{ data: { totalCost: number; breakdown: Array<{ productId: string; cost: number; vendor_id?: string }>; vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> } | null; error: any }> {
    const vendorGroups = new Map<string, typeof products>();
    
    for (const product of products) {
      const vendorId = product.vendor_id || 'default';
      if (!vendorGroups.has(vendorId)) vendorGroups.set(vendorId, []);
      vendorGroups.get(vendorId)!.push(product);
    }

    let totalCost = 0;
    const breakdown: Array<{ productId: string; cost: number; vendor_id?: string }> = [];
    const vendorBreakdown: Array<{ vendor_id: string; cost: number; productCount: number }> = [];

    for (const [vendorId, vendorProducts] of vendorGroups) {
      const { data: deliveryCost } = await this.getProductDeliveryCost(vendorProducts[0].id, customerLocation);
      const vendorDeliveryCost = deliveryCost?.totalCost || this.BASE_COST;
      totalCost += vendorDeliveryCost;

      vendorBreakdown.push({ vendor_id: vendorId, cost: vendorDeliveryCost, productCount: vendorProducts.length });
      
      vendorProducts.forEach((product, i) => {
        breakdown.push({ productId: product.id, cost: i === 0 ? vendorDeliveryCost : 0, vendor_id: product.vendor_id });
      });
    }

    return { data: { totalCost, breakdown, vendorBreakdown }, error: null };
  }
}