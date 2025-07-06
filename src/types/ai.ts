
export interface QueryAnalysis {
  intent: 'product_search' | 'price_comparison' | 'recommendation' | 'general_question';
  categories: string[];
  keywords: string[];
  confidence: number;
}

export interface AIServiceResponse {
  response: string;
  analysis: QueryAnalysis;
  shouldSearchProducts: boolean;
  userLearning: any;
  products?: any[];
  jumiaProducts?: any[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  id: string;
  preferences?: any;
  searchHistory?: string[];
  purchaseHistory?: any[];
}
