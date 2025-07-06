import { JumiaInteractionService } from '../jumiaInteractionService';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe('JumiaInteractionService', () => {
  const mockJumiaProduct = {
    id: 'jumia-123',
    name: 'Test Jumia Product',
    price: 1500,
    link: 'https://jumia.co.ke/test-product',
    image: 'https://example.com/image.jpg'
  };

  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackInteraction', () => {
    it('should track a like interaction', async () => {
      const result = await JumiaInteractionService.trackInteraction(
        mockUserId,
        mockJumiaProduct,
        'like',
        { category: 'electronics', source: 'jumia' }
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should track a view interaction', async () => {
      const result = await JumiaInteractionService.trackInteraction(
        mockUserId,
        mockJumiaProduct,
        'view'
      );

      expect(result.error).toBeNull();
    });

    it('should track a click interaction', async () => {
      const result = await JumiaInteractionService.trackInteraction(
        mockUserId,
        mockJumiaProduct,
        'click'
      );

      expect(result.error).toBeNull();
    });
  });

  describe('getLikedJumiaProducts', () => {
    it('should return liked Jumia products for a user', async () => {
      const result = await JumiaInteractionService.getLikedJumiaProducts(mockUserId);

      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('isJumiaProductLiked', () => {
    it('should check if a Jumia product is liked by user', async () => {
      const result = await JumiaInteractionService.isJumiaProductLiked(mockUserId, mockJumiaProduct.id);

      expect(result.error).toBeNull();
      expect(typeof result.liked).toBe('boolean');
    });
  });

  describe('unlikeJumiaProduct', () => {
    it('should unlike a Jumia product', async () => {
      const result = await JumiaInteractionService.unlikeJumiaProduct(mockUserId, mockJumiaProduct.id);

      expect(result.error).toBeNull();
    });
  });

  describe('getUserJumiaInteractionHistory', () => {
    it('should return user interaction history', async () => {
      const result = await JumiaInteractionService.getUserJumiaInteractionHistory(mockUserId);

      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter by interaction type', async () => {
      const result = await JumiaInteractionService.getUserJumiaInteractionHistory(mockUserId, 'like');

      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getJumiaProductAnalytics', () => {
    it('should return analytics for a Jumia product', async () => {
      const result = await JumiaInteractionService.getJumiaProductAnalytics(mockJumiaProduct.id);

      expect(result.error).toBeNull();
    });
  });

  describe('getTrendingJumiaProducts', () => {
    it('should return trending Jumia products', async () => {
      const result = await JumiaInteractionService.getTrendingJumiaProducts(10);

      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getUserJumiaPreferences', () => {
    it('should return user Jumia preferences', async () => {
      const result = await JumiaInteractionService.getUserJumiaPreferences(mockUserId);

      expect(result.error).toBeNull();
      expect(typeof result.data).toBe('object');
    });
  });
}); 