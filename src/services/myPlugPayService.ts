import { supabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export type MyPlugPayMethod = 'card_bank' | 'mpesa' | 'airtel' | 'paypal';

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (data.session?.access_token) headers['Authorization'] = `Bearer ${data.session.access_token}`;
  return headers;
}

export async function initiateMyPlugPayment(params: { user_id: string; amount: number; currency: string; method: MyPlugPayMethod; order_id?: string; description?: string; phone_number?: string; }) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/initiate`, { method: 'POST', headers, body: JSON.stringify(params) });
  if (!res.ok) throw new Error(`MyPlug Pay initiate failed: ${res.status}`);
  return res.json();
}

export async function getMyPlugPaymentStatus(transactionId: string) {
  const headers = await getHeaders();
  const res = await fetch(`${supabaseUrl}/functions/v1/myplug-pay/status/${transactionId}`, { headers });
  if (!res.ok) throw new Error(`MyPlug Pay status failed: ${res.status}`);
  return res.json();
}


