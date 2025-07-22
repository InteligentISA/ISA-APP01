export interface QueryAnalysis {
  category?: string;
  subcategory?: string;
  intent: string;
  price_range?: {
    min?: number;
    max?: number;
  };
  brand?: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AIServiceResponse {
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
  products?: any[];
  jumiaProducts?: any[];
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string;
  keywords?: string[];
}