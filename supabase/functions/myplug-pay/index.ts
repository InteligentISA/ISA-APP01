// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { routeRequest } from "./utils.ts";
import { initiateCardPayment, verifyCardPayment } from "./providers/pesapal.ts";
import type { InitiateRequestBody, MyPlugPayResponse } from "./types.ts";
import { rateLimit } from "./middleware.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = globalThis.Deno?.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = globalThis.Deno?.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function handleInitiate(req: Request): Promise<Response> {
  const payload = (await req.json()) as InitiateRequestBody;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
  if (!(rl as any).allowed) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), { 
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!payload || !payload.user_id || !payload.amount || !payload.currency) {
    return Response.json({ error: "Invalid request - missing required fields" }, { 
      status: 400,
      headers: corsHeaders
    });
  }

  try {
    // Use PesaPal for all payments
    const result: MyPlugPayResponse = await initiateCardPayment(payload);

    // Store transaction in database
    const { error } = await supabase.from('transactions').insert({
      id: result.transaction_id,
      user_id: payload.user_id,
      amount: payload.amount,
      currency: payload.currency,
      provider: 'PesaPal',
      status: result.status,
      reference_id: result.reference_id ?? null,
      redirect_url: result.redirect_url ?? null,
      metadata: result.metadata ?? null,
      order_id: payload.order_id ?? null
    } as any);

    if (error) {
      console.error('Failed to record transaction:', error);
      return Response.json({ error: 'Failed to record transaction' }, { 
        status: 500,
        headers: corsHeaders
      });
    }

    return Response.json({
      transaction_id: result.transaction_id,
      status: result.status,
      iframe_url: result.redirect_url,
      order_tracking_id: result.reference_id
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return Response.json({ 
      error: error?.message || 'Payment initiation failed' 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleStatus(_req: Request, transactionId: string): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (error) {
      console.error('Transaction lookup error:', error);
      return Response.json({ error: 'Lookup failed' }, { 
        status: 500,
        headers: corsHeaders
      });
    }

    if (!data) {
      return Response.json({ error: 'Transaction not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    return Response.json({
      transaction_id: data.id,
      provider: data.provider,
      status: data.status,
      amount: Number(data.amount),
      currency: data.currency,
      iframe_url: data.redirect_url ?? undefined
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return Response.json({ error: 'Status check failed' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleWebhook(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    console.log('Webhook received:', body);

    // Verify webhook using PesaPal verification
    const verified = await verifyCardPayment(req, body);
    
    if (!verified) {
      console.error('Webhook verification failed');
      return Response.json({ error: 'Invalid signature or verification failed' }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    const txId = verified.transaction_id ?? body.order_merchant_reference ?? body.id;
    if (!txId) {
      console.error('Missing transaction ID in webhook');
      return Response.json({ error: 'Missing transaction id' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: verified.status,
        reference_id: verified.reference_id ?? null,
        updated_at: new Date().toISOString()
      })
      .eq('id', txId);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      return Response.json({ error: 'Update failed' }, { 
        status: 500,
        headers: corsHeaders
      });
    }

    // If payment successful, update related order if order_id exists
    if (verified.status === 'success') {
      const { data: transaction } = await supabase
        .from('transactions')
        .select('order_id')
        .eq('id', txId)
        .maybeSingle();

      if (transaction?.order_id) {
        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.order_id);
      }
    }

    console.log(`Transaction ${txId} updated to status: ${verified.status}`);
    return Response.json({ ok: true, status: verified.status }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const routed = routeRequest(req.url, req.method);
    
    if (!routed) {
      return new Response(JSON.stringify({ error: 'Not Found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (routed.name === 'initiate' && req.method === 'POST') {
      return handleInitiate(req);
    }
    
    if (routed.name === 'status' && req.method === 'GET') {
      return handleStatus(req, routed.params.transaction_id);
    }
    
    if (routed.name === 'webhook' && req.method === 'POST') {
      return handleWebhook(req);
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Request handling error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
