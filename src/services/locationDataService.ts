import { supabase } from '@/integrations/supabase/client';
import { locationData } from '@/lib/locationData';

export interface County {
  id: string;
  name: string;
  is_hotspot: boolean;
  created_at: string;
  updated_at: string;
}

export interface Constituency {
  id: string;
  name: string;
  county_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ward {
  id: string;
  name: string;
  constituency_id: string;
  created_at: string;
  updated_at: string;
}

export class LocationDataService {
  // Populate counties, constituencies, and wards from locationData
  static async populateLocationData(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Starting to populate location data...');

      // First, clear existing data (in reverse order due to foreign key constraints)
      await supabase.from('delivery_ward_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('delivery_constituency_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('delivery_county_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('wards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('constituencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('counties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert counties
      const countiesToInsert = locationData.map(county => ({
        name: county.name,
        is_hotspot: county.hasWards
      }));

      const { data: insertedCounties, error: countiesError } = await supabase
        .from('counties')
        .insert(countiesToInsert)
        .select('id, name, is_hotspot');

      if (countiesError) {
        console.error('Error inserting counties:', countiesError);
        return { success: false, error: countiesError };
      }

      console.log(`Inserted ${insertedCounties?.length || 0} counties`);

      // Create a map of county names to IDs
      const countyMap = new Map<string, string>();
      insertedCounties?.forEach(county => {
        countyMap.set(county.name, county.id);
      });

      // Insert constituencies
      const constituenciesToInsert: Array<{ name: string; county_id: string }> = [];
      
      for (const county of locationData) {
        const countyId = countyMap.get(county.name);
        if (!countyId) continue;

        for (const constituency of county.constituencies) {
          constituenciesToInsert.push({
            name: constituency.name,
            county_id: countyId
          });
        }
      }

      const { data: insertedConstituencies, error: constituenciesError } = await supabase
        .from('constituencies')
        .insert(constituenciesToInsert)
        .select('id, name, county_id');

      if (constituenciesError) {
        console.error('Error inserting constituencies:', constituenciesError);
        return { success: false, error: constituenciesError };
      }

      console.log(`Inserted ${insertedConstituencies?.length || 0} constituencies`);

      // Create a map of constituency names to IDs (with county context)
      const constituencyMap = new Map<string, string>();
      insertedConstituencies?.forEach(constituency => {
        const key = `${constituency.county_id}-${constituency.name}`;
        constituencyMap.set(key, constituency.id);
      });

      // Insert wards (only for hotspot counties)
      const wardsToInsert: Array<{ name: string; constituency_id: string }> = [];
      
      for (const county of locationData) {
        if (!county.hasWards) continue;

        const countyId = countyMap.get(county.name);
        if (!countyId) continue;

        for (const constituency of county.constituencies) {
          const constituencyId = constituencyMap.get(`${countyId}-${constituency.name}`);
          if (!constituencyId) continue;

          for (const ward of constituency.wards) {
            wardsToInsert.push({
              name: ward.name,
              constituency_id: constituencyId
            });
          }
        }
      }

      if (wardsToInsert.length > 0) {
        const { data: insertedWards, error: wardsError } = await supabase
          .from('wards')
          .insert(wardsToInsert)
          .select('id, name, constituency_id');

        if (wardsError) {
          console.error('Error inserting wards:', wardsError);
          return { success: false, error: wardsError };
        }

        console.log(`Inserted ${insertedWards?.length || 0} wards`);
      }

      // Set up default delivery costs - cast to avoid type issues
      await this.setupDefaultDeliveryCosts((insertedCounties || []) as County[]);

      console.log('Location data population completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error populating location data:', error);
      return { success: false, error };
    }
  }

  // Set up default delivery costs
  private static async setupDefaultDeliveryCosts(counties: County[]): Promise<void> {
    try {
      // Set base cost
      const { error: baseCostError } = await supabase
        .from('delivery_base_cost')
        .upsert({
          base_cost: 200.00,
          is_active: true
        });

      if (baseCostError) {
        console.error('Error setting base cost:', baseCostError);
        return;
      }

      // Set county-to-county costs (simplified - all counties cost 100 to each other)
      const countyCosts = [];
      for (const fromCounty of counties) {
        for (const toCounty of counties) {
          if (fromCounty.id !== toCounty.id) {
            countyCosts.push({
              from_county_id: fromCounty.id,
              to_county_id: toCounty.id,
              cost: 100.00,
              is_active: true
            });
          }
        }
      }

      if (countyCosts.length > 0) {
        const { error: countyCostsError } = await supabase
          .from('delivery_county_costs')
          .insert(countyCosts);

        if (countyCostsError) {
          console.error('Error setting county costs:', countyCostsError);
        }
      }

      console.log('Default delivery costs set up successfully');
    } catch (error) {
      console.error('Error setting up default delivery costs:', error);
    }
  }

  // Get all counties
  static async getCounties(): Promise<{ data: County[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .order('name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get constituencies by county
  static async getConstituenciesByCounty(countyId: string): Promise<{ data: Constituency[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('constituencies')
        .select('*')
        .eq('county_id', countyId)
        .order('name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Get wards by constituency
  static async getWardsByConstituency(constituencyId: string): Promise<{ data: Ward[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('constituency_id', constituencyId)
        .order('name');

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Check if location data is populated
  static async isLocationDataPopulated(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('counties')
        .select('id')
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Get location statistics
  static async getLocationStats(): Promise<{
    counties: number;
    constituencies: number;
    wards: number;
    hotspotCounties: number;
  }> {
    try {
      const [countiesResult, constituenciesResult, wardsResult, hotspotResult] = await Promise.all([
        supabase.from('counties').select('id', { count: 'exact' }),
        supabase.from('constituencies').select('id', { count: 'exact' }),
        supabase.from('wards').select('id', { count: 'exact' }),
        supabase.from('counties').select('id', { count: 'exact' }).eq('is_hotspot', true)
      ]);

      return {
        counties: countiesResult.count || 0,
        constituencies: constituenciesResult.count || 0,
        wards: wardsResult.count || 0,
        hotspotCounties: hotspotResult.count || 0
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return {
        counties: 0,
        constituencies: 0,
        wards: 0,
        hotspotCounties: 0
      };
    }
  }
}
