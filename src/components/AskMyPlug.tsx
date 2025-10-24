import { useState, useEffect } from "react";
import { Send, Plus, History, Menu, Home, Share2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { AIService } from "@/services/aiService";
import { ProductService } from '@/services/productService';
import TierUpgradeModal from "@/components/TierUpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { ConversationService } from "@/services/conversationService";
import { SharingService } from "@/services/sharingService";
import ShareButton from "./ShareButton";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  type: 'user' | 'myplug';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: Date;
  preview: string;
}

interface JumiaProduct {
  name: string;
  price: string;
  rating: string;
  link: string;
  image: string;
}

interface AskMyPlugProps {
  onBack: () => void;
  user: any;
  onAddToCart: (product: any) => void;
  onToggleLike: (productId: string) => void;
  likedItems: string[];
  maxChats: number;
  onUpgrade: () => void;
}

const AskMyPlug = ({ onBack, user, onAddToCart, onToggleLike, likedItems, maxChats, onUpgrade }: AskMyPlugProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [productResults, setProductResults] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [jumiaResults, setJumiaResults] = useState<JumiaProduct[]>([]);
  const [chatCount, setChatCount] = useState(user?.chat_count || 0);
  const [showTierModal, setShowTierModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("myplug_chat_history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert lastMessage back to Date
        setChatHistory(parsed.map((c: any) => ({ ...c, lastMessage: new Date(c.lastMessage) })));
      } catch {
        setChatHistory([]);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("myplug_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('myplug_dark_mode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('myplug_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loadConversations = async () => {
    try {
      const convs = await ConversationService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversation = async () => {
    if (messages.length === 0) return;
    
    try {
      setIsLoading(true);
      const conversationId = currentConversationId || Date.now().toString();
      
      const conversation = await ConversationService.saveConversation(
        conversationId,
        messages.map(msg => ({
          id: msg.id.toString(),
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp,
          productResults: msg.type === 'myplug' ? productResults : null
        })),
        messages[0]?.content?.substring(0, 50) + '...'
      );

      if (conversation) {
        setCurrentConversationId(conversation.id);
        await loadConversations();
        toast({
          title: 'Conversation saved',
          description: 'Your conversation has been saved successfully'
        });
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save conversation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const convMessages = await ConversationService.getConversationMessages(conversationId);
      
      setMessages(convMessages.map(msg => ({
        id: parseInt(msg.id),
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      })));
      
      setCurrentConversationId(conversationId);
      
      // Load product results from the last message
      const lastMessage = convMessages[convMessages.length - 1];
      if (lastMessage?.productResults) {
        setProductResults(lastMessage.productResults);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Load failed',
        description: 'Failed to load conversation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareConversation = async () => {
    if (!currentConversationId) {
      toast({
        title: 'No conversation to share',
        description: 'Please save the conversation first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (!conversation) return;

      const result = await SharingService.shareConversation(user.id, currentConversationId);
      await SharingService.copyToClipboard(result.share_url);
      toast({
        title: 'Conversation shared!',
        description: 'Share link copied to clipboard'
      });
    } catch (error) {
      console.error('Error sharing conversation:', error);
      toast({
        title: 'Share failed',
        description: 'Failed to share conversation. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    if (chatCount >= maxChats) {
      setShowTierModal(true);
      if (onUpgrade) onUpgrade();
      return;
    }

    const newUserMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Add to chat history if it's a new topic
    if (messages.length === 0) {
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title: currentMessage.length > 32 ? currentMessage.slice(0, 32) + '...' : currentMessage,
        lastMessage: new Date(),
        preview: currentMessage
      };
      setChatHistory(prev => [newChat, ...prev]);
    } else if (chatHistory.length > 0) {
      // Update lastMessage/preview for the most recent chat
      setChatHistory(prev => [
        { ...prev[0], lastMessage: new Date(), preview: currentMessage },
        ...prev.slice(1)
      ]);
    }

    // Call AIService for MyPlug response
    try {
      const aiResult = await AIService.processMessage(
        currentMessage,
        user,
        messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp
        }))
      );

      // NEW: Use structuredCategoryInfo for precise product search
      let ownProducts: any[] = [];
      if (aiResult.structuredCategoryInfo && (aiResult.structuredCategoryInfo.main_category || aiResult.structuredCategoryInfo.subcategory)) {
        const filters: any = {};
        if (aiResult.structuredCategoryInfo.main_category) filters.category = aiResult.structuredCategoryInfo.main_category;
        if (aiResult.structuredCategoryInfo.subcategory) filters.subcategory = aiResult.structuredCategoryInfo.subcategory;
        if (aiResult.structuredCategoryInfo.sub_subcategory) filters.sub_subcategory = aiResult.structuredCategoryInfo.sub_subcategory;
        if (aiResult.structuredCategoryInfo.min_price !== undefined) filters.minPrice = aiResult.structuredCategoryInfo.min_price;
        if (aiResult.structuredCategoryInfo.max_price !== undefined) filters.maxPrice = aiResult.structuredCategoryInfo.max_price;
        const { data } = await ProductService.getProducts({ filters, limit: 15 });
        ownProducts = data;
      }

      // If aiResult contains products and jumiaProducts, combine and limit
      let combinedProducts: any[] = [];
      if (ownProducts.length > 0 || (aiResult as any).jumiaProducts) {
        const jumia = (aiResult as any).jumiaProducts || [];
        combinedProducts = [...ownProducts, ...jumia.slice(0, Math.max(0, 15 - ownProducts.length))];
        setProductResults(combinedProducts);
        setJumiaResults(jumia.slice(0, Math.max(0, 15 - ownProducts.length)));
      } else if ((aiResult as any).products || (aiResult as any).jumiaProducts) {
        const own = (aiResult as any).products || [];
        const jumia = (aiResult as any).jumiaProducts || [];
        combinedProducts = [...own, ...jumia.slice(0, Math.max(0, 15 - own.length))];
        setProductResults(combinedProducts);
        setJumiaResults(jumia.slice(0, Math.max(0, 15 - own.length)));
      } else {
        setProductResults([]);
        setJumiaResults([]);
      }
      const myplugResponse: Message = {
        id: Date.now() + 1,
        type: 'myplug',
        content: aiResult.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, myplugResponse]);
      setChatCount(prev => prev + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'myplug',
        content: "Sorry, I'm having trouble connecting to the AI service.",
        timestamp: new Date()
      }]);
      setProductResults([]);
      setJumiaResults([]);
    }

    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <SidebarProvider>
      {/* Dynamic background based on dark mode */}
      <div className={`min-h-screen flex w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Sidebar className={`border-r md:w-80 w-full transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <SidebarHeader className={`p-3 sm:p-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug App Icon" className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>MyPlug Chat</span>
              </div>
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={startNewChat}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </SidebarHeader>
          
          <SidebarContent className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div className={`flex items-center space-x-2 text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Saved Conversations</span>
                </div>
                {messages.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveConversation}
                    disabled={isLoading}
                    className={`text-xs w-full sm:w-auto transition-colors duration-300 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {isLoading ? 'Saving...' : 'Save Chat'}
                  </Button>
                )}
              </div>
              
              <SidebarMenu>
                {conversations.length === 0 ? (
                  <div className={`text-xs px-3 py-6 text-center transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No saved conversations</div>
                ) : (
                  conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton 
                        onClick={() => loadConversation(conversation.id)}
                        className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-xs sm:text-sm truncate transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {conversation.title}
                          </div>
                          <div className={`text-xs truncate mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {conversation.preview}
                          </div>
                          <div className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className={`flex-1 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-3 sm:p-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <img src="/lovable-uploads/myplug-logo.png" alt="Ask MyPlug Logo" className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h1 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>MyPlug</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 hover:scale-105 transition-transform flex items-center text-sm" onClick={onBack}>
                  <Home className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className={`flex-1 p-3 sm:p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <img src="/lovable-uploads/myplug-logo.png" alt="Ask MyPlug Logo" className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4" />
                  <h2 className={`text-xl sm:text-2xl font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Hi! MyPlug here👋
                  </h2>
                  <p className={`text-sm sm:text-base mb-6 max-w-md leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tell me what you want - I'll ask about your budget and preferences - I'll instantly display the best products curated just for you - you can then proceed to checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto px-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-colors duration-300 ${
                          message.type === 'user'
                            ? 'bg-orange-500 text-white'
                            : isDarkMode 
                              ? 'bg-gray-800 border border-gray-600 text-gray-100'
                              : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        {message.type === 'myplug' && (
                          <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                            <img src="/lovable-uploads/myplug-logo.png" alt="Ask MyPlug Logo" className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium text-orange-500">MyPlug</span>
                          </div>
                        )}
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1 sm:mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Product Results */}
            {productResults.length > 0 && (
              <div className="mt-4 sm:mt-8 px-3 sm:px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Product Results</h3>
                  <div className="flex space-x-2">
                    {currentConversationId && (
                      <ShareButton
                        contentType="conversation"
                        contentId={currentConversationId}
                        contentTitle={messages[0]?.content?.substring(0, 50) + '...'}
                        variant="outline"
                        size="sm"
                        showText={true}
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {productResults.map((prod, idx) => (
                    prod.link ? (
                      // Jumia product card
                      <a
                        key={prod.link + idx}
                        href={prod.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-colors duration-300 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
                            : 'border-orange-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <img src={prod.image} alt={prod.name} className="h-24 sm:h-32 w-full object-contain mb-2" />
                        <div className={`font-medium mb-1 text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{prod.name}</div>
                        <div className="text-orange-500 font-bold mb-1 text-sm sm:text-base">{prod.price}</div>
                        <div className={`text-xs mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{prod.rating}</div>
                        <span className={`inline-block text-xs px-2 py-1 rounded transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-orange-900 text-orange-300' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>External • Jumia</span>
                      </a>
                    ) : (
                      // Own product card
                      <div key={prod.id || idx} className={`block border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}>
                        <div className="relative">
                          <img src={prod.main_image || '/placeholder.svg'} alt={prod.name} className="h-24 sm:h-32 w-full object-contain mb-2" />
                          <div className="absolute top-2 right-2">
                            <ShareButton
                              contentType="product"
                              contentId={prod.id}
                              contentTitle={prod.name}
                              contentImage={prod.main_image}
                              variant="outline"
                              size="sm"
                              showText={false}
                            />
                          </div>
                        </div>
                        <div className={`font-medium mb-1 text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{prod.name}</div>
                        <div className="text-orange-500 font-bold mb-1 text-sm sm:text-base">KES {prod.price}</div>
                        <div className={`text-xs mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{prod.rating || 'No rating'}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={`p-3 sm:p-4 border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask MyPlug about products, prices, recommendations..."
                    className={`flex-1 rounded-full text-sm sm:text-base transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className={`text-xs mt-2 text-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  MyPlug can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
      <TierUpgradeModal
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        onPay={() => { setShowTierModal(false); if (onUpgrade) onUpgrade(); }}
        loading={false}
      />
    </SidebarProvider>
  );
};

export default AskMyPlug;
