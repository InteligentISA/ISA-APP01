
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
}

interface ProductGridProps {
  category: string;
  searchQuery: string;
  onAddToCart: (productId: number) => void;
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  cartItems: number[];
}

const ProductGrid = ({ 
  category, 
  searchQuery, 
  onAddToCart, 
  onToggleLike, 
  likedItems, 
  cartItems 
}: ProductGridProps) => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      category: "Electronics",
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: "Premium Leather Jacket",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
      category: "Fashion",
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      name: "Smart Home Speaker",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      category: "Electronics",
      rating: 4.3,
      reviews: 256
    },
    {
      id: 4,
      name: "Minimalist Desk Lamp",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      category: "Home",
      rating: 4.6,
      reviews: 67
    },
    {
      id: 5,
      name: "Organic Face Cream",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop",
      category: "Beauty",
      rating: 4.7,
      reviews: 143
    },
    {
      id: 6,
      name: "Running Shoes",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Sports",
      rating: 4.4,
      reviews: 201
    }
  ]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = category === "All" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-2 right-2 ${
                  likedItems.includes(product.id) ? 'text-red-500' : 'text-gray-400'
                } hover:text-red-500 bg-white/80 backdrop-blur-sm`}
                onClick={() => onToggleLike(product.id)}
              >
                <Heart className={`w-4 h-4 ${likedItems.includes(product.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {product.category}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews})
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product.id)}
                  disabled={cartItems.includes(product.id)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {cartItems.includes(product.id) ? (
                    "Added"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
