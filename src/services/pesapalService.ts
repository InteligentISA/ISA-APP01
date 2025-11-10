import { supabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export interface PesapalPaymentParams {
  user_id: string;
  amount: number;
  currency: string;
  order_id?: string;
  description?: string;
  phone_number?: string;
  email?: string;
}

export interface PesapalPaymentResponse {
  transaction_id: string;
  status: 'pending' | 'success' | 'failed';
  iframe_url?: string;
  order_tracking_id?: string;
  error?: string;
}

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export async function initiatePesapalPayment(params: PesapalPaymentParams): Promise<PesapalPaymentResponse> {
  const headers = await getHeaders();
  
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/initiate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...params,
      method: 'card_bank' // PesaPal uses card_bank method
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `PesaPal payment initiation failed: ${res.status}`);
  }

  return res.json();
}

export async function getPesapalPaymentStatus(transactionId: string): Promise<PesapalPaymentResponse> {
  const headers = await getHeaders();
  
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/status/${transactionId}`, {
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `PesaPal payment status check failed: ${res.status}`);
  }

  return res.json();
}

export async function retryPesapalPayment(transactionId: string): Promise<PesapalPaymentResponse> {
  const headers = await getHeaders();
  
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/retry/${transactionId}`, {
    method: 'POST',
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `PesaPal payment retry failed: ${res.status}`);
  }

  return res.json();
}
