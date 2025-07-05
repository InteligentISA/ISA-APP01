
export interface QueryAnalysis {
  intent: 'product_search' | 'price_comparison' | 'recommendation' | 'general_info' | 'greeting';
  categories: string[];
  keywords: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
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
