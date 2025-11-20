import { supabase } from '@/integrations/supabase/client';

export interface GeminiChatResponse {
  response: string;
  products: any[];
  productQuery: any;
}

export class GeminiChatService {
  static async sendMessage(message: string, userId?: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<GeminiChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('myplug-chat', {
        body: {
          message,
          userId,
          conversationHistory
        }
      });

      if (error) {
        console.error('Error calling myplug-chat function:', error);
        throw error;
      }

      return data as GeminiChatResponse;
    } catch (error) {
      console.error('Error in GeminiChatService:', error);
      throw error;
    }
  }

  static async findGift(giftData: {
    age: number;
    gender: string;
    relationship?: string;
    occasion?: string;
    hobbies: string;
    budgetMin: number;
    budgetMax: number;
  }): Promise<{ suggestions: string; products: any[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('gift-finder', {
        body: giftData
      });

      if (error) {
        console.error('Error calling gift-finder function:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in findGift:', error);
      throw error;
    }
  }
}
