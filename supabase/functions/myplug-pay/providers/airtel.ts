// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, MyPlugPayResponse } from "../types.ts";
import { generateMyPlugTransactionId, hmacSha256Hex } from "../utils.ts";

const AIRTEL_BASE_URL = Deno.env.get('AIRTEL_BASE_URL') ?? 'https://openapi.airtel.africa';
const AIRTEL_CLIENT_ID = Deno.env.get('AIRTEL_CLIENT_ID') ?? '';
const AIRTEL_CLIENT_SECRET = Deno.env.get('AIRTEL_CLIENT_SECRET') ?? '';

export async function initiateAirtelPayment(payload: InitiateRequestBody): Promise<MyPlugPayResponse> {
  const myplugId = generateMyPlugTransactionId();
  const metadata = { has_keys: Boolean(AIRTEL_CLIENT_ID && AIRTEL_CLIENT_SECRET) };
  return { transaction_id: myplugId, provider: 'Airtel', status: 'pending', amount: payload.amount, currency: payload.currency, metadata };
}

export async function verifyAirtelPayment(req: Request, body: any) {
  const secret = Deno.env.get('AIRTEL_WEBHOOK_SECRET') ?? '';
  if (secret) {
    const signature = req.headers.get('x-myplug-signature') ?? '';
    const payloadStr = JSON.stringify(body);
    const expected = await hmacSha256Hex(secret, payloadStr);
    if (expected !== signature) return null;
  }
  const status = mapAirtelStatus(body?.status);
  return { status, reference_id: body?.reference_id ?? body?.transaction?.id, transaction_id: body?.transaction_id ?? body?.transaction?.id };
}

function mapAirtelStatus(external: string | undefined): 'success' | 'failed' | 'pending' {
  const s = (external || '').toLowerCase();
  if (s === 'success' || s === 'completed') return 'success';
  if (s === 'failed' || s === 'rejected') return 'failed';
  return 'pending';
}


