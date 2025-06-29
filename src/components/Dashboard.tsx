import { useState } from "react";
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
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLikedItems, setShowLikedItems] = useState(false);
  const [showWelcomeChatbot, setShowWelcomeChatbot] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const categories = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports", "Books"];

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      // Check if product is already in cart
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        toast({
          title: "Already in cart",
          description: "This item is already in your cart.",
        });
        return prev;
      }
      return [...prev, product];
    });
    toast({
      title: "Added to cart!",
      description: "Item has been added to your shopping cart.",
    });
  };

  const handleToggleLike = (productId: string) => {
    setLikedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
                {likedItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {likedItems.length}
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
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
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
                  Favorites ({likedItems.length})
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
        <ProductGrid
          category={selectedCategory}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          likedItems={likedItems}
        />
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
        onRemoveFromCart={(productId) => setCartItems(prev => prev.filter(item => item.id !== productId))}
      />

      <LikedItemsModal
        isOpen={showLikedItems}
        onClose={() => setShowLikedItems(false)}
        likedItems={likedItems}
        onAddToCart={handleAddToCart}
        onRemoveFromLiked={(productId) => setLikedItems(prev => prev.filter(id => id !== productId))}
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
