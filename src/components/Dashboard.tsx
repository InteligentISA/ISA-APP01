import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { ProductService } from '@/services/productService';
import { OrderService } from '@/services/orderService';
import ProductCard from './ProductCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Filter, Menu, ShoppingCart, Heart } from "lucide-react";
import { DashboardProduct } from '@/types/product';
import CartModal from './CartModal';
import AskISA from './AskISA';

const Dashboard = () => {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DashboardProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showISA, setShowISA] = useState(false);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalVendorCount, setTotalVendorCount] = useState(0);
  const [user, setUser] = useState<any>(null); // Replace Clerk with simple user state
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage or auth context
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    loadProducts();
    loadCategories();
    loadLikedItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, categoryFilter, priceRange, sortOption, sortDirection]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error, totalVendorCount } = await ProductService.getDashboardProducts(page);
      if (error) {
        toast({
          title: "Error loading products",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProducts(data);
        setTotalVendorCount(totalVendorCount);
      }
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await ProductService.getCategories();
      if (error) {
        toast({
          title: "Error loading categories",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCategories(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message || "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  const loadLikedItems = async () => {
    if (!user) return;
    try {
      const items = await OrderService.getWishlistItems(user.id);
      setLikedItems(items.map(item => item.product_id));
    } catch (error: any) {
      toast({
        title: "Error loading wishlist",
        description: error.message || "Failed to load wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (product: DashboardProduct) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      await OrderService.addToCart(user.id, {
        product_id: product.id,
        quantity: 1,
        product_name: product.name,
        product_category: product.source === 'vendor' ? (product as any).category : 'general'
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (product: DashboardProduct) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like items.",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedItems.includes(product.id);

    try {
      if (isLiked) {
        await OrderService.removeFromWishlist(user.id, product.id);
        setLikedItems(prev => prev.filter(id => id !== product.id));
        toast({
          title: "Removed from wishlist",
          description: "Item removed from your wishlist.",
        });
      } else {
        await OrderService.addToWishlist(user.id, {
          product_id: product.id,
          product_name: product.name,
          product_category: product.source === 'vendor' ? (product as any).category || 'general' : 'general'
        });
        setLikedItems(prev => [...prev, product.id]);
        toast({
          title: "Added to wishlist",
          description: "Item added to your wishlist.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.source === 'vendor' && (product as any).description && (product as any).description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => 
        product.source === 'vendor' ? (product as any).category === categoryFilter : false
      );
    }

    filtered = filtered.filter(product => product.price >= priceRange[0] && product.price <= priceRange[1]);

    if (sortOption) {
      filtered.sort((a, b) => {
        const aValue = typeof (a as any)[sortOption] === 'string' ? (a as any)[sortOption].toLowerCase() : (a as any)[sortOption];
        const bValue = typeof (b as any)[sortOption] === 'string' ? (b as any)[sortOption].toLowerCase() : (b as any)[sortOption];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Dashboard Menu</SheetTitle>
                  <SheetDescription>
                    Explore options to manage your account and preferences.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <Button variant="outline" className="justify-start">
                    My Orders
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Account Settings
                  </Button>
                  <Button variant="destructive" className="justify-start">
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="sm" onClick={() => setShowISA(true)}>
              <img src="/AskISA.png" alt="Ask ISA Logo" className="h-5 w-5 mr-2" />
              Ask ISA
            </Button>
          </div>

          <Input
            type="search"
            placeholder="Search for products..."
            className="max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <RadioGroup defaultValue={categoryFilter} onValueChange={setCategoryFilter} className="p-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="all" className="peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-without-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                    <Label htmlFor="all" className="cursor-pointer peer-data-[state=checked]:text-primary">All</Label>
                  </div>
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <RadioGroupItem value={category} id={category} className="peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-without-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                      <Label htmlFor={category} className="cursor-pointer peer-data-[state=checked]:text-primary">{category}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Price Range</DropdownMenuLabel>
                <div className="px-4 py-2">
                  <Slider
                    defaultValue={priceRange}
                    max={1000}
                    step={10}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>KES {priceRange[0]}</span>
                    <span>KES {priceRange[1]}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={() => setShowCart(true)}>
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-2">
                Cart
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured Products Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
          <p className="text-gray-600">Discover our handpicked selection of top-quality products.</p>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <p className="text-gray-600">Explore our wide range of product categories.</p>
        </section>

        {/* Products Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
            </h2>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortOption('name'); setSortDirection('asc'); }}>Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortOption('name'); setSortDirection('desc'); }}>Name (Z-A)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortOption('price'); setSortDirection('asc'); }}>Price (Low to High)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortOption('price'); setSortDirection('desc'); }}>Price (High to Low)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
                  <div className="bg-gray-300 h-6 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              {searchQuery && (
                <Button 
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleLike={handleToggleLike}
                  isLiked={likedItems.includes(product.id)}
                  user={user}
                />
              ))}
            </div>
          )}

          {products.length < totalVendorCount && (
            <div className="text-center mt-8">
              <Button onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        user={user}
        onRemoveFromCart={() => {}}
        onUpdateQuantity={() => {}}
      />

      {showISA && (
        <div className="fixed inset-0 z-50">
          <AskISA
            onBack={() => setShowISA(false)}
            user={user}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            likedItems={likedItems}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
