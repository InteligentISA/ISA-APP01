
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [messages, setMessages] = useState([
    {
      type: 'isa',
      content: `👋 Hey ${user?.name || 'there'}! ☺️\n\nI'm ISA — your personal shopping assistant.\n\nI can help you:\n🛍️ Compare products (mobiles, beauty, clothing, etc.)\n💸 Find the best prices and deals\n🤔 Make smarter buying decisions\n\nJust tell me what you're shopping for (e.g., "Best speaker under KES2000").\n\nReady? What are you looking for today?`
    }
  ]);

  const handleSendMessage = () => {
    if (query.trim()) {
      // Add user message
      setMessages(prev => [...prev, { type: 'user', content: query }]);
      
      // Navigate to Ask ISA with the query
      onNavigateToAskISA(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-center p-4 z-50">
      <div className="w-full max-w-4xl h-[75vh] relative">
        {/* Top buttons */}
        <div className="flex gap-4 mb-4 px-8">
          <Button
            onClick={onNavigateToGifts}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg py-4 h-14 text-lg font-medium"
          >
            <Gift className="w-5 h-5 mr-3" />
            Gift someone
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white/90 border-gray-300 text-gray-700 hover:bg-white py-4 h-14 text-lg font-medium"
          >
            <Home className="w-5 h-5 mr-3" />
            Proceed to app
          </Button>
        </div>

        {/* Main chatbot card */}
        <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* ISA Avatar and Header */}
            <div className="text-center p-8 pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                ISA
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 px-8 pb-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Input at Bottom */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Type what you're looking for..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-14 py-4 text-lg border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white shadow-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg h-10 w-10"
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
