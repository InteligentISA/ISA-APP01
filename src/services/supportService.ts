import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, SupportMessage } from '@/types/support';

export class SupportService {
  static async createTicket(data: {
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<{ data: SupportTicket | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        user_type: profile?.user_type || 'customer',
        ...data,
        status: 'open'
      })
      .select()
      .single();

    return { data: ticket, error };
  }

  static async getMyTickets(): Promise<{ data: SupportTicket[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles(first_name, last_name, email)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  }

  static async getTicketMessages(ticketId: string): Promise<{ data: SupportMessage[]; error: any }> {
    const { data, error } = await supabase
      .from('support_messages')
      .select(`
        *,
        user:profiles(first_name, last_name)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  }

  static async sendMessage(ticketId: string, message: string): Promise<{ data: SupportMessage | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: msg, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        message,
        is_admin: false
      })
      .select()
      .single();

    return { data: msg, error };
  }

  static async requestLiveChat(): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('live_chat_sessions')
      .insert({
        user_id: user.id,
        status: 'waiting'
      })
      .select()
      .single();

    return { data, error };
  }
}
