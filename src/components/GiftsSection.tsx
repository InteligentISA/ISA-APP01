import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Heart, ShoppingCart, Star, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/services/aiService";
import { ProductService } from "@/services/productService";

interface GiftsSectionProps {
  user: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
  onToggleLike: (product: any) => void;
  likedItems: string[];
}

const GiftsSection = ({ user, onBack, onAddToCart, onToggleLike, likedItems }: GiftsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState("surprise");
  const { toast } = useToast();

  // State for custom gift builder inputs
  const [recipientAge, setRecipientAge] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const giftCategories = [
    { id: "surprise", name: "Surprise Me", icon: "✨" },
    { id: "birthday", name: "Birthday", icon: "🎂" },
    { id: "anniversary", name: "Anniversary", icon: "💝" },
    { id: "graduation", name: "Graduation", icon: "🎓" },
    { id: "wedding", name: "Wedding", icon: "💒" },
    { id: "holiday", name: "Holiday", icon: "🎄" }
  ];

  const surpriseGifts = [
    {
      id: "gift-1",
      name: "Mystery Tech Bundle",
      price: "KES 5,000 - 15,000",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop",
      description: "A surprise selection of tech gadgets",
      rating: "4.8 (120 reviews)"
    },
    {
      id: "gift-2", 
      name: "Fashion Surprise Box",
      price: "KES 3,000 - 10,000",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop",
      description: "Curated fashion items for any style",
      rating: "4.6 (89 reviews)"
    },
    {
      id: "gift-3",
      name: "Home Comfort Package",
      price: "KES 4,000 - 12,000", 
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=300&fit=crop",
      description: "Cozy home essentials and decor",
      rating: "4.7 (95 reviews)"
    }
  ];

  const handleAddToCart = (gift: any) => {
    onAddToCart(gift);
    toast({
      title: "Gift added to cart!",
      description: `${gift.name} has been added to your cart.`,
    });
  };

  // Handler for "Ask ISA for Help"
  const handleAskISA = async () => {
    setLoading(true);
    setSuggestionLoading(true);
    setSuggestedProducts([]);
    const prompt = `I want to buy a gift. Recipient's age: ${recipientAge || 'unknown'}. Budget: ${budget || 'not specified'}. Interests/hobbies: ${interests || 'not specified'}. Occasion: ${occasion || 'not specified'}. Please suggest a creative and thoughtful gift idea.`;
    try {
      const aiResult = await AIService.processMessage(prompt, user, []);
      // Try to extract a search term from the AI's analysis or response
      let searchTerm = '';
      if (aiResult.analysis && aiResult.analysis.searchTerms && aiResult.analysis.searchTerms.length > 0) {
        searchTerm = aiResult.analysis.searchTerms.join(' ');
      } else {
        // fallback: use the AI's response as a search term
        searchTerm = aiResult.response.split(' ').slice(0, 5).join(' ');
      }
      // Fetch product suggestions
      const { data: products } = await ProductService.searchProducts(searchTerm, 6);
      setSuggestedProducts(products || []);
      if (!products || products.length === 0) {
        toast({
          title: "No products found",
          description: "ISA couldn't find any matching products. Try different details!",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "ISA Error",
        description: "Sorry, I'm having trouble connecting to the AI service.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSuggestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="w-8 h-8 sm:w-10 sm:h-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
            </Button>
            <img 
              src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
              alt="ISA Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Gifts & Surprises</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <Gift className="inline w-6 h-6 sm:w-8 sm:h-8 mr-2 text-yellow-500" />
            Perfect Gifts for Every Occasion
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Let ISA help you find the perfect surprise for your loved ones</p>
        </div>

        {/* Gift Categories */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Choose Occasion</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {giftCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full text-xs sm:text-sm"
                size="sm"
              >
                <span className="mr-1 sm:mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Surprise Gifts Grid */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              <Sparkles className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500" />
              Surprise Packages
            </h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 w-fit">
              ISA Curated
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {surpriseGifts.map((gift) => (
              <Card key={gift.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        Surprise
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{gift.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{gift.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{gift.rating}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {gift.price}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(gift)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Buy Surprise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Gift Builder */}
        <div className="mt-8 sm:mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-center text-gray-900 dark:text-white text-lg sm:text-xl">
                <Sparkles className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600 dark:text-purple-400" />
                Create Custom Surprise
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                Tell ISA about the person and let AI create the perfect surprise package
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input 
                  placeholder="Recipient's age" 
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base"
                  value={recipientAge}
                  onChange={e => setRecipientAge(e.target.value)}
                />
                <Input 
                  placeholder="Budget range (e.g., 5000-10000)" 
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
                <Input 
                  placeholder="Their interests/hobbies" 
                  className="sm:col-span-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base"
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                />
                <Input 
                  placeholder="Special occasion details" 
                  className="sm:col-span-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base"
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Surprise
                </Button>
                <Button variant="outline" className="flex-1 text-sm sm:text-base" onClick={handleAskISA} disabled={loading}>
                  Ask ISA for Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Product Suggestions */}
        {suggestionLoading && (
          <div className="text-center py-6 text-gray-500">Loading suggestions...</div>
        )}
        {suggestedProducts.length > 0 && !suggestionLoading && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">ISA's Gift Suggestions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedProducts.map(product => (
                <Card key={product.id} className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <CardContent className="p-0">
                    <img
                      src={product.main_image || (product.images && product.images[0]) || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-t"
                    />
                    <div className="p-4 space-y-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white text-base">{product.name}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{product.description}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-bold text-orange-600 dark:text-orange-300">KES {product.price.toLocaleString()}</span>
                        <span className="text-gray-500 dark:text-gray-400">Stock: {product.stock_quantity}</span>
                        <span className="flex items-center text-yellow-500"><Star className="w-4 h-4 mr-1" />{product.rating}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant={likedItems.includes(product.id) ? "default" : "outline"}
                          onClick={() => onToggleLike(product)}
                          className={likedItems.includes(product.id) ? "bg-red-500 text-white" : ""}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {likedItems.includes(product.id) ? "Liked" : "Like"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(product)}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-xs sm:text-sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftsSection;
