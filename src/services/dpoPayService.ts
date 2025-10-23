import { supabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export type DPOPayMethod = 'mpesa' | 'airtel' | 'card' | 'bank';

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export async function initiateDPOPayment(params: { 
  user_id: string; 
  amount: number; 
  currency: string; 
  method: DPOPayMethod; 
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
  const res = await fetch(`${supabaseUrl}/functions/v1/isa-pay/initiate`, { 
    method: 'POST', 
    headers, 
    body: JSON.stringify(params) 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `DPO payment initiation failed: ${res.status}`);
  }
  return res.json();
}

export async function getDPOPaymentStatus(transactionId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/isa-pay/status/${transactionId}`, { 
    headers 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `DPO payment status check failed: ${res.status}`);
  }
  return res.json();
}

export async function retryDPOPayment(transactionId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/isa-pay/retry/${transactionId}`, { 
    method: 'POST',
    headers 
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `DPO payment retry failed: ${res.status}`);
  }
  return res.json();
}
