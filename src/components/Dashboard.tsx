import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  Heart, 
  ShoppingCart, 
  User, 
  Package, 
  Star,
  TrendingUp,
  Gift,
  Sparkles,
  MessageCircle,
  Home,
  Menu,
  X,
  Plus,
  Minus,
  Eye,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProductService } from "@/services/productService";
import { OrderService } from "@/services/orderService";
import { JumiaService } from "@/services/jumiaService";
import { CustomerBehaviorService } from "@/services/customerBehaviorService";
import { Product, DashboardProduct, DashboardVendorProduct, DashboardJumiaProduct } from "@/types/product";
import { CartItemWithProduct, WishlistItemWithProduct } from "@/types/order";
import ProductCard from "./ProductCard";
import CartModal from "./CartModal";
import WishlistModal from "./WishlistModal";
import ProfileModal from "./ProfileModal";
import WelcomeChatbot from "./WelcomeChatbot";
import AskISA from "./AskISA";
import GiftRecommendations from "./GiftRecommendations";

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [jumiaProducts, setJumiaProducts] = useState<DashboardJumiaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showWelcomeChatbot, setShowWelcomeChatbot] = useState(false);
  const [showAskISA, setShowAskISA] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DashboardProduct | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchJumiaProducts();
    fetchCategories();
    if (user) {
      fetchCartItems();
      fetchWishlistItems();
      // Show welcome chatbot for new users
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcomeChatbot(true);
        localStorage.setItem(`welcome_seen_${user.id}`, 'true');
      }
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const result = await ProductService.getProducts();
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } else {
        const vendorProducts: DashboardVendorProduct[] = result.data.map(product => ({
          ...product,
          source: 'vendor' as const
        }));
        setProducts(vendorProducts);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const fetchJumiaProducts = async () => {
    try {
      const result = await JumiaService.searchProducts("electronics", 1, 20);
      if (result.error) {
        console.error("Failed to load Jumia products:", result.error);
      } else {
        const jumiaProducts: DashboardJumiaProduct[] = result.data.map(product => ({
          id: product.id || `jumia_${Date.now()}_${Math.random()}`,
          name: product.name,
          price: product.price,
          rating: product.rating,
          link: product.link,
          image: product.image,
          source: 'jumia' as const,
          category: 'electronics',
          stock_quantity: 1
        }));
        setJumiaProducts(jumiaProducts);
      }
    } catch (error) {
      console.error("Failed to load Jumia products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await ProductService.getCategories();
      if (!result.error) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    try {
      const result = await OrderService.getCartItems(user.id);
      if (!result.error) {
        setCartItems(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  };

  const fetchWishlistItems = async () => {
    if (!user) return;
    try {
      const result = await OrderService.getWishlistItems(user.id);
      if (!result.error) {
        setWishlistItems(result.data);
        setLikedItems(result.data.map(item => item.product_id));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist items:", error);
    }
  };

  const handleAddToCart = async (product: DashboardProduct) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      await OrderService.addToCart(user.id, {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category || 'general',
        quantity: 1,
        price: product.price
      });
      
      fetchCartItems();
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
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
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isLiked = likedItems.includes(product.id);
      
      if (isLiked) {
        await OrderService.removeFromWishlist(user.id, product.id);
        setLikedItems(prev => prev.filter(id => id !== product.id));
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        await OrderService.addToWishlist(user.id, product.id);
        setLikedItems(prev => [...prev, product.id]);
        toast({
          title: "Added to wishlist!",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
      
      fetchWishlistItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await OrderService.removeFromCart(cartItemId);
      fetchCartItems();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCartQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await OrderService.updateCartItem(cartItemId, quantity);
      fetchCartItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = (product: DashboardProduct) => {
    setSelectedProduct(product);
  };

  const handleNavigateToGifts = () => {
    setShowWelcomeChatbot(false);
    setShowGifts(true);
  };

  const handleNavigateToAskISA = (query?: string) => {
    setShowWelcomeChatbot(false);
    setShowAskISA(true);
  };

  // Combine and filter products
  const allProducts = [...products, ...jumiaProducts];
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show different views based on state
  if (showAskISA) {
    return (
      <AskISA 
        onBack={() => setShowAskISA(false)}
        user={user}
        onAddToCart={handleAddToCart}
        onToggleLike={handleToggleLike}
        likedItems={likedItems}
      />
    );
  }

  if (showGifts) {
    return (
      <GiftRecommendations 
        onBack={() => setShowGifts(false)}
        user={user}
        onAddToCart={handleAddToCart}
        onToggleLike={handleToggleLike}
        likedItems={likedItems}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ShopSmart</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Ask ISA Button */}
              <Button
                onClick={() => setShowAskISA(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask ISA
              </Button>

              {/* Gift Button */}
              <Button
                onClick={() => setShowGifts(true)}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Gift className="w-4 h-4 mr-2" />
                Gifts
              </Button>

              {/* Cart */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>

              {/* Wishlist */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWishlistOpen(true)}
                className="relative"
              >
                <Heart className="w-4 h-4" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>

              {/* Profile */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsProfileOpen(true)}
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name || 'Shopper'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Discover amazing products and great deals today
                </p>
              </div>
              <div className="hidden md:block">
                <Sparkles className="w-16 h-16 text-blue-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{allProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold">{cartItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Wishlist</p>
                  <p className="text-2xl font-bold">{wishlistItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              onClick={() => setSelectedCategory("All")}
              size="sm"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
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
        ) : filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={`${product.source}-${product.id}`}
                product={product}
                onQuickView={handleQuickView}
                showQuickView={true}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isLiked={likedItems.includes(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No products match "${searchQuery}"`
                : `No products in ${selectedCategory} category`
              }
            </p>
          </div>
        )}
      </main>

      {/* Welcome Chatbot */}
      <WelcomeChatbot
        isOpen={showWelcomeChatbot}
        onClose={() => setShowWelcomeChatbot(false)}
        user={user}
        onNavigateToGifts={handleNavigateToGifts}
        onNavigateToAskISA={handleNavigateToAskISA}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        user={user}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        user={user}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={(productId) => {
          // Find the wishlist item and remove it
          const wishlistItem = wishlistItems.find(item => item.product_id === productId);
          if (wishlistItem) {
            handleRemoveFromCart(wishlistItem.id);
          }
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      {/* Quick View Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square">
                <img
                  src={selectedProduct.main_image || selectedProduct.image || '/placeholder.svg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-blue-600">
                    KES {selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.source === 'vendor' && (selectedProduct as DashboardVendorProduct).original_price && (
                    <span className="text-lg text-gray-500 line-through">
                      KES {(selectedProduct as DashboardVendorProduct).original_price!.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(selectedProduct.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({selectedProduct.rating}) • {selectedProduct.source === 'vendor' ? (selectedProduct as DashboardVendorProduct).review_count : 0} reviews
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleLike(selectedProduct)}
                    className={likedItems.includes(selectedProduct.id) ? 'text-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 ${likedItems.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
