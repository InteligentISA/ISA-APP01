// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { routeRequest } from "./utils.ts";
import { initiateDPOPayment, verifyDPOPayment } from "./providers/dpo.ts";
import { initiateCardPayment, verifyCardPayment } from "./providers/dpo.ts";
import { initiateMpesaPayment, verifyMpesaPayment } from "./providers/mpesa.ts";
import { initiateAirtelPayment, verifyAirtelPayment } from "./providers/airtel.ts";
import { initiatePaypalPayment, verifyPaypalPayment } from "./providers/paypal.ts";
import type { InitiateRequestBody, ProviderName, MyPlugPayResponse } from "./types.ts";
import { rateLimit } from "./middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function handleInitiate(req: Request): Promise<Response> {
  const payload = (await req.json()) as InitiateRequestBody;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
  if (!(rl as any).allowed) return new Response('Too Many Requests', { status: 429 });

  if (!payload || !payload.user_id || !payload.amount || !payload.currency || !payload.method) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  // All payments now go through DPO
  const provider: ProviderName = 'DPO';
  let result: MyPlugPayResponse;
  
  // Use DPO for all payment methods
  result = await initiateDPOPayment(payload);

  const { error } = await supabase.from('transactions').insert({
    id: result.transaction_id,
    user_id: payload.user_id,
    amount: payload.amount,
    currency: payload.currency,
    provider: result.provider,
    status: result.status,
    reference_id: result.reference_id ?? null,
    redirect_url: result.redirect_url ?? null,
    metadata: result.metadata ?? null
  } as any);
  if (error) return Response.json({ error: 'Failed to record transaction' }, { status: 500 });
  return Response.json(result);
}

async function handleStatus(_req: Request, transactionId: string): Promise<Response> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', transactionId).maybeSingle();
  if (error) return Response.json({ error: 'Lookup failed' }, { status: 500 });
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({
    transaction_id: data.id,
    provider: data.provider,
    status: data.status,
    amount: Number(data.amount),
    currency: data.currency,
    redirect_url: data.redirect_url ?? undefined
  });
}

async function handleWebhook(req: Request): Promise<Response> {
  const providerHeader = req.headers.get('x-dpo-provider') || req.headers.get('x-myplug-provider');
  const provider = (providerHeader as ProviderName) || 'DPO';
  const body = await req.json();
  let verified: { status: 'success' | 'failed' | 'pending'; reference_id?: string; transaction_id?: string } | null = null;
  
  // All payments now go through DPO
  verified = await verifyDPOPayment(req, body);
  
  if (!verified) return Response.json({ error: 'Invalid signature' }, { status: 401 });
  const txId = verified.transaction_id ?? body.transaction_id;
  if (!txId) return Response.json({ error: 'Missing transaction id' }, { status: 400 });
  const { error } = await supabase.from('transactions').update({ status: verified.status, reference_id: verified.reference_id ?? null }).eq('id', txId);
  if (error) return Response.json({ error: 'Update failed' }, { status: 500 });
  return Response.json({ ok: true });
}

serve(async (req: Request) => {
  const routed = routeRequest(req.url, req.method);
  if (!routed) return new Response('Not Found', { status: 404 });
  if (routed.name === 'initiate' && req.method === 'POST') return handleInitiate(req);
  if (routed.name === 'status' && req.method === 'GET') return handleStatus(req, routed.params.transaction_id);
  if (routed.name === 'webhook' && req.method === 'POST') return handleWebhook(req);
  return new Response('Method Not Allowed', { status: 405 });
});


