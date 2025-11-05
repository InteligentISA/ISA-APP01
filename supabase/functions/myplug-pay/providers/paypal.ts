// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, MyPlugPayResponse } from "../types.ts";
import { generateMyPlugTransactionId } from "../utils.ts";

const PAYPAL_BASE_URL = globalThis.Deno?.env.get('PAYPAL_BASE_URL') ?? 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = globalThis.Deno?.env.get('PAYPAL_CLIENT_ID') ?? '';
const PAYPAL_CLIENT_SECRET = globalThis.Deno?.env.get('PAYPAL_CLIENT_SECRET') ?? '';
const PAYPAL_WEBHOOK_ID = globalThis.Deno?.env.get('PAYPAL_WEBHOOK_ID') ?? '';

async function getPaypalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, { method: 'POST', headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  if (!res.ok) throw new Error('Paypal token error');
  const data = await res.json();
  return data.access_token as string;
}

export async function initiatePaypalPayment(payload: InitiateRequestBody): Promise<MyPlugPayResponse> {
  const myplugId = generateMyPlugTransactionId();
  const accessToken = await getPaypalAccessToken();
  const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: payload.order_id ?? myplugId, amount: { currency_code: payload.currency, value: payload.amount.toFixed(2) } }], application_context: { brand_name: 'MyPlug Pay', user_action: 'PAY_NOW', return_url: payload.callback_url ?? 'https://example.com/paypal/return', cancel_url: payload.callback_url ?? 'https://example.com/paypal/cancel' } }) });
  if (!orderRes.ok) throw new Error('Paypal order error');
  const order = await orderRes.json();
  const approve = (order.links || []).find((l: any) => l.rel === 'approve');
  return { transaction_id: myplugId, provider: 'PayPal', status: 'pending', amount: payload.amount, currency: payload.currency, redirect_url: approve?.href, reference_id: order.id, metadata: { order_id: order.id } };
}

export async function verifyPaypalPayment(req: Request, body: any) {
  const accessToken = await getPaypalAccessToken();
  const transmissionId = req.headers.get('paypal-transmission-id') ?? '';
  const transmissionTime = req.headers.get('paypal-transmission-time') ?? '';
  const certUrl = req.headers.get('paypal-cert-url') ?? '';
  const authAlgo = req.headers.get('paypal-auth-algo') ?? '';
  const transmissionSig = req.headers.get('paypal-transmission-sig') ?? '';
  const verifyRes = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ auth_algo: authAlgo, cert_url: certUrl, transmission_id: transmissionId, transmission_sig: transmissionSig, transmission_time: transmissionTime, webhook_id: PAYPAL_WEBHOOK_ID, webhook_event: body }) });
  if (!verifyRes.ok) return null;
  const verify = await verifyRes.json();
  if (verify.verification_status !== 'SUCCESS') return null;
  const eventType = body?.event_type || '';
  const resource = body?.resource || {};
  const orderId = resource?.id || resource?.supplementary_data?.related_ids?.order_id;
  const status = mapPaypalEventToStatus(eventType, resource?.status);
  return { status, reference_id: orderId, transaction_id: body?.transaction_id ?? resource?.custom_id };
}

function mapPaypalEventToStatus(eventType: string, resourceStatus: string | undefined): 'success' | 'failed' | 'pending' {
  const e = eventType.toLowerCase();
  if (e.includes('payment.capture.completed') || resourceStatus === 'COMPLETED') return 'success';
  if (e.includes('payment.capture.denied') || e.includes('order.cancelled') || resourceStatus === 'VOIDED') return 'failed';
  return 'pending';
}


