
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
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
  rating: number;
  source: string;
  url: string;
}

const AskISA = ({ user, onBack, onAddToCart, onToggleLike, likedItems }: AskISAProps) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate web scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock search results - in real implementation, this would call a web scraping service
    const mockResults: SearchResult[] = [
      {
        id: "1",
        name: "HP Pavilion Gaming Laptop 15.6\"",
        price: "KES 18,500",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
        rating: 4.3,
        source: "Jumia Kenya",
        url: "#"
      },
      {
        id: "2", 
        name: "HP EliteBook 840 G7 14\"",
        price: "KES 19,800",
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop",
        rating: 4.5,
        source: "Kilimall",
        url: "#"
      },
      {
        id: "3",
        name: "HP Laptop 15-dw3000 Series",
        price: "KES 17,200",
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop",
        rating: 4.1,
        source: "Safaricom Shop",
        url: "#"
      }
    ];
    
    setResults(mockResults);
    setIsSearching(false);
    
    toast({
      title: "Search completed!",
      description: `Found ${mockResults.length} results for your query.`,
    });
  };

  const handleAddToCart = (product: SearchResult) => {
    onAddToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src="/lovable-uploads/216ed5fd-182f-42f9-9af9-a8e6b5a633d9.png" 
              alt="ISA Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-900">Ask ISA</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask ISA Anything</h2>
            <p className="text-gray-600">Find the best products with AI-powered search</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "Find me HP laptop below 20000ks"'
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="isa-gold-bg text-black hover:bg-yellow-500"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isSearching && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Searching the web for the best deals...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Search Results ({results.length} found)
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
                          {product.source}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
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
                        onClick={() => window.open(product.url, '_blank')}
                      >
                        View on {product.source}
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
    </div>
  );
};

export default AskISA;
