// Simple script to populate location data
// Run this in the browser console

// First, get your Supabase URL and anon key from your .env file or Supabase dashboard
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Location data for Kenya
const locationData = [
  {
    name: "Nairobi County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Westlands",
        wards: [
          { name: "Kitisuru" },
          { name: "Parklands/Highridge" },
          { name: "Karura" },
          { name: "Kangemi" },
          { name: "Mountain View" }
        ]
      },
      {
        name: "Dagoretti North",
        wards: [
          { name: "Kilimani" },
          { name: "Kawangware" },
          { name: "Gatina" },
          { name: "Kileleshwa" },
          { name: "Kabiro" }
        ]
      },
      {
        name: "Dagoretti South",
        wards: [
          { name: "Mutu-Ini" },
          { name: "Ngando" },
          { name: "Riruta" },
          { name: "Uthiru/Ruthimitu" },
          { name: "Waithaka" }
        ]
      },
      {
        name: "Lang'ata",
        wards: [
          { name: "Karen" },
          { name: "Nairobi West" },
          { name: "Mugumu-Ini" },
          { name: "South C" },
          { name: "Nyayo Highrise" }
        ]
      },
      {
        name: "Kibra",
        wards: [
          { name: "Woodley/Kenyatta Golf Course" },
          { name: "Sarang'ombe" },
          { name: "Makina" },
          { name: "Lindi" },
          { name: "Laini Saba" }
        ]
      }
    ]
  },
  {
    name: "Kiambu County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Thika Town",
        wards: [
          { name: "Township" },
          { name: "Kamenu" },
          { name: "Hospital" },
          { name: "Gatuanyaga" },
          { name: "Ngoliba" }
        ]
      },
      {
        name: "Ruiru",
        wards: [
          { name: "Gitothua" },
          { name: "Biashara" },
          { name: "Gatongora" },
          { name: "Kahawa Sukari" },
          { name: "Kahawa Wendani" }
        ]
      }
    ]
  },
  {
    name: "Machakos County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Machakos Town",
        wards: [
          { name: "Kalama" },
          { name: "Mua" },
          { name: "Mutitini" },
          { name: "Machakos Central" },
          { name: "Mumbuni North" }
        ]
      }
    ]
  },
  {
    name: "Kajiado County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Kajiado North",
        wards: [
          { name: "Olkeri" },
          { name: "Ongata Rongai" },
          { name: "Nkaimurunya" },
          { name: "Oloolua" },
          { name: "Ngong" }
        ]
      }
    ]
  }
];

async function populateLocationData() {
  try {
    console.log('🚀 Starting location data population...');

    // Clear existing data
    await supabase.from('delivery_ward_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delivery_constituency_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delivery_county_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('wards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('constituencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('counties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert counties
    const countiesToInsert = locationData.map(county => ({
      name: county.name,
      is_hotspot: county.is_hotspot
    }));

    const { data: insertedCounties, error: countiesError } = await supabase
      .from('counties')
      .insert(countiesToInsert)
      .select('id, name, is_hotspot');

    if (countiesError) {
      console.error('Error inserting counties:', countiesError);
      return;
    }

    console.log(`✅ Inserted ${insertedCounties?.length || 0} counties`);

    // Create county map
    const countyMap = new Map();
    insertedCounties?.forEach(county => {
      countyMap.set(county.name, county.id);
    });

    // Insert constituencies
    const constituenciesToInsert = [];
    
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
      return;
    }

    console.log(`✅ Inserted ${insertedConstituencies?.length || 0} constituencies`);

    // Create constituency map
    const constituencyMap = new Map();
    insertedConstituencies?.forEach(constituency => {
      const key = `${constituency.county_id}-${constituency.name}`;
      constituencyMap.set(key, constituency.id);
    });

    // Insert wards (only for hotspot areas)
    const wardsToInsert = [];
    
    for (const county of locationData) {
      if (!county.is_hotspot) continue;

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
        return;
      }

      console.log(`✅ Inserted ${insertedWards?.length || 0} wards`);
    }

    // Set up default delivery costs
    await supabase
      .from('delivery_base_cost')
      .upsert({
        base_cost: 200.00,
        is_active: true
      });

    console.log('✅ Set base delivery cost to Ksh 200');

    // Set up county-to-county costs (simplified - all counties cost 100 to each other)
    const countyCosts = [];
    for (const fromCounty of insertedCounties || []) {
      for (const toCounty of insertedCounties || []) {
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
      await supabase.from('delivery_county_costs').insert(countyCosts);
      console.log(`✅ Set up ${countyCosts.length} county-to-county delivery costs`);
    }

    console.log('🎉 Location data population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Counties: ${insertedCounties?.length || 0}`);
    console.log(`   Constituencies: ${insertedConstituencies?.length || 0}`);
    console.log(`   Wards: ${wardsToInsert.length}`);
    console.log(`   County Costs: ${countyCosts.length}`);

  } catch (error) {
    console.error('❌ Error populating location data:', error);
  }
}

// Run the script
populateLocationData();
