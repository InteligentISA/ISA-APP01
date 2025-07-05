import { useState, useEffect } from "react";
import { ProductService } from "@/services/productService";
import { Product, DashboardProduct } from "@/types/product";
import ProductCard from "./ProductCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: DashboardProduct[];
  onAddToCart?: (product: DashboardProduct) => void;
  onToggleLike?: (product: DashboardProduct) => void;
  likedItems?: string[];
  showQuickView?: boolean;
  onQuickView?: (product: DashboardProduct) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  currentPage?: number;
  vendorPages?: number;
  totalVendorCount?: number;
}

const ProductGrid = ({ 
  products,
  onAddToCart, 
  onToggleLike, 
  likedItems = [],
  showQuickView = false,
  onQuickView,
  onNextPage,
  onPrevPage,
  currentPage = 1,
  vendorPages = 1,
  totalVendorCount = 0
}: ProductGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No products available</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  const isJumiaPage = currentPage > vendorPages;
  const productsPerPage = 20;

  return (
    <>
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
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-600">
          {isJumiaPage ? (
            <span>Showing Jumia products (Page {currentPage - vendorPages})</span>
          ) : (
            <span>
              Showing {((currentPage - 1) * productsPerPage) + 1} - {Math.min(currentPage * productsPerPage, totalVendorCount)} of {totalVendorCount} vendor products
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrevPage} 
            disabled={currentPage === 1}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          
          <div className="px-4 py-2 text-sm font-medium">
            Page {currentPage}
            {isJumiaPage && (
              <span className="text-gray-500 ml-1">(Jumia)</span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onNextPage}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductGrid;
