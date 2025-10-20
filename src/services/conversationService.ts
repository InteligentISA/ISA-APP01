import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, ChatSession } from '@/types/ai';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'myplug' | 'system';
  content: string;
  metadata: any;
  created_at: string;
}

export class ConversationService {
  static async saveConversation(
    sessionId: string,
    messages: ChatMessage[],
    title?: string
  ): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Generate title from first user message if not provided
      const firstUserMessage = messages.find(m => m.type === 'user');
      const conversationTitle = title || firstUserMessage?.content?.substring(0, 50) + '...' || 'New Conversation';
      
      // Generate preview from last few messages
      const preview = messages.slice(-3).map(m => 
        m.type === 'user' ? `You: ${m.content.substring(0, 100)}` : `MyPlug: ${m.content.substring(0, 100)}`
      ).join(' | ');

      // Create or update conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .upsert({
          id: sessionId,
          user_id: user.id,
          title: conversationTitle,
          preview: preview.substring(0, 500)
        })
        .select()
        .single();

      if (convError) throw convError;

      // Delete existing messages for this conversation
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', sessionId);

      // Insert new messages
      const messageInserts = messages.map(msg => ({
        conversation_id: sessionId,
        user_id: user.id,
        role: msg.type === 'myplug' ? 'myplug' : msg.type === 'user' ? 'user' : 'system',
        content: msg.content,
        metadata: {
          productResults: msg.productResults || null,
          suggestions: msg.suggestions || null
        }
      }));

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(messageInserts);

      if (messagesError) throw messagesError;

      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  static async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        type: msg.role === 'myplug' ? 'myplug' : msg.role === 'user' ? 'user' : 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        productResults: msg.metadata?.productResults || null,
        suggestions: msg.metadata?.suggestions || null
      }));
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
  }

  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  static async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }
}
