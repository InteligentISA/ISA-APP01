import { ProductFilters } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface QueryAnalysis {
  searchTerms: string[];
  filters: ProductFilters;
  confidence: number;
  originalQuery: string;
  isProductQuery: boolean;
  userIntent: 'shopping' | 'general' | 'help' | 'greeting';
}

export interface UserContext {
  id: string;
  name: string;
  age: number;
  gender: string;
  preferences: any;
  searchHistory: string[];
  likedProducts: string[];
  cartHistory: string[];
  purchaseHistory: string[];
}

export interface ChatContext {
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userContext: UserContext;
  currentSessionId: string;
}

export class AIService {
  private static OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private static OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  // Keywords that indicate price constraints
  private static priceKeywords = {
    under: 'max',
    below: 'max',
    less: 'max',
    maximum: 'max',
    up: 'max',
    over: 'min',
    above: 'min',
    minimum: 'min',
    from: 'min',
    between: 'range'
  };

  // Common product categories and their synonyms
  private static categorySynonyms: Record<string, string[]> = {
    'laptop': ['laptop', 'notebook', 'computer', 'pc', 'hp', 'dell', 'lenovo', 'macbook', 'acer', 'asus'],
    'smartphone': ['phone', 'smartphone', 'mobile', 'iphone', 'samsung', 'huawei', 'xiaomi', 'oppo', 'vivo'],
    'headphones': ['headphones', 'earphones', 'earbuds', 'airpods', 'wireless', 'bluetooth'],
    'tablet': ['tablet', 'ipad', 'android tablet', 'samsung tablet'],
    'camera': ['camera', 'dslr', 'mirrorless', 'canon', 'nikon', 'sony'],
    'gaming': ['gaming', 'game', 'console', 'ps5', 'xbox', 'nintendo'],
    'fashion': ['shirt', 'dress', 'shoes', 'bag', 'watch', 'jewelry', 'clothing'],
    'home': ['furniture', 'kitchen', 'appliance', 'tv', 'speaker', 'lighting'],
    'sports': ['sports', 'fitness', 'gym', 'running', 'football', 'basketball'],
    'books': ['book', 'novel', 'textbook', 'magazine', 'comic']
  };

  // Brand keywords
  private static brandKeywords: Record<string, string[]> = {
    'hp': ['hp', 'hewlett packard', 'pavilion', 'elitebook', 'probook'],
    'dell': ['dell', 'inspiron', 'latitude', 'precision', 'xps'],
    'lenovo': ['lenovo', 'thinkpad', 'ideapad', 'yoga'],
    'apple': ['apple', 'iphone', 'ipad', 'macbook', 'mac', 'airpods'],
    'samsung': ['samsung', 'galaxy', 'note', 'tab'],
    'nike': ['nike', 'air max', 'jordan'],
    'adidas': ['adidas', 'boost', 'ultraboost'],
    'canon': ['canon', 'eos', 'powershot'],
    'nikon': ['nikon', 'd', 'z', 'coolpix'],
    'sony': ['sony', 'alpha', 'cyber-shot', 'playstation']
  };

  static async processMessage(message: string, userContext: UserContext, conversationHistory: Array<{role: string, content: string, timestamp: Date}>): Promise<{
    response: string;
    analysis: QueryAnalysis;
    shouldSearchProducts: boolean;
    userLearning: any;
    structuredCategoryInfo?: {
      main_category?: string;
      subcategory?: string;
      sub_subcategory?: string;
      min_price?: number;
      max_price?: number;
    };
  }> {
    try {
      // Create context for GPT
      const context = this.createGPTContext(message, userContext, conversationHistory);
      
      // Call GPT API
      const gptResponse = await this.callGPT(context);
      
      // Analyze the response and user intent
      const analysis = this.analyzeQuery(message);
      const isProductQuery = this.detectProductQuery(message, gptResponse);
      
      // Update user learning data
      const userLearning = await this.updateUserLearning(userContext, message, analysis);
      
      // If product query, extract structured info
      let structuredCategoryInfo = undefined;
      if (isProductQuery) {
        structuredCategoryInfo = await this.extractStructuredCategoryInfo(message);
      }

      return {
        response: gptResponse,
        analysis,
        shouldSearchProducts: isProductQuery,
        userLearning,
        structuredCategoryInfo
      };
    } catch (error) {
      console.error('Error processing message with GPT:', error);
      // Fallback to basic response
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. How can I help you with your shopping needs?",
        analysis: this.analyzeQuery(message),
        shouldSearchProducts: false,
        userLearning: {}
      };
    }
  }

  private static createGPTContext(message: string, userContext: UserContext, conversationHistory: Array<{role: string, content: string, timestamp: Date}>): string {
    const userAge = userContext.age || 25;
    const userGender = userContext.gender || 'prefer-not-to-say';
    const userName = userContext.name || 'there';
    
    // Create conversation history context
    const conversationContext = conversationHistory
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Create user preferences context
    const preferencesContext = this.formatUserPreferences(userContext);

    return `You are ISA, an intelligent AI shopping assistant for an e-commerce platform. You are helpful, friendly, and knowledgeable about products and general topics.

USER CONTEXT:
- Name: ${userName}
- Age: ${userAge + 1} years old
- Gender: ${userGender}
- Preferences: ${preferencesContext}

CONVERSATION HISTORY:
${conversationContext}

CURRENT MESSAGE:
${userName} says: "${message}"

INSTRUCTIONS:
1. Respond naturally and conversationally as ISA
2. If the user is asking about products or shopping, help them find what they need
3. If it's a general question, answer it knowledgeably
4. If it's a greeting, respond warmly and ask how you can help
5. Use the user's name when appropriate
6. Keep responses very concise but helpful
7. If you detect they want to shop for something, mention that you can help them find products

RESPONSE:`;
  }

  /**
   * Use GPT-4 to extract structured category and price info from a user query.
   * Returns: { main_category, subcategory, sub_subcategory, min_price, max_price }
   */
  static async extractStructuredCategoryInfo(query: string): Promise<{
    main_category?: string;
    subcategory?: string;
    sub_subcategory?: string;
    min_price?: number;
    max_price?: number;
  }> {
    const prompt = `Given the following user request, extract the main category, subcategory, sub-subcategory (if any), and price range (min, max) in JSON format. Use the following format:\n\n{
  "main_category": string, // e.g. "Alcoholic Beverages"
  "subcategory": string,   // e.g. "Wine"
  "sub_subcategory": string, // e.g. "Red Wine" or null
  "min_price": number,     // e.g. 0
  "max_price": number      // e.g. 2000
}\n\nIf a field is not present, use null.\n\nUser said: "${query}"\n\nReturn only the JSON object, nothing else.`;
    const response = await this.callGPT(prompt, 'gpt-4');
    try {
      // Find the first JSON object in the response
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  // Patch callGPT to accept a model override
  private static async callGPT(context: string, modelOverride?: string): Promise<string> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: modelOverride || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are ISA, an intelligent AI shopping assistant. Be helpful, friendly, and knowledgeable.'
            },
            {
              role: 'user',
              content: context
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit or quota exceeded
          return 'The AI service is temporarily busy or rate-limited. Please try again in a minute.';
        }
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('GPT API call failed:', error);
      if (error instanceof Error && error.message.includes('429')) {
        return 'The AI service is temporarily busy or rate-limited. Please try again in a minute.';
      }
      throw error;
    }
  }

  private static formatUserPreferences(userContext: UserContext): string {
    const preferences = [];
    
    if (userContext.searchHistory && userContext.searchHistory.length > 0) {
      preferences.push(`Recently searched: ${userContext.searchHistory.slice(-3).join(', ')}`);
    }
    
    if (userContext.likedProducts && userContext.likedProducts.length > 0) {
      preferences.push(`Liked products: ${userContext.likedProducts.slice(-3).join(', ')}`);
    }
    
    if (userContext.purchaseHistory && userContext.purchaseHistory.length > 0) {
      preferences.push(`Recently purchased: ${userContext.purchaseHistory.slice(-3).join(', ')}`);
    }
    
    return preferences.length > 0 ? preferences.join('; ') : 'No specific preferences yet';
  }

  private static detectProductQuery(message: string, gptResponse: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerResponse = gptResponse.toLowerCase();
    
    // Check for product-related keywords
    const productKeywords = [
      'buy', 'purchase', 'shop', 'find', 'looking for', 'need', 'want',
      'laptop', 'phone', 'headphones', 'camera', 'shoes', 'clothes',
      'gift', 'present', 'recommend', 'suggestion'
    ];
    
    return productKeywords.some(keyword => 
      lowerMessage.includes(keyword) || lowerResponse.includes(keyword)
    );
  }

  private static async updateUserLearning(userContext: UserContext, message: string, analysis: QueryAnalysis): Promise<any> {
    try {
      // Store all search queries (not just product queries)
      await supabase
        .from('user_searches')
        .insert({
          user_id: userContext.id,
          search_query: message,
          search_category: analysis.filters.category || 'general'
        });

      // Update user preferences based on the interaction
      const newPreferences = {
        ...userContext.preferences,
        lastInteraction: new Date().toISOString(),
        totalInteractions: (userContext.preferences?.totalInteractions || 0) + 1,
        preferredCategories: analysis.filters.category ? 
          [...(userContext.preferences?.preferredCategories || []), analysis.filters.category] : 
          userContext.preferences?.preferredCategories || []
      };

      await supabase
        .from('profiles')
        .update({ preferences: newPreferences })
        .eq('id', userContext.id);

      return newPreferences;
    } catch (error) {
      console.error('Error updating user learning:', error);
      return userContext.preferences;
    }
  }

  static analyzeQuery(query: string): QueryAnalysis {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);
    
    let searchTerms: string[] = [];
    let filters: ProductFilters = {};
    let confidence = 0.5; // Base confidence
    let isProductQuery = false;
    let userIntent: 'shopping' | 'general' | 'help' | 'greeting' = 'general';

    // Detect greeting
    if (this.isGreeting(lowerQuery)) {
      userIntent = 'greeting';
      return {
        searchTerms: [],
        filters: {},
        confidence: 0.9,
        originalQuery: query,
        isProductQuery: false,
        userIntent
      };
    }

    // Detect help request
    if (this.isHelpRequest(lowerQuery)) {
      userIntent = 'help';
      return {
        searchTerms: [],
        filters: {},
        confidence: 0.8,
        originalQuery: query,
        isProductQuery: false,
        userIntent
      };
    }

    // Extract price information
    const priceInfo = this.extractPriceInfo(lowerQuery);
    if (priceInfo) {
      filters = { ...filters, ...priceInfo };
      confidence += 0.2;
      isProductQuery = true;
      userIntent = 'shopping';
    }

    // Extract category information
    const category = this.extractCategory(lowerQuery);
    if (category) {
      filters.category = category;
      confidence += 0.2;
      isProductQuery = true;
      userIntent = 'shopping';
    }

    // Extract brand information
    const brand = this.extractBrand(lowerQuery);
    if (brand) {
      searchTerms.push(brand);
      confidence += 0.1;
      isProductQuery = true;
      userIntent = 'shopping';
    }

    // Extract general product terms
    const productTerms = this.extractProductTerms(lowerQuery);
    searchTerms = [...searchTerms, ...productTerms];
    if (productTerms.length > 0) {
      isProductQuery = true;
      userIntent = 'shopping';
    }

    // Extract rating preferences
    const ratingInfo = this.extractRatingInfo(lowerQuery);
    if (ratingInfo) {
      filters.rating = ratingInfo;
      confidence += 0.1;
      isProductQuery = true;
      userIntent = 'shopping';
    }

    // If no specific search terms found, use the original query
    if (searchTerms.length === 0 && isProductQuery) {
      searchTerms = [query];
    }

    return {
      searchTerms,
      filters,
      confidence: Math.min(confidence, 1.0),
      originalQuery: query,
      isProductQuery,
      userIntent
    };
  }

  private static isGreeting(query: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'];
    return greetings.some(greeting => query.includes(greeting));
  }

  private static isHelpRequest(query: string): boolean {
    const helpWords = ['help', 'support', 'assist', 'guide', 'how', 'what can you do'];
    return helpWords.some(word => query.includes(word));
  }

  private static extractPriceInfo(query: string): Partial<ProductFilters> | null {
    const priceRegex = /(?:under|below|less|maximum|up|over|above|minimum|from|between)\s*(?:ksh?|sh|kenya\s*shillings?)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi;
    const matches = [...query.matchAll(priceRegex)];
    
    if (matches.length === 0) return null;

    const filters: Partial<ProductFilters> = {};
    
    matches.forEach(match => {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const constraint = match[0].toLowerCase();
      
      if (constraint.includes('under') || constraint.includes('below') || constraint.includes('less') || constraint.includes('maximum') || constraint.includes('up')) {
        filters.maxPrice = amount;
      } else if (constraint.includes('over') || constraint.includes('above') || constraint.includes('minimum') || constraint.includes('from')) {
        filters.minPrice = amount;
      }
    });

    // Handle "between X and Y" pattern
    const betweenMatch = query.match(/between\s*(?:ksh?|sh)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:and|to)\s*(?:ksh?|sh)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (betweenMatch) {
      filters.minPrice = parseFloat(betweenMatch[1].replace(/,/g, ''));
      filters.maxPrice = parseFloat(betweenMatch[2].replace(/,/g, ''));
    }

    return Object.keys(filters).length > 0 ? filters : null;
  }

  private static extractCategory(query: string): string | null {
    for (const [category, synonyms] of Object.entries(this.categorySynonyms)) {
      for (const synonym of synonyms) {
        if (query.includes(synonym)) {
          return category;
        }
      }
    }
    return null;
  }

  private static extractBrand(query: string): string | null {
    for (const [brand, keywords] of Object.entries(this.brandKeywords)) {
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          return brand;
        }
      }
    }
    return null;
  }

  private static extractProductTerms(query: string): string[] {
    const terms: string[] = [];
    
    // Common product-related words
    const productWords = [
      'laptop', 'phone', 'headphones', 'tablet', 'camera', 'gaming', 'shirt', 'dress', 
      'shoes', 'bag', 'watch', 'furniture', 'kitchen', 'appliance', 'tv', 'speaker',
      'book', 'novel', 'sports', 'fitness', 'gym', 'running', 'football', 'basketball'
    ];

    productWords.forEach(word => {
      if (query.includes(word)) {
        terms.push(word);
      }
    });

    return terms;
  }

  private static extractRatingInfo(query: string): number | null {
    const ratingMatch = query.match(/(?:rating|stars?)\s*(?:of|above|over)?\s*(\d+(?:\.\d+)?)/i);
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    return null;
  }

  static generateResponse(analysis: QueryAnalysis, resultsCount: number): string {
    const { searchTerms, filters, originalQuery } = analysis;
    
    let response = `I found ${resultsCount} product${resultsCount !== 1 ? 's' : ''} that match your request`;
    
    if (filters.category) {
      response += ` for ${filters.category}`;
    }
    
    if (filters.maxPrice) {
      response += ` under ${filters.maxPrice.toLocaleString()} KSH`;
    } else if (filters.minPrice) {
      response += ` above ${filters.minPrice.toLocaleString()} KSH`;
    }
    
    if (filters.rating) {
      response += ` with rating ${filters.rating}+ stars`;
    }
    
    response += '. Here are the best matches:';
    
    return response;
  }

  static generateFollowUpQuestions(analysis: QueryAnalysis): string[] {
    const questions: string[] = [];
    const { filters } = analysis;

    if (!filters.category) {
      questions.push("What type of product are you looking for?");
    }

    if (!filters.maxPrice && !filters.minPrice) {
      questions.push("What's your budget range?");
    }

    if (!filters.rating) {
      questions.push("Do you have any preference for product ratings?");
    }

    return questions;
  }

  static async getUserContext(userId: string): Promise<UserContext & { conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }> }> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Calculate age
      const age = profile.date_of_birth ? 
        Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        25;

      // Get recent searches
      const { data: searches } = await supabase
        .from('user_searches')
        .select('search_query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get liked products
      const { data: likes } = await supabase
        .from('user_likes')
        .select('product_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get cart history
      const { data: cartItems } = await supabase
        .from('user_cart_items')
        .select('product_name')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
        .limit(10);

      // Get purchase history
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('product_name')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(10);

      // Get last 10 chat messages for context
      const { data: chat } = await (supabase as any)
        .from('chat_history')
        .select('role, message, timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      const conversationHistory = chat?.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.message,
        timestamp: new Date(msg.timestamp)
      })) || [];

      return {
        id: userId,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'there',
        age,
        gender: profile.gender || 'prefer-not-to-say',
        preferences: profile.preferences || {},
        searchHistory: searches?.map(s => s.search_query) || [],
        likedProducts: likes?.map(l => l.product_name) || [],
        cartHistory: cartItems?.map(c => c.product_name) || [],
        purchaseHistory: purchases?.map(p => p.product_name) || [],
        conversationHistory
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        id: userId,
        name: 'there',
        age: 25,
        gender: 'prefer-not-to-say',
        preferences: {},
        searchHistory: [],
        likedProducts: [],
        cartHistory: [],
        purchaseHistory: [],
        conversationHistory: []
      };
    }
  }

  /**
   * Ask GPT to explain why this product is a good fit for the user, using their profile and preferences.
   */
  static async explainProductToUser(product: Product, userContext: UserContext): Promise<string> {
    const prompt = `You are ISA, an intelligent AI shopping assistant. The user is a ${userContext.gender}, age ${userContext.age}. Their preferences: ${this.formatUserPreferences(userContext)}. Explain in a friendly, concise way why the following product is a good fit for them, and highlight its key features:

Product:
Name: ${product.name}
Category: ${product.category}
Brand: ${product.brand || 'N/A'}
Description: ${product.description || 'No description'}
Price: ${product.price} KSH

Respond as ISA, directly to the user.`;
    return this.callGPT(prompt);
  }

  static async saveChatMessage({
    userId,
    sessionId,
    message,
    role,
    timestamp = new Date().toISOString()
  }: {
    userId: string;
    sessionId: string;
    message: string;
    role: 'user' | 'assistant';
    timestamp?: string;
  }) {
    const { error } = await (supabase as any).from('chat_history').insert({
      user_id: userId,
      session_id: sessionId,
      message,
      role,
      timestamp
    });
    if (error) throw error;
  }
} 