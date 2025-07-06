
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift, Heart, ShoppingCart } from "lucide-react";
import { ProductService } from "@/services/productService";
import ProductCard from "./ProductCard";

interface GiftRecommendationsProps {
  onBack: () => void;
  user: any;
  onAddToCart: (product: any) => void;
  onToggleLike: (product: any) => void;
  likedItems: string[];
}

const GiftRecommendations: React.FC<GiftRecommendationsProps> = ({
  onBack,
  user,
  onAddToCart,
  onToggleLike,
  likedItems
}) => {
  const [giftProducts, setGiftProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiftRecommendations();
  }, []);

  const fetchGiftRecommendations = async () => {
    try {
      const result = await ProductService.getProducts();
      if (!result.error && result.data) {
        // Filter for gift-appropriate products
        const gifts = result.data.filter(product => 
          product.category?.toLowerCase().includes('electronics') ||
          product.category?.toLowerCase().includes('fashion') ||
          product.category?.toLowerCase().includes('home')
        ).slice(0, 12);
        setGiftProducts(gifts);
      }
    } catch (error) {
      console.error('Error fetching gift recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Gift className="w-6 h-6 text-orange-500" />
                <h1 className="text-xl font-semibold">Gift Recommendations</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Perfect Gift Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100">
                Discover thoughtful gifts for your loved ones. From electronics to fashion, 
                find the perfect present for any occasion.
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {giftProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, source: 'vendor' as const }}
                onQuickView={() => {}}
                showQuickView={false}
                onAddToCart={onAddToCart}
                onToggleLike={onToggleLike}
                isLiked={likedItems.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftRecommendations;
