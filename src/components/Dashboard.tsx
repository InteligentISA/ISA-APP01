import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingCart, Search, LogOut, Menu, Star, MessageCircle, User, Moon, Sun, Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import ProductGrid from "@/components/ProductGrid";
import ProfileModal from "@/components/ProfileModal";
import CartModal from "@/components/CartModal";
import LikedItemsModal from "@/components/LikedItemsModal";
import WelcomeChatbot from "@/components/WelcomeChatbot";
import { Product } from "@/types/product";
import { OrderService } from "@/services/orderService";
import { ProductService } from '@/services/productService';
import { DashboardProduct } from '@/types/product';
import { CustomerBehaviorService } from '@/services/customerBehaviorService';
import { JumiaInteractionService } from '@/services/jumiaInteractionService';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onNavigateToAskISA: () => void;
  onNavigateToGifts: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const Dashboard = ({ user, onLogout, onNavigateToAskISA, onNavigateToGifts, onUserUpdate }: DashboardProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLikedItems, setShowLikedItems] = useState(false);
  const [showWelcomeChatbot, setShowWelcomeChatbot] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;
  const [totalVendorCount, setTotalVendorCount] = useState(0);
  const [vendorPages, setVendorPages] = useState(1);
  const [likedJumiaItems, setLikedJumiaItems] = useState<string[]>([]);
  const [jumiaInteractionsLoading, setJumiaInteractionsLoading] = useState(false);

  // Get the most common 6 categories from VendorProductManagement
  const categories = ["All", "Electronics", "Fashion", "Home & Living", "Health & Beauty", "Books & Stationery", "Baby Products"];

  // Load user's liked Jumia products from backend
  const loadLikedJumiaProducts = async () => {
    if (!user?.id) return;
    
    setJumiaInteractionsLoading(true);
    try {
      const { data: likedJumiaInteractions } = await JumiaInteractionService.getLikedJumiaProducts(user.id);
      const likedJumiaIds = likedJumiaInteractions.map(interaction => interaction.jumia_product_id);
      setLikedJumiaItems(likedJumiaIds);
    } catch (error) {
      console.error('Error loading liked Jumia products:', error);
    } finally {
      setJumiaInteractionsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      OrderService.getCartItems(user.id),
      OrderService.getWishlistItems(user.id),
      loadLikedJumiaProducts()
    ]).then(([cart, wishlist]) => {
      setCartItems(cart);
      setLikedItems(wishlist);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    setProductLoading(true);
    setProductError(null);
    ProductService.getDashboardProducts(currentPage, PRODUCTS_PER_PAGE, debouncedSearchQuery, selectedCategory)
      .then(({ data, error, totalVendorCount }) => {
        if (error) {
          setProductError('Failed to load products');
        } else {
          setProducts(data);
          setTotalVendorCount(totalVendorCount);
          // Calculate total pages: vendor pages + unlimited Jumia pages
          const vendorPages = Math.ceil((totalVendorCount || 0) / PRODUCTS_PER_PAGE);
          setVendorPages(vendorPages);
        }
      })
      .catch(() => setProductError('Failed to load products'))
      .finally(() => setProductLoading(false));
  }, [currentPage, debouncedSearchQuery, selectedCategory]);

  const handleAddToCart = async (product) => {
    if (!user?.id) return;
    try {
      await OrderService.addToCart(user.id, {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        quantity: 1,
        price: product.price,
      });
      const updatedCart = await OrderService.getCartItems(user.id);
      setCartItems(updatedCart);
      toast({ title: "Added to cart!", description: "Item has been added to your shopping cart." });
    } catch (e) {
      toast({ title: "Failed to add to cart", description: e.message || "Please try again." });
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    if (!user?.id) return;
    try {
      await OrderService.removeFromCart(cartItemId);
      const updatedCart = await OrderService.getCartItems(user.id);
      setCartItems(updatedCart);
      toast({ title: "Removed from cart", description: "Item has been removed from your cart." });
    } catch (e) {
      toast({ title: "Failed to remove from cart", description: e.message || "Please try again." });
    }
  };

  const handleToggleLike = async (product) => {
    if (product.source === 'jumia') {
      try {
        const isCurrentlyLiked = likedJumiaItems.includes(product.id);
        
        if (isCurrentlyLiked) {
          // Unlike the product
          await JumiaInteractionService.unlikeJumiaProduct(user.id, product.id);
          setLikedJumiaItems(prev => prev.filter(id => id !== product.id));
          
          // Track the unlike interaction
          await JumiaInteractionService.trackInteraction(
            user.id,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              link: product.link,
              image: product.image
            },
            'unlike'
          );
          
          toast({ title: "Removed from favorites", description: "Product removed from your favorites." });
        } else {
          // Like the product
          await JumiaInteractionService.trackInteraction(
            user.id,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              link: product.link,
              image: product.image
            },
            'like',
            {
              category: 'electronics', // Default category for Jumia products
              source: 'jumia'
            }
          );
          
          setLikedJumiaItems(prev => [...prev, product.id]);
          toast({ title: "Added to favorites!", description: "Product added to your favorites." });
        }
      } catch (error) {
        console.error('Error toggling Jumia product like:', error);
        toast({ 
          title: "Error", 
          description: "Failed to update favorites. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // existing vendor like logic
      if (!user?.id) return;
      const alreadyLiked = likedItems.some(item => item.product_id === product.id);
      try {
        if (alreadyLiked) {
          OrderService.removeFromWishlist(user.id, product.id);
        } else {
          OrderService.addToWishlist(user.id, {
            product_id: product.id,
            product_name: product.name,
            product_category: product.category,
          });
        }
        // Update wishlist UI
        OrderService.getWishlistItems(user.id).then(setLikedItems);
      } catch (e) {}
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  const handleNavigateToAskISAWithQuery = (query?: string) => {
    setShowWelcomeChatbot(false);
    onNavigateToAskISA();
  };

  const handleNavigateToGiftsFromChatbot = () => {
    setShowWelcomeChatbot(false);
    onNavigateToGifts();
  };

  // Helper to convert string IDs to numbers (filter out NaN)
  const likedItemsNumber = likedItems.map(item => Number(item.product_id)).filter(id => !isNaN(id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img 
                src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
                alt="ISA Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">ISA</h1>
            </div>
            
            {/* Search - Hidden on mobile, shown in mobile menu */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 animate-pulse shadow-lg"
                onClick={onNavigateToAskISA}
              >
                <MessageCircle className="w-5 h-5" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative isa-gold-bg text-black rounded-full hover:bg-yellow-500 shadow-lg"
                onClick={onNavigateToGifts}
              >
                <Gift className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                onClick={() => setShowLikedItems(true)}
              >
                <Heart className="w-5 h-5" />
                {(likedItems.length + likedJumiaItems.length) > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {likedItems.length + likedJumiaItems.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500 text-white">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setShowProfile(true)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden lg:inline">{user?.name || user?.email || 'User'}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600 dark:text-gray-300"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {theme === "light" ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={onNavigateToAskISA}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask ISA
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="isa-gold-bg text-black"
                  onClick={onNavigateToGifts}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Gifts
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLikedItems(true)}
                  className="text-red-500"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites ({likedItems.length + likedJumiaItems.length})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className="text-blue-500"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cartItems.length})
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="text-gray-700 dark:text-gray-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLogout}
                  className="text-gray-600 dark:text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Categories */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className={`rounded-full text-xs sm:text-sm ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={onNavigateToAskISA}
              size="sm"
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 animate-pulse shadow-lg text-xs sm:text-sm"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Ask ISA
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToGifts}
              size="sm"
              className="rounded-full isa-gold-bg text-black hover:bg-yellow-500 border-none shadow-lg text-xs sm:text-sm"
            >
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Gifts
            </Button>
          </div>
        </div>

        {/* Products */}
        {productLoading ? (
          <div className="flex items-center justify-center py-12">
            <span>Loading products...</span>
          </div>
        ) : productError ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-red-600">{productError}</span>
          </div>
        ) : (
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            likedItems={
              products.length > 0 && products[0].source === 'jumia'
                ? likedJumiaItems
                : likedItems.map(item => item.product_id)
            }
            currentPage={currentPage}
            vendorPages={vendorPages}
            totalVendorCount={totalVendorCount}
            onNextPage={() => setCurrentPage(p => p + 1)}
            onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
          />
        )}
      </div>

      <ProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
      />

      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        user={user}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={async (cartItemId, quantity) => {
          await OrderService.updateCartItem(cartItemId, quantity);
          const updatedCart = await OrderService.getCartItems(user.id);
          setCartItems(updatedCart);
        }}
      />

      <LikedItemsModal
        isOpen={showLikedItems}
        onClose={() => setShowLikedItems(false)}
        likedItems={likedItems}
        likedJumiaItems={likedJumiaItems}
        onAddToCart={handleAddToCart}
        onRemoveFromLiked={async (productId) => {
          await handleToggleLike({ id: productId });
        }}
        userId={user?.id}
      />

      <WelcomeChatbot
        isOpen={showWelcomeChatbot}
        onClose={() => setShowWelcomeChatbot(false)}
        user={user}
        onNavigateToGifts={handleNavigateToGiftsFromChatbot}
        onNavigateToAskISA={handleNavigateToAskISAWithQuery}
      />
    </div>
  );
};

export default Dashboard;
