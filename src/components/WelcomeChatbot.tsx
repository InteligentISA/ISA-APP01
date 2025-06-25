
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end justify-center p-2 sm:p-4 z-50">
      <div className="w-full max-w-4xl h-[85vh] sm:h-[75vh] relative">
        {/* Top buttons - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4 px-2 sm:px-12">
          <Button
            onClick={onNavigateToGifts}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg py-4 sm:py-5 h-14 sm:h-16 text-base sm:text-lg font-medium rounded-xl"
          >
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Gift someone
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 py-4 sm:py-5 h-14 sm:h-16 text-base sm:text-lg font-medium rounded-xl shadow-lg"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Proceed to app
          </Button>
        </div>

        {/* Main chatbot card */}
        <Card className="h-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl">
          <CardContent className="p-0 h-full flex flex-col bg-gray-50">
            {/* ISA Avatar and Header */}
            <div className="text-center p-4 sm:p-8 pb-4 sm:pb-6 bg-white">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg">
                ISA
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 px-4 sm:px-8 pb-4 bg-white min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-50 border border-gray-200 text-gray-800'
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

            {/* Interactive Chat Section */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 text-center">
                  Try asking ISA something now!
                </h3>
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    type="text"
                    placeholder="Type what you're looking for..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 py-2 sm:py-3 text-sm sm:text-base border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white shadow-sm text-gray-800 placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl h-10 w-10 sm:h-12 sm:w-12 shadow-lg shrink-0"
                    disabled={!query.trim()}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center px-2">
                  Press Enter or click Send to start your shopping journey with ISA
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1.5 sm:p-2 shadow-md"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeChatbot;
