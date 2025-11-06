import { supabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export type PesapalPayMethod = 'mpesa' | 'airtel' | 'card' | 'bank';

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export async function initiatePesapalPayment(params: { 
  user_id: string; 
  amount: number; 
  currency: string; 
  method: PesapalPayMethod; 
  order_id?: string; 
  description?: string; 
  phone_number?: string;
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
}) {
  const headers = await getHeaders();
  // Map method to card_bank for Pesapal (Pesapal handles multiple payment methods)
  const paymentParams = {
    ...params,
    method: 'card_bank' as const // Pesapal uses card_bank method
  };
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/initiate`, { 
    method: 'POST', 
    headers, 
    body: JSON.stringify(paymentParams) 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Pesapal payment initiation failed: ${res.status}`);
  }
  return res.json();
}

export async function getPesapalPaymentStatus(transactionId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/status/${transactionId}`, { 
    headers 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Pesapal payment status check failed: ${res.status}`);
  }
  return res.json();
}

export async function retryPesapalPayment(transactionId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/retry/${transactionId}`, { 
    method: 'POST',
    headers 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Pesapal payment retry failed: ${res.status}`);
  }
  return res.json();
}

// Legacy exports for backward compatibility (will be removed in future)
export type DPOPayMethod = PesapalPayMethod;
export const initiateDPOPayment = initiatePesapalPayment;
export const getDPOPaymentStatus = getPesapalPaymentStatus;
export const retryDPOPayment = retryPesapalPayment;

