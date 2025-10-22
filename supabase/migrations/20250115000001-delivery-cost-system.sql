-- Delivery Cost System Migration
-- This creates the necessary tables for the delivery cost calculation system

-- Create counties table
CREATE TABLE IF NOT EXISTS counties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_hotspot BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create constituencies table
CREATE TABLE IF NOT EXISTS constituencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  county_id UUID REFERENCES counties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, county_id)
);

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, constituency_id)
);

-- Create delivery base cost table
CREATE TABLE IF NOT EXISTS delivery_base_cost (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_cost DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery county costs table
CREATE TABLE IF NOT EXISTS delivery_county_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_county_id UUID REFERENCES counties(id) ON DELETE CASCADE,
  to_county_id UUID REFERENCES counties(id) ON DELETE CASCADE,
  cost DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_county_id, to_county_id)
);

-- Create delivery constituency costs table
CREATE TABLE IF NOT EXISTS delivery_constituency_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
  to_constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
  cost DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_constituency_id, to_constituency_id)
);

-- Create delivery ward costs table
CREATE TABLE IF NOT EXISTS delivery_ward_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  to_ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  cost DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_ward_id, to_ward_id)
);

-- Insert base cost
INSERT INTO delivery_base_cost (base_cost, is_active) VALUES (200.00, TRUE);

-- Insert counties data
INSERT INTO counties (name, is_hotspot) VALUES
  ('Baringo County', FALSE),
  ('Bomet County', FALSE),
  ('Bungoma County', FALSE),
  ('Busia County', FALSE),
  ('Elgeyo-Marakwet County', FALSE),
  ('Embu County', FALSE),
  ('Garissa County', FALSE),
  ('Homa Bay County', FALSE),
  ('Isiolo County', FALSE),
  ('Kajiado County', TRUE),
  ('Kakamega County', FALSE),
  ('Kericho County', FALSE),
  ('Kiambu County', TRUE),
  ('Kilifi County', FALSE),
  ('Kirinyaga County', FALSE),
  ('Kisii County', FALSE),
  ('Kisumu County', FALSE),
  ('Kitui County', FALSE),
  ('Kwale County', FALSE),
  ('Laikipia County', FALSE),
  ('Lamu County', FALSE),
  ('Machakos County', TRUE),
  ('Makueni County', FALSE),
  ('Mandera County', FALSE),
  ('Marsabit County', FALSE),
  ('Meru County', FALSE),
  ('Migori County', FALSE),
  ('Mombasa County', FALSE),
  ('Murang''a County', FALSE),
  ('Nairobi County', TRUE),
  ('Nakuru County', FALSE),
  ('Nandi County', FALSE),
  ('Narok County', FALSE),
  ('Nyamira County', FALSE),
  ('Nyandarua County', FALSE),
  ('Nyeri County', FALSE),
  ('Samburu County', FALSE),
  ('Siaya County', FALSE),
  ('Taita-Taveta County', FALSE),
  ('Tana River County', FALSE),
  ('Tharaka-Nithi County', FALSE),
  ('Trans Nzoia County', FALSE),
  ('Turkana County', FALSE),
  ('Uasin Gishu County', FALSE),
  ('Vihiga County', FALSE),
  ('Wajir County', FALSE),
  ('West Pokot County', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Insert constituencies for Nairobi County
INSERT INTO constituencies (name, county_id) 
SELECT constituency_name, c.id 
FROM counties c,
(VALUES 
  ('Westlands'), ('Dagoretti North'), ('Dagoretti South'), ('Langata'), ('Kibra'), 
  ('Roysambu'), ('Kasarani'), ('Ruaraka'), ('Embakasi South'), ('Embakasi North'), 
  ('Embakasi Central'), ('Embakasi East'), ('Embakasi West'), ('Makadara'), 
  ('Kamukunji'), ('Starehe'), ('Mathare')
) AS constituencies(constituency_name)
WHERE c.name = 'Nairobi County'
ON CONFLICT (name, county_id) DO NOTHING;

-- Insert constituencies for Kiambu County
INSERT INTO constituencies (name, county_id) 
SELECT constituency_name, c.id 
FROM counties c,
(VALUES 
  ('Gatundu South'), ('Gatundu North'), ('Juja'), ('Thika Town'), ('Ruiru'), 
  ('Githunguri'), ('Kiambu'), ('Kiambaa'), ('Kabete'), ('Kikuyu'), ('Limuru'), ('Lari')
) AS constituencies(constituency_name)
WHERE c.name = 'Kiambu County'
ON CONFLICT (name, county_id) DO NOTHING;

-- Insert constituencies for Kajiado County
INSERT INTO constituencies (name, county_id) 
SELECT constituency_name, c.id 
FROM counties c,
(VALUES 
  ('Kajiado North'), ('Kajiado Central'), ('Kajiado East'), ('Kajiado West'), ('Kajiado South')
) AS constituencies(constituency_name)
WHERE c.name = 'Kajiado County'
ON CONFLICT (name, county_id) DO NOTHING;

-- Insert constituencies for Machakos County
INSERT INTO constituencies (name, county_id) 
SELECT constituency_name, c.id 
FROM counties c,
(VALUES 
  ('Machakos Town'), ('Mavoko'), ('Masinga'), ('Yatta'), ('Kangundo'), 
  ('Matungulu'), ('Kathiani'), ('Mwala')
) AS constituencies(constituency_name)
WHERE c.name = 'Machakos County'
ON CONFLICT (name, county_id) DO NOTHING;

-- Insert wards for Nairobi County constituencies
-- Westlands wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kitisuru'), ('Parklands/Highridge'), ('Karura'), ('Kangemi'), ('Mountain View')
) AS wards(ward_name)
WHERE con.name = 'Westlands' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Dagoretti North wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kilimani'), ('Kawangware'), ('Gatina'), ('Kileleshwa'), ('Kabiro')
) AS wards(ward_name)
WHERE con.name = 'Dagoretti North' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Dagoretti South wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Mutu-Ini'), ('Ngando'), ('Riruta'), ('Uthiru/Ruthimitu'), ('Waithaka')
) AS wards(ward_name)
WHERE con.name = 'Dagoretti South' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Langata wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Karen'), ('Nairobi West'), ('Mugumu-Ini'), ('South C'), ('Nyayo Highrise')
) AS wards(ward_name)
WHERE con.name = 'Langata' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Kibra wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Woodley/Kenyatta Golf Course'), ('Sarang''ombe'), ('Makina'), ('Lindi'), ('Laini Saba')
) AS wards(ward_name)
WHERE con.name = 'Kibra' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Roysambu wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kahawa West'), ('Roysambu'), ('Githurai'), ('Kahawa'), ('Zimmerman')
) AS wards(ward_name)
WHERE con.name = 'Roysambu' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Kasarani wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kasarani'), ('Njiru'), ('Clay City'), ('Mwiki'), ('Ruai')
) AS wards(ward_name)
WHERE con.name = 'Kasarani' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Ruaraka wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Utalii'), ('Korogocho'), ('Lucky Summer'), ('Mathare North'), ('Baba Dogo')
) AS wards(ward_name)
WHERE con.name = 'Ruaraka' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Embakasi South wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kwa Njenga'), ('Imara Daima'), ('Kware'), ('Kwa Reuben'), ('Pipeline')
) AS wards(ward_name)
WHERE con.name = 'Embakasi South' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Embakasi North wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Dandora Area I'), ('Dandora Area II'), ('Dandora Area III'), ('Dandora Area IV'), ('Kariobangi North')
) AS wards(ward_name)
WHERE con.name = 'Embakasi North' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Embakasi Central wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Kayole North'), ('Kayole Central'), ('Kariobangi South'), ('Komarock'), ('Matopeni / Spring Valley')
) AS wards(ward_name)
WHERE con.name = 'Embakasi Central' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Embakasi East wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Utawala'), ('Upper Savanna'), ('Lower Savanna'), ('Embakasi'), ('Mihango')
) AS wards(ward_name)
WHERE con.name = 'Embakasi East' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Embakasi West wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Umoja 1'), ('Umoja 2'), ('Mowlem'), ('Kariobangi south'), ('Maringo/ Hamza')
) AS wards(ward_name)
WHERE con.name = 'Embakasi West' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Makadara wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Viwandani'), ('Harambee'), ('Makongeni'), ('Pumwani'), ('Eastleigh North')
) AS wards(ward_name)
WHERE con.name = 'Makadara' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Kamukunji wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Eastleigh South'), ('Nairobi Central'), ('Airbase'), ('California'), ('Mgara')
) AS wards(ward_name)
WHERE con.name = 'Kamukunji' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Starehe wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Nairobi South'), ('Hospital'), ('Ngara'), ('Pangani'), ('Landimawe'), ('Ziwani / Kariokor')
) AS wards(ward_name)
WHERE con.name = 'Starehe' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Mathare wards
INSERT INTO wards (name, constituency_id) 
SELECT ward_name, con.id 
FROM constituencies con,
(VALUES 
  ('Mlango Kubwa'), ('Kiamaiko'), ('Ngei'), ('Huruma'), ('Mabatini')
) AS wards(ward_name)
WHERE con.name = 'Mathare' AND con.county_id = (SELECT id FROM counties WHERE name = 'Nairobi County')
ON CONFLICT (name, constituency_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_counties_name ON counties(name);
CREATE INDEX IF NOT EXISTS idx_constituencies_county_id ON constituencies(county_id);
CREATE INDEX IF NOT EXISTS idx_constituencies_name ON constituencies(name);
CREATE INDEX IF NOT EXISTS idx_wards_constituency_id ON wards(constituency_id);
CREATE INDEX IF NOT EXISTS idx_wards_name ON wards(name);
CREATE INDEX IF NOT EXISTS idx_delivery_county_costs_from_to ON delivery_county_costs(from_county_id, to_county_id);
CREATE INDEX IF NOT EXISTS idx_delivery_constituency_costs_from_to ON delivery_constituency_costs(from_constituency_id, to_constituency_id);
CREATE INDEX IF NOT EXISTS idx_delivery_ward_costs_from_to ON delivery_ward_costs(from_ward_id, to_ward_id);

-- Create function to calculate delivery cost
CREATE OR REPLACE FUNCTION calculate_delivery_cost(
  from_county_name TEXT,
  to_county_name TEXT,
  from_constituency_name TEXT DEFAULT NULL,
  from_ward_name TEXT DEFAULT NULL,
  to_constituency_name TEXT DEFAULT NULL,
  to_ward_name TEXT DEFAULT NULL
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  base_cost DECIMAL(10,2);
  county_cost DECIMAL(10,2) := 0;
  constituency_cost DECIMAL(10,2) := 0;
  ward_cost DECIMAL(10,2) := 0;
  from_county_id UUID;
  to_county_id UUID;
  from_constituency_id UUID;
  to_constituency_id UUID;
  from_ward_id UUID;
  to_ward_id UUID;
BEGIN
  -- Get base cost
  SELECT base_cost INTO base_cost 
  FROM delivery_base_cost 
  WHERE is_active = TRUE 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF base_cost IS NULL THEN
    base_cost := 200.00;
  END IF;
  
  -- Get county IDs
  SELECT id INTO from_county_id FROM counties WHERE name = from_county_name;
  SELECT id INTO to_county_id FROM counties WHERE name = to_county_name;
  
  -- Calculate county cost if different counties
  IF from_county_id IS NOT NULL AND to_county_id IS NOT NULL AND from_county_id != to_county_id THEN
    SELECT cost INTO county_cost 
    FROM delivery_county_costs 
    WHERE from_county_id = calculate_delivery_cost.from_county_id 
      AND to_county_id = calculate_delivery_cost.to_county_id 
      AND is_active = TRUE;
    
    IF county_cost IS NULL THEN
      county_cost := 100.00; -- Default county cost
    END IF;
  END IF;
  
  -- Calculate constituency cost if same county but different constituencies
  IF from_constituency_name IS NOT NULL AND to_constituency_name IS NOT NULL 
     AND from_county_name = to_county_name THEN
    
    SELECT id INTO from_constituency_id 
    FROM constituencies 
    WHERE name = from_constituency_name AND county_id = from_county_id;
    
    SELECT id INTO to_constituency_id 
    FROM constituencies 
    WHERE name = to_constituency_name AND county_id = to_county_id;
    
    IF from_constituency_id IS NOT NULL AND to_constituency_id IS NOT NULL 
       AND from_constituency_id != to_constituency_id THEN
      
      SELECT cost INTO constituency_cost 
      FROM delivery_constituency_costs 
      WHERE from_constituency_id = calculate_delivery_cost.from_constituency_id 
        AND to_constituency_id = calculate_delivery_cost.to_constituency_id 
        AND is_active = TRUE;
      
      IF constituency_cost IS NULL THEN
        constituency_cost := 50.00; -- Default constituency cost
      END IF;
    END IF;
  END IF;
  
  -- Calculate ward cost if same constituency but different wards
  IF from_ward_name IS NOT NULL AND to_ward_name IS NOT NULL 
     AND from_constituency_name = to_constituency_name THEN
    
    SELECT id INTO from_ward_id 
    FROM wards 
    WHERE name = from_ward_name AND constituency_id = from_constituency_id;
    
    SELECT id INTO to_ward_id 
    FROM wards 
    WHERE name = to_ward_name AND constituency_id = to_constituency_id;
    
    IF from_ward_id IS NOT NULL AND to_ward_id IS NOT NULL 
       AND from_ward_id != to_ward_id THEN
      
      SELECT cost INTO ward_cost 
      FROM delivery_ward_costs 
      WHERE from_ward_id = calculate_delivery_cost.from_ward_id 
        AND to_ward_id = calculate_delivery_cost.to_ward_id 
        AND is_active = TRUE;
      
      IF ward_cost IS NULL THEN
        ward_cost := 25.00; -- Default ward cost
      END IF;
    END IF;
  END IF;
  
  RETURN base_cost + county_cost + constituency_cost + ward_cost;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON counties TO anon, authenticated;
GRANT SELECT ON constituencies TO anon, authenticated;
GRANT SELECT ON wards TO anon, authenticated;
GRANT SELECT ON delivery_base_cost TO anon, authenticated;
GRANT SELECT ON delivery_county_costs TO anon, authenticated;
GRANT SELECT ON delivery_constituency_costs TO anon, authenticated;
GRANT SELECT ON delivery_ward_costs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_delivery_cost TO anon, authenticated;
