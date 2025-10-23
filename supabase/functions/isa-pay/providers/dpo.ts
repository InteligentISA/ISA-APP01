// deno-lint-ignore-file no-explicit-any
import type { InitiateRequestBody, MyPlugPayResponse } from "../types.ts";
import { generateMyPlugTransactionId } from "../utils.ts";

const DPO_BASE_URL = Deno.env.get('DPO_BASE_URL') ?? 'https://secure.3gdirectpay.com/API/v6/';
const DPO_COMPANY_TOKEN = Deno.env.get('DPO_COMPANY_TOKEN') ?? '';
const DPO_SERVICE_TYPE = Deno.env.get('DPO_SERVICE_TYPE') ?? '';
const DPO_API_KEY = Deno.env.get('DPO_API_KEY') ?? '';

// DPO payment methods mapping
const DPO_METHOD_MAP = {
  'mpesa': 'mpesa',
  'airtel': 'airtel_money', 
  'card': 'card',
  'bank': 'bank_transfer'
};

export async function initiateDPOPayment(payload: InitiateRequestBody & {
  card_details?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  bank_details?: {
    accountNumber: string;
    bankName: string;
    accountHolderName: string;
  };
}): Promise<MyPlugPayResponse> {
  const transactionId = generateMyPlugTransactionId();
  
  try {
    // Map our method to DPO method
    const dpoMethod = DPO_METHOD_MAP[payload.method as keyof typeof DPO_METHOD_MAP] || 'card';
    
    // Create DPO payment request
    const dpoPayload: any = {
      companyToken: DPO_COMPANY_TOKEN,
      serviceType: DPO_SERVICE_TYPE,
      paymentAmount: payload.amount,
      paymentCurrency: payload.currency,
      customerEmail: payload.user_id, // Using user_id as email for now
      customerFirstName: 'Customer',
      customerLastName: 'User',
      customerPhone: payload.phone_number || '',
      paymentMethod: dpoMethod,
      orderDescription: payload.description || `Payment for order ${payload.order_id}`,
      redirectURL: `${DPO_BASE_URL}success`,
      failedURL: `${DPO_BASE_URL}failed`,
      transactionReference: transactionId,
      orderId: payload.order_id || transactionId
    };

    // Add method-specific details
    if (payload.method === 'card' && payload.card_details) {
      dpoPayload.cardNumber = payload.card_details.cardNumber;
      dpoPayload.cardExpiry = payload.card_details.expiryDate;
      dpoPayload.cardCVV = payload.card_details.cvv;
      dpoPayload.cardholderName = payload.card_details.cardholderName;
    } else if (payload.method === 'bank' && payload.bank_details) {
      dpoPayload.bankAccountNumber = payload.bank_details.accountNumber;
      dpoPayload.bankName = payload.bank_details.bankName;
      dpoPayload.accountHolderName = payload.bank_details.accountHolderName;
    }

    // Make API call to DPO
    const response = await fetch(`${DPO_BASE_URL}createToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DPO_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(dpoPayload)
    });

    if (!response.ok) {
      throw new Error(`DPO API error: ${response.status}`);
    }

    const dpoResponse = await response.json();
    
    return {
      transaction_id: transactionId,
      provider: 'DPO',
      status: 'pending',
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: dpoResponse.redirectURL || `${DPO_BASE_URL}pay/${transactionId}`,
      reference_id: dpoResponse.transactionToken,
      metadata: { 
        service_type: DPO_SERVICE_TYPE, 
        company_token: Boolean(DPO_COMPANY_TOKEN),
        dpo_method: dpoMethod,
        dpo_response: dpoResponse
      }
    };
  } catch (error) {
    console.error('DPO payment initiation error:', error);
    // Fallback to basic redirect URL
    return {
      transaction_id: transactionId,
      provider: 'DPO',
      status: 'pending',
      amount: payload.amount,
      currency: payload.currency,
      redirect_url: `${DPO_BASE_URL}pay/${transactionId}`,
      metadata: { 
        service_type: DPO_SERVICE_TYPE, 
        company_token: Boolean(DPO_COMPANY_TOKEN),
        error: error.message
      }
    };
  }
}

// Legacy function for backward compatibility
export async function initiateCardPayment(payload: InitiateRequestBody): Promise<MyPlugPayResponse> {
  return initiateDPOPayment(payload);
}

export async function verifyDPOPayment(_req: Request, body: any) {
  const status = mapExternalStatus(body?.status ?? body?.TransactionStatus ?? body?.paymentStatus);
  return { 
    status, 
    reference_id: body?.reference_id ?? body?.TransactionToken ?? body?.transactionToken, 
    transaction_id: body?.transaction_id ?? body?.TransactionID ?? body?.transactionReference 
  };
}

// Legacy function for backward compatibility
export async function verifyCardPayment(_req: Request, body: any) {
  return verifyDPOPayment(_req, body);
}

function mapExternalStatus(external: string): 'success' | 'failed' | 'pending' {
  const e = (external || '').toLowerCase();
  if (e.includes('success') || e === 'paid' || e === 'approved' || e === 'completed') return 'success';
  if (e.includes('fail') || e === 'declined' || e === 'error' || e === 'cancelled') return 'failed';
  return 'pending';
}


