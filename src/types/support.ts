export interface SupportTicket {
  id: string;
  user_id: string;
  user_type: 'customer' | 'vendor';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  
  // Relations
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  
  // Relations
  user?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface LiveChatSession {
  id: string;
  user_id: string;
  admin_id?: string;
  status: 'waiting' | 'active' | 'ended';
  created_at: string;
  ended_at?: string;
}
