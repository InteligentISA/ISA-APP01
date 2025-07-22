import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";
import { PaymentData, PaymentStats, VendorApplication } from "@/types/admin";

// Export types for use in other components
export type { PaymentData, PaymentStats, VendorApplication } from "@/types/admin";

export class AdminService {
  static async getPaymentStats(): Promise<PaymentStats> {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*');

      if (error) throw error;

      const stats: PaymentStats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
        successfulPayments: payments.filter(p => p.status === 'succeeded').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        mpesaPayments: payments.filter(p => p.payment_method === 'mpesa').length,
        cashPayments: payments.filter(p => p.payment_method === 'cash_on_delivery').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  static async getVendorApplications() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
      return { data: [], error };
    }
  }

  static async getPendingVendorApplications(): Promise<VendorApplication[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending vendor applications:', error);
      return [];
    }
  }

  static async getApprovedVendorApplications(): Promise<VendorApplication[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approved vendor applications:', error);
      return [];
    }
  }

  static async getRejectedVendorApplications(): Promise<VendorApplication[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'vendor')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rejected vendor applications:', error);
      return [];
    }
  }

  static async approveVendorApplication(id: string, adminNotes?: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          status: 'approved',
          ...(adminNotes && { admin_notes: adminNotes })
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving vendor application:', error);
      throw error;
    }
  }

  static async rejectVendorApplication(id: string, adminNotes?: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          status: 'rejected',
          ...(adminNotes && { admin_notes: adminNotes })
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting vendor application:', error);
      throw error;
    }
  }

  static async getSuccessfulPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match PaymentData interface
      const transformedData: PaymentData[] = data?.map(payment => ({
        id: payment.id,
        amount: payment.amount || 0,
        status: payment.status || '',
        payment_method: payment.payment_method || '',
        created_at: new Date().toISOString(),
        order_number: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        products: [],
        transaction_id: '',
        mpesa_phone_number: ''
      })) || [];

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching successful payments:', error);
      return { data: [], error };
    }
  }

  static async updateVendorApplicationStatus(applicationId: string, status: 'approved' | 'rejected') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vendor application status:', error);
      throw error;
    }
  }
}