
export interface QueryAnalysis {
  intent: 'product_search' | 'price_comparison' | 'recommendation' | 'general_inquiry' | 'gift_suggestion';
  categories: string[];
  keywords: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  specificRequirements?: string[];
}

export interface AIServiceResponse {
  response: string;
  analysis: QueryAnalysis;
  shouldSearchProducts: boolean;
  userLearning: any;
  products?: any[];
  jumiaProducts?: any[];
}
