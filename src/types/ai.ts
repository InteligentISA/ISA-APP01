
export interface QueryAnalysis {
  intent: 'product_search' | 'price_comparison' | 'recommendation' | 'general_query';
  keywords: string[];
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  filters?: {
    brand?: string;
    rating?: number;
    features?: string[];
  };
}

export interface AIServiceResponse {
  response: string;
  analysis: QueryAnalysis;
  shouldSearchProducts: boolean;
  userLearning: any;
  products?: any[];
  jumiaProducts?: any[];
}
