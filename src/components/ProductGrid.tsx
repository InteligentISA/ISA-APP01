import { useState, useEffect } from "react";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  category?: string;
  searchQuery?: string;
  onAddToCart?: (product: Product) => void;
  onToggleLike?: (productId: string) => void;
  likedItems?: string[];
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  limit?: number;
}

const ProductGrid = ({ 
  category, 
  searchQuery = "", 
  onAddToCart, 
  onToggleLike, 
  likedItems = [],
  showQuickView = false,
  onQuickView,
  limit = 20
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;

        if (searchQuery.trim()) {
          // Search products
          result = await ProductService.searchProducts(searchQuery, limit);
        } else if (category && category !== "All") {
          // Get products by category
          result = await ProductService.getProductsByCategory(category, limit);
        } else {
          // Get all products
          result = await ProductService.getProducts({ limit });
        }

        if (result.error) {
          setError("Failed to load products");
          console.error("Product fetch error:", result.error);
        } else {
          setProducts(result.data);
        }
      } catch (err) {
        setError("Failed to load products");
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            {searchQuery 
              ? `No products found for "${searchQuery}"`
              : category && category !== "All"
              ? `No products found in ${category}`
              : "No products available"
            }
          </p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleLike={onToggleLike}
          isLiked={likedItems.includes(product.id)}
          showQuickView={showQuickView}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
