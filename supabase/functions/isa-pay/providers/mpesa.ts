// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, IsaPayResponse } from "../types.ts";
import { generateIsaTransactionId, hmacSha256Hex } from "../utils.ts";

const MPESA_BASE_URL = Deno.env.get('MPESA_BASE_URL') ?? 'https://sandbox.safaricom.co.ke';
const MPESA_CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY') ?? '';
const MPESA_CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET') ?? '';
const MPESA_SHORTCODE = Deno.env.get('MPESA_SHORTCODE') ?? '';
const MPESA_PASSKEY = Deno.env.get('MPESA_PASSKEY') ?? '';

export async function initiateMpesaPayment(payload: InitiateRequestBody): Promise<IsaPayResponse> {
  const isaId = generateIsaTransactionId();
  const metadata = { shortcode: MPESA_SHORTCODE, has_keys: Boolean(MPESA_CONSUMER_KEY && MPESA_CONSUMER_SECRET && MPESA_PASSKEY) };
  return { transaction_id: isaId, provider: 'M-Pesa', status: 'pending', amount: payload.amount, currency: payload.currency, metadata };
}

export async function verifyMpesaPayment(req: Request, body: any) {
  const secret = Deno.env.get('MPESA_WEBHOOK_SECRET') ?? '';
  if (secret) {
    const signature = req.headers.get('x-isa-signature') ?? '';
    const payloadStr = JSON.stringify(body);
    const expected = await hmacSha256Hex(secret, payloadStr);
    if (expected !== signature) return null;
  }
  const status = mapMpesaStatus(body?.Body?.stkCallback?.ResultCode);
  const reference = body?.Body?.stkCallback?.CheckoutRequestID ?? body?.reference_id;
  const txId = body?.transaction_id ?? body?.Body?.stkCallback?.MerchantRequestID;
  return { status, reference_id: reference, transaction_id: txId };
}

function mapMpesaStatus(code: number | string | undefined): 'success' | 'failed' | 'pending' {
  if (code === 0 || code === '0') return 'success';
  if (code == null) return 'pending';
  return 'failed';
}


