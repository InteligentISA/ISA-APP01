import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { age, gender, relationship, occasion, hobbies, budgetMin, budgetMax } = await req.json();

    if (!age || !gender || !hobbies || !budgetMin || !budgetMax) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build gift finder prompt
    const prompt = `You are MyPlug, a gift recommendation specialist for an online e-commerce store in Kenya.

RECIPIENT PROFILE:
- Age: ${age}
- Gender: ${gender}
- Relationship: ${relationship || 'Not specified'}
- Occasion: ${occasion || 'General gift'}
- Hobbies & Interests: ${hobbies}
- Budget: KES ${budgetMin} - ${budgetMax}

YOUR TASK: Suggest 5-8 specific gift products that would be perfect for this recipient.

RESPONSE FORMAT: For each gift, provide:
1. Exact category path: main_category > sub_category > sub_sub_category
2. Why it's perfect (2-3 sentences relating to their interests/occasion)
3. Estimated price within budget

AVAILABLE CATEGORIES: 
- Electronics > Mobile Phones & Tablets > (Smartphones, Tablets, Phone Accessories)
- Electronics > Computers & Laptops > (Laptops, Computer Accessories)
- Electronics > Audio & Video > (Headphones, Speakers, TVs & Monitors)
- Electronics > Gaming > (Gaming Consoles, Gaming Accessories)
- Fashion > Men's Clothing, Women's Clothing, Shoes, Accessories
- Swimwear > Women's Swimwear, Men's Swimwear, Kids' Swimwear, Accessories
- Home & Garden > Furniture, Decor, Kitchen, Garden
- Sports & Outdoors > Fitness, Team Sports, Outdoor Activities, Water Sports
- Books & Media > Books, Music, Movies & TV, Gaming
- Toys & Games > Educational Toys, Action Figures, Dolls, Building Sets, Arts & Crafts
- Health & Wellness > Vitamins & Supplements, Medical Devices, Fitness Equipment
- Beauty & Personal Care > Skincare, Makeup, Hair Care, Fragrances
- Pet Supplies > Dogs, Cats, Other Pets, Pet Accessories
- Alcoholic Beverages > Beer, Wine, Spirits, Gift Sets & Accessories

Format each suggestion as:
**Gift [number]: [Product Type]**
Category: [main] > [sub] > [sub_sub]
Price Range: KES [estimate]
Why: [explanation]

Be specific, thoughtful, and match gifts to interests and occasion.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const suggestions = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate suggestions';

    // Parse suggested categories and search for actual products
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const categoryMatches = suggestions.matchAll(/Category:\s*([^>]+)>\s*([^>]+)>\s*([^\n]+)/gi);
    const allProducts = [];

    for (const match of categoryMatches) {
      const [_, mainCat, subCat, subSubCat] = match;

      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('banned', false)
          .gte('price', budgetMin)
          .lte('price', budgetMax);

        if (mainCat) query = query.eq('main_category', mainCat.trim());
        if (subCat) query = query.eq('subcategory', subCat.trim());
        if (subSubCat) query = query.eq('sub_subcategory', subSubCat.trim());

        query = query.limit(2);

        const { data: products } = await query;
        if (products) {
          allProducts.push(...products);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }

    return new Response(
      JSON.stringify({
        suggestions,
        products: allProducts,
        recipientAge: age,
        occasion: occasion || 'General gift',
        budget: `KES ${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in gift-finder function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
