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
  onNavigateToAskMyPlug: (query?: string) => void;
}

const WelcomeChatbot = ({ isOpen, onClose, user, onNavigateToGifts, onNavigateToAskMyPlug }: WelcomeChatbotProps) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      type: 'myplug',
      content: `Hey ${user?.name || 'there'}! ☺️\n\nThis is MyPlug, your personal shopping assistant.\nI can help you:\n Compare products (mobiles, beauty, clothing, etc.)\n Find the best prices and deals\n Make smarter buying decisions\nJust tell me what you're shopping for (e.g., "Best speaker under KES2000").\nReady? Click the button below?`
    }
  ]);

  const handleSendMessage = () => {
    if (query.trim()) {
      // Add user message
      setMessages(prev => [...prev, { type: 'user', content: query }]);
      
      // Navigate to Ask MyPlug with the query
      onNavigateToAskMyPlug(query);
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
      <div className="w-full max-w-4xl max-h-screen h-auto sm:h-auto relative flex flex-col justify-end">
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
        <Card className="w-full bg-white shadow-2xl border-0 overflow-hidden rounded-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] h-auto">
          <CardContent className="p-0 h-full flex flex-col bg-gray-50">
            {/* MyPlug Avatar and Header */}
            <div className="text-center p-4 sm:p-8 pb-4 sm:pb-6 bg-white">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <img
                  src="ISA-APP01/public/AskISA.ico"
                  alt="MyPlug Logo"
                  className="w-full h-full object-contain bg-white rounded-full shadow"
                />
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 px-4 sm:px-8 pb-4 bg-white min-h-0 flex flex-col items-center justify-center overflow-hidden">
              <div
                className="space-y-4 cursor-pointer max-w-2xl mx-auto"
                onClick={() => onNavigateToAskMyPlug()}
                style={{ userSelect: 'none' }}
              >
                <div className="flex justify-center">
                  <div className="max-w-full p-3 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-left shadow-md">
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {messages[0].content}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cute Ask MyPlug Button (only one, always visible) */}
            <div className="bg-white px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-100 flex flex-col items-center sticky bottom-0 z-10 w-full">
              <Button
                onClick={() => onNavigateToAskMyPlug()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:scale-105 transition-all duration-300 w-full max-w-xs"
                style={{ minWidth: 220 }}
              >
                Ask MyPlug anything for free now
              </Button>
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
