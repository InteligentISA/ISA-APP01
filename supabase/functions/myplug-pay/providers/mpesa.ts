// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, MyPlugPayResponse } from "../types.ts";
import { generateMyPlugTransactionId, hmacSha256Hex } from "../utils.ts";

const MPESA_BASE_URL = globalThis.Deno?.env.get('MPESA_BASE_URL') ?? 'https://sandbox.safaricom.co.ke';
const MPESA_CONSUMER_KEY = globalThis.Deno?.env.get('MPESA_CONSUMER_KEY') ?? '';
const MPESA_CONSUMER_SECRET = globalThis.Deno?.env.get('MPESA_CONSUMER_SECRET') ?? '';
const MPESA_SHORTCODE = globalThis.Deno?.env.get('MPESA_SHORTCODE') ?? '';
const MPESA_PASSKEY = globalThis.Deno?.env.get('MPESA_PASSKEY') ?? '';

export async function initiateMpesaPayment(payload: InitiateRequestBody): Promise<MyPlugPayResponse> {
  const myplugId = generateMyPlugTransactionId();
  const metadata = { shortcode: MPESA_SHORTCODE, has_keys: Boolean(MPESA_CONSUMER_KEY && MPESA_CONSUMER_SECRET && MPESA_PASSKEY) };
  return { transaction_id: myplugId, provider: 'M-Pesa', status: 'pending', amount: payload.amount, currency: payload.currency, metadata };
}

export async function verifyMpesaPayment(req: Request, body: any) {
  const secret = globalThis.Deno?.env.get('MPESA_WEBHOOK_SECRET') ?? '';
  if (secret) {
    const signature = req.headers.get('x-myplug-signature') ?? '';
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


