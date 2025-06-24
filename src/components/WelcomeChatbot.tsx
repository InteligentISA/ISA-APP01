
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Gift, Home, Send } from "lucide-react";

interface WelcomeChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onNavigateToGifts: () => void;
  onNavigateToAskISA: (query?: string) => void;
}

const WelcomeChatbot = ({ isOpen, onClose, user, onNavigateToGifts, onNavigateToAskISA }: WelcomeChatbotProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onNavigateToAskISA(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center p-4 z-50">
      <div className="w-full max-w-4xl h-[75vh] relative">
        {/* Top buttons */}
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={onNavigateToGifts}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
          >
            <Gift className="w-4 h-4 mr-2" />
            Gift someone
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/90 border-gray-300 text-gray-700 hover:bg-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Proceed to app
          </Button>
        </div>

        {/* Main chatbot card */}
        <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8 h-full flex flex-col">
            {/* ISA Avatar and Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                ISA
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                👋 Hey {user?.name || 'there'}! ☺️
              </h2>
            </div>

            {/* Welcome Message */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                <p className="text-lg text-gray-800 leading-relaxed">
                  I'm <span className="font-semibold text-purple-600">ISA</span> — your personal shopping assistant.
                </p>
                
                <div className="mt-4 space-y-2">
                  <p className="text-gray-700">I can help you:</p>
                  <div className="space-y-1 ml-2">
                    <p className="text-gray-700">🛍️ Compare products (mobiles, beauty, clothing, etc.)</p>
                    <p className="text-gray-700">💸 Find the best prices and deals</p>
                    <p className="text-gray-700">🤔 Make smarter buying decisions</p>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">
                  Just tell me what you're shopping for (e.g., "Best speaker under KES2000").
                </p>
                
                <p className="mt-4 text-lg font-medium text-purple-600">
                  Ready? What are you looking for today?
                </p>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Type what you're looking for..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-3 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white"
                />
                <Button
                  onClick={handleSearch}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg"
                  disabled={!query.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeChatbot;
