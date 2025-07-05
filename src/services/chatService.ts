import { AIService, QueryAnalysis } from './aiService';
import { ProductService } from './productService';
import { Product } from '@/types/product';
import { scrapeJumiaProducts, JumiaProduct } from './jumiaScraperService';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
  analysis?: QueryAnalysis;
  jumiaProducts?: JumiaProduct[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export class ChatService {
  /**
   * Process a user message with full personalization and product recommendations.
   * @param message The user's message
   * @param userId The user's ID
   * @param conversationHistory The chat history (array of {role, content, timestamp})
   */
  static async processUserMessage(message: string, userId?: string, conversationHistory: Array<{role: string, content: string, timestamp: Date}> = []): Promise<ChatMessage> {
    let userContext = undefined;
    if (userId) {
      userContext = await AIService.getUserContext(userId);
    }

    // Use AIService.processMessage for GPT response and analysis
    let gptResult: any = undefined;
    if (userContext) {
      gptResult = await AIService.processMessage(message, userContext, conversationHistory);
    } else {
      // Fallback: use old logic if no user context
      const analysis = AIService.analyzeQuery(message);
      const searchQuery = analysis.searchTerms.join(' ');
      const { data: products, error } = await ProductService.getProducts({
        query: searchQuery,
        filters: analysis.filters,
        sort: { field: 'rating', direction: 'desc' }
      });
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: error ? "I'm sorry, I encountered an error while searching for products. Please try again." : AIService.generateResponse(analysis, products.length),
        timestamp: new Date(),
        products: products,
        analysis: analysis
      };
    }

    // If GPT says to search products, do so and include in response
    let products: Product[] = [];
    let jumiaProducts: JumiaProduct[] = [];
    if (gptResult.shouldSearchProducts && gptResult.analysis && gptResult.analysis.searchTerms.length > 0) {
      const searchQuery = gptResult.analysis.searchTerms.join(' ');
      const { data: foundProducts } = await ProductService.getProducts({
        query: searchQuery,
        filters: gptResult.analysis.filters,
        sort: { field: 'rating', direction: 'desc' }
      });
      products = foundProducts || [];
      // Only do Jumia scraping if products are missing or all have low stock
      if (products.length === 0 || products.every(p => p.stock_quantity !== undefined && p.stock_quantity <= 2)) {
        jumiaProducts = await scrapeJumiaProducts(searchQuery);
      }
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: gptResult.response,
      timestamp: new Date(),
      products: products,
      analysis: gptResult.analysis,
      ...(jumiaProducts.length > 0 ? { jumiaProducts } : {})
    };
  }

  static async getSuggestions(): Promise<string[]> {
    return [
      "Show me HP laptops under 50,000 KSH",
      "I need a smartphone with good camera",
      "Find gaming accessories under 10,000",
      "Best rated headphones",
      "Laptops between 30,000 and 80,000 KSH",
      "Show me Apple products",
      "Gaming laptops with 4+ star rating",
      "Budget smartphones under 20,000"
    ];
  }

  static createNewSession(): ChatSession {
    const sessionId = Date.now().toString();
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `Hi! I'm ISA, your AI shopping assistant. I can help you find the perfect products from our catalog. 

Just tell me what you're looking for! For example:
• "I want an HP laptop under 50,000 KSH"
• "Show me smartphones with good cameras"
• "Find gaming accessories under 10,000"

What can I help you find today?`,
      timestamp: new Date()
    };

    return {
      id: sessionId,
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static addMessageToSession(session: ChatSession, message: ChatMessage): ChatSession {
    return {
      ...session,
      messages: [...session.messages, message],
      updatedAt: new Date()
    };
  }

  static async searchProductsByQuery(query: string): Promise<{ products: Product[]; analysis: QueryAnalysis }> {
    const analysis = AIService.analyzeQuery(query);
    const searchQuery = analysis.searchTerms.join(' ');
    
    const { data: products, error } = await ProductService.getProducts({
      query: searchQuery,
      filters: analysis.filters,
      sort: { field: 'rating', direction: 'desc' }
    });

    return {
      products: products || [],
      analysis
    };
  }
} 