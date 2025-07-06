import { AIService } from '../aiService';

describe('AIService', () => {
  describe('analyzeQuery', () => {
    it('should extract price information correctly', () => {
      const result = AIService.analyzeQuery('I want an HP laptop under 50,000 KSH');
      
      expect(result.filters.maxPrice).toBe(50000);
      expect(result.searchTerms).toContain('hp');
      expect(result.searchTerms).toContain('laptop');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should extract category information', () => {
      const result = AIService.analyzeQuery('Show me smartphones with good cameras');
      
      expect(result.filters.category).toBe('smartphone');
      expect(result.searchTerms).toContain('phone');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle price ranges', () => {
      const result = AIService.analyzeQuery('Laptops between 30,000 and 80,000 KSH');
      
      expect(result.filters.minPrice).toBe(30000);
      expect(result.filters.maxPrice).toBe(80000);
      expect(result.filters.category).toBe('laptop');
    });

    it('should extract brand information', () => {
      const result = AIService.analyzeQuery('I need a Samsung phone');
      
      expect(result.searchTerms).toContain('samsung');
      expect(result.filters.category).toBe('smartphone');
    });

    it('should handle rating preferences', () => {
      const result = AIService.analyzeQuery('Show me products with rating above 4 stars');
      
      expect(result.filters.minRating).toBe(4);
    });
  });

  describe('generateResponse', () => {
    it('should generate appropriate response for results', () => {
      const analysis = AIService.analyzeQuery('HP laptop under 50,000');
      const response = AIService.generateResponse(analysis, 3);
      
      expect(response).toContain('3 products');
      expect(response).toContain('laptop');
      expect(response).toContain('50,000 KSH');
    });

    it('should handle single result', () => {
      const analysis = AIService.analyzeQuery('iPhone');
      const response = AIService.generateResponse(analysis, 1);
      
      expect(response).toContain('1 product');
    });
  });

  describe('generateFollowUpQuestions', () => {
    it('should suggest questions when information is missing', () => {
      const analysis = AIService.analyzeQuery('I want something');
      const questions = AIService.generateFollowUpQuestions(analysis);
      
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.includes('type of product'))).toBe(true);
      expect(questions.some(q => q.includes('budget'))).toBe(true);
    });

    it('should not suggest questions when all information is present', () => {
      const analysis = AIService.analyzeQuery('HP laptop under 50,000 KSH with 4+ rating');
      const questions = AIService.generateFollowUpQuestions(analysis);
      
      expect(questions.length).toBe(0);
    });
  });
}); 