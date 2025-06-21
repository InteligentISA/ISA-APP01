
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b sticky top-0 z-40">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 animate-pulse"
                onClick={onNavigateToAskISA}
              >
                <MessageCircle className="w-5 h-5" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="relative isa-gold-bg text-black rounded-full hover:bg-yellow-500"
                onClick={onNavigateToGifts}
              >
                <Gift className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowLikedItems(true)}
              >
                <Heart className="w-5 h-5" />
                {likedItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {likedItems.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                onClick={() => setShowProfile(true)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onLogout}>
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
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={onNavigateToAskISA}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 animate-pulse"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <Sparkles className="w-4 h-4 mr-1" />
              Ask ISA
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToGifts}
              className="rounded-full isa-gold-bg text-black hover:bg-yellow-500"
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
    </div>
  );
};

export default Dashboard;
