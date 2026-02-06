import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_KEY = Deno.env.get('VITE_OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { age, gender, relationship, occasion, hobbies, budgetMin, budgetMax } = await req.json();

    if (!age || !hobbies || !budgetMin || !budgetMax) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('VITE_OPENAI_API_KEY not configured');
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Use GPT to generate gift suggestions with structured product queries
    const prompt = `You are MyPlug, a gift recommendation specialist for an e-commerce store in Kenya.

RECIPIENT:
- Age: ${age}, Gender: ${gender || 'any'}
- Relationship: ${relationship || 'Not specified'}
- Occasion: ${occasion || 'General gift'}
- Interests: ${hobbies}
- Budget: KES ${budgetMin} - ${budgetMax}

AVAILABLE CATEGORIES:
Electronics, Fashion, Swimwear, Home & Garden, Sports & Outdoors, Books & Media, Toys & Games, Health & Wellness, Baby & Kids, Pet Supplies, Beauty & Personal Care, Alcoholic Beverages, Tools & Home Improvement, Travel & Luggage, Groceries, Office & Industrial, Automotive

YOUR TASK: Suggest 5-8 gift ideas. For EACH gift, output a product query in this exact format:

GIFT_QUERY_START{"main_category":"exact category","sub_category":"exact subcategory","keywords":"search terms","reason":"why this is perfect (1 sentence)"}GIFT_QUERY_END

Be specific and match gifts to the recipient's interests and occasion. Keep reasons concise.`;

    console.log('Calling OpenAI API for gift suggestions...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are MyPlug, a gift recommendation specialist. Be concise and action-oriented.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      if (openaiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service is temporarily busy. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const suggestions = openaiData.choices?.[0]?.message?.content?.trim() || 'Unable to generate suggestions';

    console.log('Gift suggestions received, querying products...');

    // Parse gift queries and search for products
    const giftMatches = [...suggestions.matchAll(/GIFT_QUERY_START(\{[\s\S]*?\})GIFT_QUERY_END/g)];
    const allProducts: any[] = [];
    const giftReasons: string[] = [];

    for (const match of giftMatches) {
      try {
        const giftQuery = JSON.parse(match[1]);
        giftReasons.push(giftQuery.reason || '');

        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'approved')
          .gte('price', budgetMin)
          .lte('price', budgetMax);

        if (giftQuery.main_category) {
          query = query.eq('main_category', giftQuery.main_category);
        }
        if (giftQuery.sub_category) {
          query = query.eq('subcategory', giftQuery.sub_category);
        }

        query = query.limit(3);

        const { data: products } = await query;
        
        if (products && products.length > 0) {
          allProducts.push(...products);
        } else if (giftQuery.keywords) {
          // Fallback: text search with keywords
          const { data: searchProducts } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .eq('status', 'approved')
            .gte('price', budgetMin)
            .lte('price', budgetMax)
            .or(`name.ilike.%${giftQuery.keywords}%,description.ilike.%${giftQuery.keywords}%`)
            .limit(3);
          
          if (searchProducts) {
            allProducts.push(...searchProducts);
          }
        }
      } catch (e) {
        console.error('Error parsing gift query:', e);
      }
    }

    // Deduplicate products by id
    const uniqueProducts = allProducts.filter((product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
    );

    console.log(`Found ${uniqueProducts.length} unique gift products`);

    // Clean response text (remove query markers)
    const cleanSuggestions = suggestions
      .replace(/GIFT_QUERY_START\{[\s\S]*?\}GIFT_QUERY_END/g, '')
      .trim();

    return new Response(
      JSON.stringify({
        suggestions: cleanSuggestions,
        products: uniqueProducts,
        giftReasons,
        recipientAge: age,
        occasion: occasion || 'General gift',
        budget: `KES ${Number(budgetMin).toLocaleString()} - ${Number(budgetMax).toLocaleString()}`
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
