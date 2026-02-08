import { supabase } from '@/integrations/supabase/client';
import { ReturnRequest, CreateReturnRequestRequest, UpdateReturnRequestRequest } from '@/types/order';

export class ReturnService {
  static async createReturnRequest(request: CreateReturnRequestRequest & { user_id: string; vendor_id: string }): Promise<ReturnRequest> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .insert({
        order_id: request.order_id,
        user_id: request.user_id,
        product_id: request.product_id,
        vendor_id: request.vendor_id,
        reason: request.reason,
        message: request.message,
        return_type: request.return_type,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserReturnRequests(userId: string): Promise<ReturnRequest[]> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .select(`*, order:orders(*), product:products(name, main_image), vendor:profiles(first_name, last_name)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getVendorReturnRequests(vendorId: string): Promise<ReturnRequest[]> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .select(`*, order:orders(*), product:products(name, main_image), user:profiles(first_name, last_name)`)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllReturnRequests(): Promise<ReturnRequest[]> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .select(`*, order:orders(*), product:products(name, main_image), user:profiles(first_name, last_name), vendor:profiles(first_name, last_name)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateReturnRequest(request: UpdateReturnRequestRequest): Promise<ReturnRequest> {
    const updateData: any = {
      status: request.status,
      updated_at: new Date().toISOString()
    };

    if (request.admin_notes) updateData.admin_notes = request.admin_notes;
    if (request.vendor_notes) updateData.vendor_notes = request.vendor_notes;
    if (request.status === 'approved' || request.status === 'completed') {
      updateData.processed_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
      .from('return_requests')
      .update(updateData)
      .eq('id', request.return_request_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReturnRequestById(id: string): Promise<ReturnRequest | null> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .select(`*, order:orders(*), product:products(name, main_image), user:profiles(first_name, last_name), vendor:profiles(first_name, last_name)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getReturnStats(): Promise<{
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    completed_requests: number;
  }> {
    const { data, error } = await (supabase as any)
      .from('return_requests')
      .select('status');

    if (error) throw error;

    return {
      total_requests: data?.length || 0,
      pending_requests: data?.filter((r: any) => r.status === 'pending').length || 0,
      approved_requests: data?.filter((r: any) => r.status === 'approved').length || 0,
      rejected_requests: data?.filter((r: any) => r.status === 'rejected').length || 0,
      completed_requests: data?.filter((r: any) => r.status === 'completed').length || 0,
    };
  }
}