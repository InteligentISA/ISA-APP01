
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingCart, Search, LogOut, Menu, Star, MessageCircle, User, Moon, Sun, Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import ProductGrid from "@/components/ProductGrid";
import ProfileModal from "@/components/ProfileModal";
import CartModal from "@/components/CartModal";
import LikedItemsModal from "@/components/LikedItemsModal";
import WelcomeChatbot from "@/components/WelcomeChatbot";

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
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [likedItems, setLikedItems] = useState<number[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showLikedItems, setShowLikedItems] = useState(false);
  const [showWelcomeChatbot, setShowWelcomeChatbot] = useState(true);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const categories = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports", "Books"];

  const handleAddToCart = (productId: number) => {
    setCartItems(prev => [...prev, productId]);
    toast({
      title: "Added to cart!",
      description: "Item has been added to your shopping cart.",
    });
  };

  const handleToggleLike = (productId: number) => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
                alt="ISA Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ISA</h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
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
            
            <div className="flex items-center space-x-4">
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
                <span className="text-sm font-medium">{user.name}</span>
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full ${
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
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 animate-pulse shadow-lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <Sparkles className="w-4 h-4 mr-1" />
              Ask ISA
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToGifts}
              className="rounded-full isa-gold-bg text-black hover:bg-yellow-500 border-none shadow-lg"
            >
              <Gift className="w-4 h-4 mr-2" />
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
          cartItems={cartItems}
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
        onRemoveFromCart={(productId) => setCartItems(prev => prev.filter(id => id !== productId))}
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
