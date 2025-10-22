-- Comprehensive SQL script to populate all location data
-- Run this in your Supabase SQL Editor

-- Step 1: Clear existing data (if any)
DELETE FROM delivery_ward_costs WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM delivery_constituency_costs WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM delivery_county_costs WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM wards WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM constituencies WHERE id != '00000000-0000-0000-0000-000000000000';
DELETE FROM counties WHERE id != '00000000-0000-0000-0000-000000000000';

-- Step 2: Insert all 47 counties
INSERT INTO counties (name, is_hotspot) VALUES
-- Hotspot counties (with wards)
('Nairobi County', true),
('Kiambu County', true),
('Machakos County', true),
('Kajiado County', true),
-- Non-hotspot counties (without wards)
('Mombasa County', false),
('Kisumu County', false),
('Nakuru County', false),
('Malindi County', false),
('Kitale County', false),
('Garissa County', false),
('Kakamega County', false),
('Bungoma County', false),
('Busia County', false),
('Vihiga County', false),
('Siaya County', false),
('Kisii County', false),
('Nyamira County', false),
('Migori County', false),
('Homa Bay County', false),
('Kericho County', false),
('Bomet County', false),
('Nandi County', false),
('Uasin Gishu County', false),
('Elgeyo-Marakwet County', false),
('West Pokot County', false),
('Trans Nzoia County', false),
('Samburu County', false),
('Turkana County', false),
('Marsabit County', false),
('Isiolo County', false),
('Meru County', false),
('Tharaka-Nithi County', false),
('Embu County', false),
('Kitui County', false),
('Makueni County', false),
('Taita-Taveta County', false),
('Kwale County', false),
('Kilifi County', false),
('Tana River County', false),
('Lamu County', false),
('Wajir County', false),
('Mandera County', false),
('Laikipia County', false),
('Nyeri County', false),
('Kirinyaga County', false),
('Murang''a County', false),
('Nyandarua County', false);

-- Step 3: Insert constituencies for all counties
-- Nairobi County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Westlands'), ('Dagoretti North'), ('Dagoretti South'), ('Lang''ata'), ('Kibra'),
  ('Roysambu'), ('Kasarani'), ('Ruaraka'), ('Embakasi South'), ('Embakasi North'),
  ('Embakasi Central'), ('Embakasi East'), ('Embakasi West'), ('Makadara'), 
  ('Kamukunji'), ('Starehe'), ('Mathare')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Nairobi County';

-- Kiambu County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Gatundu North'), ('Gatundu South'), ('Githunguri'), ('Juja'), ('Kabete'),
  ('Kiambaa'), ('Kiambu'), ('Limuru'), ('Kikuyu'), ('Lari'), ('Ruiru'), ('Thika Town')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Kiambu County';

-- Kajiado County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Kajiado Central'), ('Kajiado East'), ('Kajiado North'), ('Kajiado West'), ('Kajiado South')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Kajiado County';

-- Machakos County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Masinga'), ('Yatta'), ('Matungulu'), ('Kangundo'), ('Mwala'), 
  ('Kathiani'), ('Machakos Town'), ('Mavoko')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Machakos County';

-- Mombasa County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Changamwe'), ('Jomvu'), ('Kisauni'), ('Nyali'), ('Likoni'), ('Mvita')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Mombasa County';

-- Kisumu County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Kisumu West'), ('Kisumu East'), ('Kisumu Central'), ('Seme'), ('Nyando'), ('Muhoroni'), ('Nyakach')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Kisumu County';

-- Nakuru County constituencies
INSERT INTO constituencies (name, county_id) 
SELECT c.name, co.id 
FROM (VALUES 
  ('Nakuru Town East'), ('Nakuru Town West'), ('Bahati'), ('Subukia'), ('Rongai'), 
  ('Kuresoi North'), ('Kuresoi South'), ('Molo'), ('Njoro'), ('Gilgil'), ('Naivasha')
) AS c(name)
CROSS JOIN counties co 
WHERE co.name = 'Nakuru County';

-- Add more counties as needed...

-- Step 4: Insert wards for hotspot counties only
-- Nairobi County - Westlands
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kitisuru'), ('Parklands/Highridge'), ('Karura'), ('Kangemi'), ('Mountain View')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Westlands' AND co.name = 'Nairobi County';

-- Nairobi County - Dagoretti North
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kilimani'), ('Kawangware'), ('Gatina'), ('Kileleshwa'), ('Kabiro')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Dagoretti North' AND co.name = 'Nairobi County';

-- Nairobi County - Dagoretti South
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Mutu-Ini'), ('Ngando'), ('Riruta'), ('Uthiru/Ruthimitu'), ('Waithaka')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Dagoretti South' AND co.name = 'Nairobi County';

-- Nairobi County - Lang'ata
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Karen'), ('Nairobi West'), ('Mugumu-Ini'), ('South C'), ('Nyayo Highrise')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Lang''ata' AND co.name = 'Nairobi County';

-- Nairobi County - Kibra
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Woodley/Kenyatta Golf Course'), ('Sarang''ombe'), ('Makina'), ('Lindi'), ('Laini Saba')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Kibra' AND co.name = 'Nairobi County';

-- Nairobi County - Roysambu
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kahawa West'), ('Roysambu'), ('Githurai'), ('Kahawa'), ('Zimmerman')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Roysambu' AND co.name = 'Nairobi County';

-- Nairobi County - Kasarani
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kasarani'), ('Njiru'), ('Clay City'), ('Mwiki'), ('Ruai')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Kasarani' AND co.name = 'Nairobi County';

-- Nairobi County - Ruaraka
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Utalii'), ('Korogocho'), ('Lucky Summer'), ('Mathare North'), ('Baba Dogo')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Ruaraka' AND co.name = 'Nairobi County';

-- Nairobi County - Embakasi South
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kwa Njenga'), ('Imara Daima'), ('Kware'), ('Kwa Reuben'), ('Pipeline')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Embakasi South' AND co.name = 'Nairobi County';

-- Nairobi County - Embakasi North
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Dandora Area I'), ('Dandora Area II'), ('Dandora Area III'), ('Dandora Area IV'), ('Kariobangi North')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Embakasi North' AND co.name = 'Nairobi County';

-- Nairobi County - Embakasi Central
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kayole North'), ('Kayole Central'), ('Kariobangi South'), ('Komarock'), ('Matopeni / Spring Valley')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Embakasi Central' AND co.name = 'Nairobi County';

-- Nairobi County - Embakasi East
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Utawala'), ('Upper Savanna'), ('Lower Savanna'), ('Embakasi'), ('Mihango')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Embakasi East' AND co.name = 'Nairobi County';

-- Nairobi County - Embakasi West
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Umoja 1'), ('Umoja 2'), ('Mowlem'), ('Kariobangi South'), ('Maringo/ Hamza')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Embakasi West' AND co.name = 'Nairobi County';

-- Nairobi County - Makadara
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Viwandani'), ('Harambee'), ('Makongeni'), ('Pumwani'), ('Eastleigh North')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Makadara' AND co.name = 'Nairobi County';

-- Nairobi County - Kamukunji
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Eastleigh South'), ('Nairobi Central'), ('Airbase'), ('California'), ('Mgara')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Kamukunji' AND co.name = 'Nairobi County';

-- Nairobi County - Starehe
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Nairobi South'), ('Hospital'), ('Ngara'), ('Pangani'), ('Landimawe'), ('Ziwani / Kariokor')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Starehe' AND co.name = 'Nairobi County';

-- Nairobi County - Mathare
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Mlango Kubwa'), ('Kiamaiko'), ('Ngei'), ('Huruma'), ('Mabatini')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Mathare' AND co.name = 'Nairobi County';

-- Kiambu County - Thika Town
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Township'), ('Kamenu'), ('Hospital'), ('Gatuanyaga'), ('Ngoliba')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Thika Town' AND co.name = 'Kiambu County';

-- Kiambu County - Ruiru
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Gitothua'), ('Biashara'), ('Gatongora'), ('Kahawa Sukari'), ('Kahawa Wendani')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Ruiru' AND co.name = 'Kiambu County';

-- Kajiado County - Kajiado North
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Olkeri'), ('Ongata Rongai'), ('Nkaimurunya'), ('Oloolua'), ('Ngong')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Kajiado North' AND co.name = 'Kajiado County';

-- Machakos County - Machakos Town
INSERT INTO wards (name, constituency_id) 
SELECT w.name, c.id 
FROM (VALUES 
  ('Kalama'), ('Mua'), ('Mutitini'), ('Machakos Central'), ('Mumbuni North')
) AS w(name)
CROSS JOIN constituencies c 
CROSS JOIN counties co 
WHERE c.name = 'Machakos Town' AND co.name = 'Machakos County';

-- Step 5: Set up delivery costs (these will be managed by admins)
INSERT INTO delivery_base_cost (base_cost, is_active) VALUES (200.00, true);

-- Set up some basic county-to-county costs (admins can modify these later)
INSERT INTO delivery_county_costs (from_county_id, to_county_id, cost, is_active)
SELECT 
  c1.id as from_county_id,
  c2.id as to_county_id,
  CASE 
    WHEN c1.name = c2.name THEN 0.00
    WHEN c1.is_hotspot = true AND c2.is_hotspot = true THEN 50.00
    WHEN c1.is_hotspot = true OR c2.is_hotspot = true THEN 100.00
    ELSE 150.00
  END as cost,
  true as is_active
FROM counties c1
CROSS JOIN counties c2
WHERE c1.id != c2.id;

-- Step 6: Verify the data
SELECT 'Counties' as table_name, COUNT(*) as count FROM counties
UNION ALL
SELECT 'Constituencies', COUNT(*) FROM constituencies
UNION ALL
SELECT 'Wards', COUNT(*) FROM wards
UNION ALL
SELECT 'County Costs', COUNT(*) FROM delivery_county_costs;
