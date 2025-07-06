
export interface QueryAnalysis {
  intent: 'product_search' | 'price_comparison' | 'recommendation' | 'general_query';
  entities: {
    products?: string[];
    categories?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    brands?: string[];
    features?: string[];
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  tags?: string[];
}

export interface AIServiceResponse {
  response: string;
  analysis: QueryAnalysis;
  shouldSearchProducts: boolean;
  userLearning: any;
  products?: any[];
  jumiaProducts?: any[];
}
