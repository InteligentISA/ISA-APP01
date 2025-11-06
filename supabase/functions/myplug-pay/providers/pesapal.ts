// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, MyPlugPayResponse } from "../types.ts";
import { generateMyPlugTransactionId, hmacSha256Hex } from "../utils.ts";

const PESAPAL_BASE_URL = globalThis.Deno?.env.get('PESAPAL_BASE_URL') ?? 'https://pay.pesapal.com/v3';
const PESAPAL_CONSUMER_KEY = globalThis.Deno?.env.get('PESAPAL_CONSUMER_KEY') ?? '';
const PESAPAL_CONSUMER_SECRET = globalThis.Deno?.env.get('PESAPAL_CONSUMER_SECRET') ?? '';
const PESAPAL_CALLBACK_URL = globalThis.Deno?.env.get('PESAPAL_CALLBACK_URL') ?? '';
const PESAPAL_IPN_URL = globalThis.Deno?.env.get('PESAPAL_IPN_URL') ?? '';

/**
 * Get Pesapal access token for API authentication
 */
async function getPesapalAccessToken(): Promise<string> {
  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    throw new Error('Pesapal credentials not configured');
  }

  const credentials = btoa(`${PESAPAL_CONSUMER_KEY}:${PESAPAL_CONSUMER_SECRET}`);
  
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get Pesapal access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Initiate Pesapal payment
 */
export async function initiateCardPayment(payload: InitiateRequestBody): Promise<MyPlugPayResponse> {
  const myplugId = generateMyPlugTransactionId();
  
  try {
    // Get access token
    const accessToken = await getPesapalAccessToken();
    
    // Prepare order data
    const orderData = {
      id: myplugId,
      currency: payload.currency || 'KES',
      amount: payload.amount,
      description: payload.description || `Payment for order ${payload.order_id || myplugId}`,
      callback_url: PESAPAL_CALLBACK_URL || `${globalThis.Deno?.env.get('SUPABASE_URL')}/functions/v1/myplug-pay/webhook`,
      notification_id: PESAPAL_IPN_URL || `${globalThis.Deno?.env.get('SUPABASE_URL')}/functions/v1/myplug-pay/webhook`,
      billing_address: {
        email_address: payload.user_id, // Using user_id as placeholder, should be actual email
        phone_number: payload.phone_number || '',
        country_code: 'KE',
        first_name: '',
        middle_name: '',
        last_name: '',
        line_1: '',
        line_2: '',
        city: '',
        state: '',
        postal_code: '',
        zip_code: ''
      }
    };

    // Submit order to Pesapal
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Pesapal order submission failed: ${errorData.message || errorData.error || response.statusText || errorText}`);
    }

    const orderResponse = await response.json();
    const redirectUrl = orderResponse.redirect_url || orderResponse.redirectUrl;

    return {
      transaction_id: myplugId,
      provider: 'Pesapal',
      status: 'pending',
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: redirectUrl,
      reference_id: orderResponse.order_tracking_id,
      metadata: { 
        order_tracking_id: orderResponse.order_tracking_id,
        merchant_reference: orderResponse.merchant_reference,
        has_keys: Boolean(PESAPAL_CONSUMER_KEY && PESAPAL_CONSUMER_SECRET)
      }
    };
  } catch (error) {
    console.error('Pesapal payment initiation error:', error);
    // Return pending status even on error, let the webhook handle the actual status
    return {
      transaction_id: myplugId,
      provider: 'Pesapal',
      status: 'pending',
      amount: payload.amount,
      currency: payload.currency,
      metadata: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        has_keys: Boolean(PESAPAL_CONSUMER_KEY && PESAPAL_CONSUMER_SECRET)
      }
    };
  }
}

/**
 * Verify Pesapal payment from webhook
 */
export async function verifyCardPayment(req: Request, body: any) {
  const secret = globalThis.Deno?.env.get('PESAPAL_WEBHOOK_SECRET') ?? '';
  
  // Verify webhook signature if secret is configured
  if (secret) {
    const signature = req.headers.get('x-pesapal-signature') ?? req.headers.get('x-myplug-signature') ?? '';
    const payloadStr = JSON.stringify(body);
    const expected = await hmacSha256Hex(secret, payloadStr);
    if (expected !== signature) return null;
  }

  // Pesapal status codes: 0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
  const statusCode = body?.status_code ?? body?.StatusCode ?? body?.status;
  const status = mapPesapalStatus(statusCode);
  
  const referenceId = body?.order_tracking_id ?? body?.OrderTrackingId ?? body?.reference_id;
  const transactionId = body?.order_merchant_reference ?? body?.OrderMerchantReference ?? body?.transaction_id ?? body?.id;

  return { 
    status, 
    reference_id: referenceId, 
    transaction_id: transactionId 
  };
}

/**
 * Map Pesapal status code to our status format
 */
function mapPesapalStatus(statusCode: number | string | undefined): 'success' | 'failed' | 'pending' {
  if (statusCode === 1 || statusCode === '1' || statusCode === 'COMPLETED') return 'success';
  if (statusCode === 2 || statusCode === '2' || statusCode === 'FAILED') return 'failed';
  if (statusCode === 3 || statusCode === '3' || statusCode === 'REVERSED') return 'failed';
  if (statusCode === 0 || statusCode === '0' || statusCode === 'INVALID') return 'failed';
  return 'pending';
}

