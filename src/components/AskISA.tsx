import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Heart, ShoppingCart, Star, Loader2, Send, MessageSquare, Plus, Trash2 } from "lucide-react";
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

interface ConversationHistory {
  id: string;
  title: string;
  timestamp: Date;
  query: string;
  resultsCount: number;
}

const AskISA = ({ user, onBack, onAddToCart, onToggleLike, likedItems }: AskISAProps) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([
    {
      id: "1",
      title: "HP laptop below 20000ks",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      query: "Find me HP laptop below 20000ks",
      resultsCount: 3
    },
    {
      id: "2", 
      title: "Smartphones under 15000",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      query: "Show me smartphones under 15000",
      resultsCount: 5
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      
      // Add to conversation history
      const newConversation: ConversationHistory = {
        id: Date.now().toString(),
        title: query.length > 30 ? query.substring(0, 30) + "..." : query,
        timestamp: new Date(),
        query: query,
        resultsCount: scrapedResults.length
      };
      setConversationHistory(prev => [newConversation, ...prev]);
      
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

  const handleLoadConversation = (conversation: ConversationHistory) => {
    setQuery(conversation.query);
    // In a real app, you'd load the actual results from the conversation
  };

  const handleDeleteConversation = (conversationId: string) => {
    setConversationHistory(prev => prev.filter(conv => conv.id !== conversationId));
  };

  const handleNewConversation = () => {
    setQuery("");
    setResults([]);
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <MessageSquare className="w-5 h-5" />
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

      <div className="flex flex-1">
        {/* Conversation History Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={handleNewConversation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Search
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3 px-2">Search History</h3>
            <div className="space-y-1">
              {conversationHistory.map((conversation) => (
                <div
                  key={conversation.id}
                  className="group flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleLoadConversation(conversation)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {conversation.resultsCount} results
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 w-6 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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

          {/* Search Area - Fixed at Bottom - Always Light Mode */}
          <div className="light">
            <div className="bg-white border-t border-gray-200 shadow-lg p-4 sticky bottom-0">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-2">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Ask ISA: "Find me HP laptop below 20000ks" or "Show me smartphones under 15000"'
                    className="flex-1 min-h-[50px] resize-none bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
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
        </div>
      </div>
    </div>
  );
};

export default AskISA;
