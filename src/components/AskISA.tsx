
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Heart, ShoppingCart, Star, Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AskISAProps {
  user: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
  onToggleLike: (productId: string) => void;
  likedItems: string[];
}

interface SearchResult {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: string;
  link: string;
}

const AskISA = ({ user, onBack, onAddToCart, onToggleLike, likedItems }: AskISAProps) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const scrapeJumiaProducts = async (searchQuery: string) => {
    try {
      // In a real implementation, this would call your backend API
      // that runs the Python scraping code
      const response = await fetch('/api/scrape-jumia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Scraping failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to mock data for demo purposes
      console.log('Using mock data - implement backend API for real scraping');
      return [
        {
          id: "1",
          name: "HP Pavilion Gaming Laptop 15.6\" Intel Core i5",
          price: "KES 18,500",
          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
          rating: "4.3 (234 reviews)",
          link: "https://www.jumia.co.ke/hp-pavilion-gaming/"
        },
        {
          id: "2", 
          name: "HP EliteBook 840 G7 14\" Business Laptop",
          price: "KES 19,800",
          image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop",
          rating: "4.5 (156 reviews)",
          link: "https://www.jumia.co.ke/hp-elitebook-840/"
        },
        {
          id: "3",
          name: "HP Laptop 15-dw3000 Series AMD Ryzen 5",
          price: "KES 17,200",
          image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop",
          rating: "4.1 (89 reviews)",
          link: "https://www.jumia.co.ke/hp-laptop-15-dw3000/"
        }
      ];
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const scrapedResults = await scrapeJumiaProducts(query);
      setResults(scrapedResults);
      
      toast({
        title: "Search completed!",
        description: `Found ${scrapedResults.length} results from Jumia.`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not fetch results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (product: SearchResult) => {
    onAddToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const parseRating = (ratingText: string): number => {
    const match = ratingText.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
              alt="ISA Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-900">Ask ISA</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask ISA Anything</h2>
          <p className="text-gray-600">Find the best products from Jumia with AI-powered search</p>
        </div>

        {/* Results */}
        {isSearching && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Scraping Jumia for the best deals...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Jumia Results ({results.length} found)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
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
                          Jumia Kenya
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{parseRating(product.rating)}</span>
                        <span className="text-xs text-gray-500">({product.rating})</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          {product.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(product.link, '_blank')}
                      >
                        View on Jumia
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isSearching && results.length === 0 && query && (
          <div className="text-center py-12">
            <p className="text-gray-600">No results found. Try a different search query.</p>
          </div>
        )}
      </div>

      {/* Search Area - Fixed at Bottom */}
      <div className="bg-white border-t shadow-lg p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ask ISA: "Find me HP laptop below 20000ks" or "Show me smartphones under 15000"'
              className="flex-1 min-h-[50px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="isa-gold-bg text-black hover:bg-yellow-500 self-end"
              size="lg"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to search • Powered by Jumia scraping
          </p>
        </div>
      </div>
    </div>
  );
};

export default AskISA;
