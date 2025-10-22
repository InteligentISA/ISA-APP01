// Script to populate location data in Supabase
// Run this with: node scripts/populate-location-data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
      },
      {
        name: "Roysambu",
        wards: [
          { name: "Kahawa West" },
          { name: "Roysambu" },
          { name: "Githurai" },
          { name: "Kahawa" },
          { name: "Zimmerman" }
        ]
      },
      {
        name: "Kasarani",
        wards: [
          { name: "Kasarani" },
          { name: "Njiru" },
          { name: "Clay City" },
          { name: "Mwiki" },
          { name: "Ruai" }
        ]
      },
      {
        name: "Ruaraka",
        wards: [
          { name: "Utalii" },
          { name: "Korogocho" },
          { name: "Lucky Summer" },
          { name: "Mathare North" },
          { name: "Baba Dogo" }
        ]
      },
      {
        name: "Embakasi South",
        wards: [
          { name: "Kwa Njenga" },
          { name: "Imara Daima" },
          { name: "Kware" },
          { name: "Kwa Reuben" },
          { name: "Pipeline" }
        ]
      },
      {
        name: "Embakasi North",
        wards: [
          { name: "Dandora Area I" },
          { name: "Dandora Area II" },
          { name: "Dandora Area III" },
          { name: "Dandora Area IV" },
          { name: "Kariobangi North" }
        ]
      },
      {
        name: "Embakasi Central",
        wards: [
          { name: "Kayole North" },
          { name: "Kayole Central" },
          { name: "Kariobangi South" },
          { name: "Komarock" },
          { name: "Matopeni / Spring Valley" }
        ]
      },
      {
        name: "Embakasi East",
        wards: [
          { name: "Utawala" },
          { name: "Upper Savanna" },
          { name: "Lower Savanna" },
          { name: "Embakasi" },
          { name: "Mihango" }
        ]
      },
      {
        name: "Embakasi West",
        wards: [
          { name: "Umoja 1" },
          { name: "Umoja 2" },
          { name: "Mowlem" },
          { name: "Kariobangi South" },
          { name: "Maringo/ Hamza" }
        ]
      },
      {
        name: "Makadara",
        wards: [
          { name: "Viwandani" },
          { name: "Harambee" },
          { name: "Makongeni" },
          { name: "Pumwani" },
          { name: "Eastleigh North" }
        ]
      },
      {
        name: "Kamukunji",
        wards: [
          { name: "Eastleigh South" },
          { name: "Nairobi Central" },
          { name: "Airbase" },
          { name: "California" },
          { name: "Mgara" }
        ]
      },
      {
        name: "Starehe",
        wards: [
          { name: "Nairobi South" },
          { name: "Hospital" },
          { name: "Ngara" },
          { name: "Pangani" },
          { name: "Landimawe" },
          { name: "Ziwani / Kariokor" }
        ]
      },
      {
        name: "Mathare",
        wards: [
          { name: "Mlango Kubwa" },
          { name: "Kiamaiko" },
          { name: "Ngei" },
          { name: "Huruma" },
          { name: "Mabatini" }
        ]
      }
    ]
  },
  {
    name: "Kiambu County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Gatundu North",
        wards: [
          { name: "Gituamba" },
          { name: "Githobokoni" },
          { name: "Chania" },
          { name: "Mang'u" }
        ]
      },
      {
        name: "Gatundu South",
        wards: [
          { name: "Kiamwangi" },
          { name: "Kiganjo" },
          { name: "Ndarugu" },
          { name: "Ngenda" }
        ]
      },
      {
        name: "Githunguri",
        wards: [
          { name: "Githunguri" },
          { name: "Githiga" },
          { name: "Ikinu" },
          { name: "Ngewa" },
          { name: "Komothai" }
        ]
      },
      {
        name: "Juja",
        wards: [
          { name: "Murera" },
          { name: "Theta" },
          { name: "Juja" },
          { name: "Witeithie" },
          { name: "Kalimoni" }
        ]
      },
      {
        name: "Kabete",
        wards: [
          { name: "Gitaru" },
          { name: "Muguga" },
          { name: "Nyathuna" },
          { name: "Kabete" },
          { name: "Uthiru" }
        ]
      },
      {
        name: "Kiambaa",
        wards: [
          { name: "Cianda" },
          { name: "Karuiri" },
          { name: "Ndenderu" },
          { name: "Muchatha" },
          { name: "Kihara" }
        ]
      },
      {
        name: "Kiambu",
        wards: [
          { name: "Ting'gang'a" },
          { name: "Ndumberi" },
          { name: "Riabai" },
          { name: "Township" }
        ]
      },
      {
        name: "Limuru",
        wards: [
          { name: "Bibirioni" },
          { name: "Limuru Central" },
          { name: "Ndeiya" },
          { name: "Limuru East" },
          { name: "Ngecha Tigoni" }
        ]
      },
      {
        name: "Kikuyu",
        wards: [
          { name: "Karai" },
          { name: "Nachu" },
          { name: "Sigona" },
          { name: "Kikuyu" },
          { name: "Kinoo" }
        ]
      },
      {
        name: "Lari",
        wards: [
          { name: "Kijabe" },
          { name: "Nyanduma" },
          { name: "Kamburu" },
          { name: "Lari/Kirenga" }
        ]
      },
      {
        name: "Ruiru",
        wards: [
          { name: "Gitothua" },
          { name: "Biashara" },
          { name: "Gatongora" },
          { name: "Kahawa Sukari" },
          { name: "Kahawa Wendani" },
          { name: "Kiuu" },
          { name: "Mwiki" },
          { name: "Mwihoko" }
        ]
      },
      {
        name: "Thika Town",
        wards: [
          { name: "Township" },
          { name: "Kamenu" },
          { name: "Hospital" },
          { name: "Gatuanyaga" },
          { name: "Ngoliba" }
        ]
      }
    ]
  },
  {
    name: "Kajiado County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Kajiado Central",
        wards: [
          { name: "Purko" },
          { name: "Ildamat" },
          { name: "Dalalekutuk" },
          { name: "Matapato North" },
          { name: "Matapato South" }
        ]
      },
      {
        name: "Kajiado East",
        wards: [
          { name: "Kaputiei North" },
          { name: "Kitengela" },
          { name: "Oloosirkon/Sholinke" },
          { name: "Kenyawa-Poka" },
          { name: "Imaroro" }
        ]
      },
      {
        name: "Kajiado North",
        wards: [
          { name: "Olkeri" },
          { name: "Ongata Rongai" },
          { name: "Nkaimurunya" },
          { name: "Oloolua" },
          { name: "Ngong" }
        ]
      },
      {
        name: "Kajiado West",
        wards: [
          { name: "Keekonyokie" },
          { name: "Iloodokilani" },
          { name: "Magadi" },
          { name: "Ewuaso Oonkidong'i" },
          { name: "Mosiro" }
        ]
      },
      {
        name: "Kajiado South",
        wards: [
          { name: "Entonet/Lenkisi" },
          { name: "Mbirikani/Eselen" },
          { name: "Keikuku" },
          { name: "Rombo" },
          { name: "Kimana" }
        ]
      }
    ]
  },
  {
    name: "Machakos County",
    is_hotspot: true,
    constituencies: [
      {
        name: "Masinga",
        wards: [
          { name: "Kivaa" },
          { name: "Masinga" },
          { name: "Central" },
          { name: "Ekalakala" },
          { name: "Muthesya" },
          { name: "Ndithini" }
        ]
      },
      {
        name: "Yatta",
        wards: [
          { name: "Ndalani" },
          { name: "Matuu" },
          { name: "Kithimani" },
          { name: "Ikomba" },
          { name: "Katangi" }
        ]
      },
      {
        name: "Matungulu",
        wards: [
          { name: "Tala" },
          { name: "Matungulu North" },
          { name: "Matungulu East" },
          { name: "Matungulu West" },
          { name: "Kyeleni" }
        ]
      },
      {
        name: "Kangundo",
        wards: [
          { name: "Kangundo North" },
          { name: "Kangundo Central" },
          { name: "Kangundo East" },
          { name: "Kangundo West" }
        ]
      },
      {
        name: "Mwala",
        wards: [
          { name: "Mbiuni" },
          { name: "Makutano/Mwala" },
          { name: "Masii" },
          { name: "Muthetheni" },
          { name: "Wamunyu" },
          { name: "Kibauni" }
        ]
      },
      {
        name: "Kathiani",
        wards: [
          { name: "Mitaboni" },
          { name: "Kathiani Central" },
          { name: "Upper Kaewa/Iveti" },
          { name: "Lower Kaewa/Kaani" }
        ]
      },
      {
        name: "Machakos Town",
        wards: [
          { name: "Kalama" },
          { name: "Mua" },
          { name: "Mutitini" },
          { name: "Machakos Central" },
          { name: "Mumbuni North" },
          { name: "Muvuti/Kiima-Kimwe" },
          { name: "Kola" }
        ]
      },
      {
        name: "Mavoko",
        wards: [
          { name: "Athi River" },
          { name: "Kinanie" },
          { name: "Muthwani" },
          { name: "Syokimau/Mulolongo" }
        ]
      }
    ]
  }
];

async function populateLocationData() {
  try {
    console.log('🚀 Starting location data population...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('delivery_ward_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delivery_constituency_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('delivery_county_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('wards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('constituencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('counties').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert counties
    console.log('🏛️ Inserting counties...');
    const countiesToInsert = locationData.map(county => ({
      name: county.name,
      is_hotspot: county.is_hotspot
    }));

    const { data: insertedCounties, error: countiesError } = await supabase
      .from('counties')
      .insert(countiesToInsert)
      .select('id, name, is_hotspot');

    if (countiesError) {
      throw new Error('Error inserting counties: ' + countiesError.message);
    }

    console.log(`✅ Inserted ${insertedCounties?.length || 0} counties`);

    // Create county map
    const countyMap = new Map();
    insertedCounties?.forEach(county => {
      countyMap.set(county.name, county.id);
    });

    // Insert constituencies
    console.log('🏘️ Inserting constituencies...');
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
      throw new Error('Error inserting constituencies: ' + constituenciesError.message);
    }

    console.log(`✅ Inserted ${insertedConstituencies?.length || 0} constituencies`);

    // Create constituency map
    const constituencyMap = new Map();
    insertedConstituencies?.forEach(constituency => {
      const key = `${constituency.county_id}-${constituency.name}`;
      constituencyMap.set(key, constituency.id);
    });

    // Insert wards (only for hotspot areas)
    console.log('🏠 Inserting wards...');
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
        throw new Error('Error inserting wards: ' + wardsError.message);
      }

      console.log(`✅ Inserted ${insertedWards?.length || 0} wards`);
    }

    // Set up default delivery costs
    console.log('💰 Setting up delivery costs...');
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
    process.exit(1);
  }
}

// Run the script
populateLocationData();
