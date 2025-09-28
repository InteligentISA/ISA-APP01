import { Address } from './order';

export interface ShippingRecord {
  id: string;
  order_id: string;
  carrier: string;
  tracking_number?: string;
  tracking_url?: string;
  status: string;
  shipping_method: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_address: Address;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    total_amount: number;
    customer_email: string;
  };
}