import { useState, useEffect, useRef } from "react";
import { Send, Plus, History, Home, Moon, Sun, ShoppingCart as CartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarInset
} from "@/components/ui/sidebar";
import TierUpgradeModal from "@/components/TierUpgradeModal";
import ChatProductCard from "@/components/ChatProductCard";
import ChatProductDetailPopup from "@/components/ChatProductDetailPopup";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

interface ChatMessage {
  id: string;
  type: 'user' | 'myplug';
  content: string;
  timestamp: Date;
  products?: any[];
}

interface AskMyPlugProps {
  onBack: () => void;
  user: any;
  onAddToCart: (product: any) => void;
  onToggleLike: (productId: string) => void;
  likedItems: string[];
  maxChats: number;
  onUpgrade: () => void;
  onViewProduct?: (product: any) => void;
  onOpenCart?: () => void;
}

// Inner component that can use useSidebar
const AskMyPlugInner = ({ onBack, user, onAddToCart, onToggleLike, likedItems, maxChats, onUpgrade, onViewProduct, onOpenCart }: AskMyPlugProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const [chatCount, setChatCount] = useState(user?.chat_count || 0);
  const [showTierModal, setShowTierModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPopupProduct, setSelectedPopupProduct] = useState<any>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setOpen } = useSidebar();

  useEffect(() => {
    const saved = localStorage.getItem('myplug_dark_mode');
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('myplug_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      loadConversation(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', authUser.id)
        .order('updated_at', { ascending: false });
      if (!error && data) setConversations(data);
    } catch (error) { console.error('Error loading conversations:', error); }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true });
      if (!error && data) {
        const loaded: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          type: msg.role === 'user' ? 'user' : 'myplug',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          products: (msg.metadata as any)?.products || undefined
        }));
        setMessages(loaded);
        setCurrentConversationId(conversationId);
      }
      // Collapse sidebar on mobile after selecting
      setOpen(false);
    } catch (error) { console.error('Error loading conversation:', error); }
    finally { setIsLoading(false); }
  };

  const saveMessageToDb = async (conversationId: string, msg: ChatMessage) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        user_id: authUser.id,
        role: msg.type === 'user' ? 'user' : 'myplug',
        content: msg.content,
        metadata: msg.products ? { products: msg.products } : null
      });
    } catch (error) { console.error('Error saving message:', error); }
  };

  const createOrUpdateConversation = async (title: string, preview: string): Promise<string | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;
      if (currentConversationId) {
        await supabase.from('chat_conversations')
          .update({ preview: preview.substring(0, 500), updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
        return currentConversationId;
      }
      const { data, error } = await supabase.from('chat_conversations')
        .insert({ user_id: authUser.id, title: title.substring(0, 100), preview: preview.substring(0, 500) })
        .select().single();
      if (error) throw error;
      return data.id;
    } catch (error) { console.error('Error creating conversation:', error); return null; }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isSending) return;
    if (chatCount >= maxChats) {
      setShowTierModal(true);
      if (onUpgrade) onUpgrade();
      return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), type: 'user', content: currentMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const messageText = currentMessage;
    setCurrentMessage("");
    setIsSending(true);

    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createOrUpdateConversation(
          messageText.length > 50 ? messageText.slice(0, 50) + '...' : messageText, messageText
        );
        if (convId) setCurrentConversationId(convId);
      } else {
        await createOrUpdateConversation('', messageText);
      }

      if (convId) await saveMessageToDb(convId, userMsg);

      const { data: chatResult, error: chatError } = await supabase.functions.invoke('myplug-chat', {
        body: {
          message: messageText,
          userId: user?.id,
          conversationHistory: messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
        }
      });

      if (chatError) throw chatError;

      const products = chatResult?.products || [];
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'myplug',
        content: chatResult?.response || "I couldn't process that. Could you try again?",
        timestamp: new Date(),
        products: products.length > 0 ? products : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
      setChatCount(prev => prev + 1);
      if (convId) await saveMessageToDb(convId, assistantMsg);
      await loadConversations();
    } catch (err) {
      console.error('MyPlug chat error:', err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), type: 'myplug',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      }]);
    } finally { setIsSending(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setOpen(false);
  };

  const handleViewProduct = (product: any) => {
    setSelectedPopupProduct(product);
    setShowProductPopup(true);
  };

  return (
    <>
      <div className={`min-h-screen flex w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Sidebar className={`border-r md:w-80 w-full transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <SidebarHeader className={`p-3 sm:p-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug" className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>MyPlug Chat</span>
              </div>
              <Button onClick={() => setIsDarkMode(!isDarkMode)} variant="ghost" size="sm"
                className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={startNewChat} className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm" size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Chat
            </Button>
          </SidebarHeader>
          
          <SidebarContent className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
            <div className="p-3 sm:p-4">
              <div className={`flex items-center space-x-2 text-xs sm:text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Conversations</span>
              </div>
              <SidebarMenu>
                {conversations.length === 0 ? (
                  <div className={`text-xs px-3 py-6 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No conversations yet</div>
                ) : (
                  conversations.map((conv) => (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton 
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full text-left p-2 sm:p-3 rounded-lg ${
                          currentConversationId === conv.id 
                            ? isDarkMode ? 'bg-gray-700' : 'bg-orange-50' 
                            : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{conv.title}</div>
                          <div className={`text-xs truncate mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conv.preview}</div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-3 sm:p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SidebarTrigger className="md:hidden" />
                <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug" className="h-5 w-5 sm:h-6 sm:w-6" />
                <h1 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>MyPlug</h1>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 text-sm" onClick={onBack}>
                <Home className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4" ref={scrollRef}>
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug" className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4" />
                  <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Hi! MyPlug here👋
                  </h2>
                  <p className={`text-sm sm:text-base mb-6 max-w-md leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tell me what you want - I'll ask about your budget and preferences - I'll instantly display the best products curated just for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto pb-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-orange-500 text-white'
                            : isDarkMode 
                              ? 'bg-gray-800 border border-gray-600 text-gray-100'
                              : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {message.type === 'myplug' && (
                            <div className="flex items-center space-x-2 mb-1">
                              <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug" className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs font-medium text-orange-500">MyPlug</span>
                            </div>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {message.products && message.products.length > 0 && (
                        <div className="mt-3 space-y-3">
                          <p className={`text-sm font-medium px-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            🛍️ Here are {message.products.length} products we found for you:
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {message.products.map((product: any, idx: number) => (
                              <ChatProductCard
                                key={product.id || idx}
                                product={product}
                                onAddToCart={onAddToCart}
                                onToggleLike={() => onToggleLike(product.id || product)}
                                onViewProduct={handleViewProduct}
                                isLiked={likedItems.includes(product.id)}
                                isDarkMode={isDarkMode}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className={`px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          <img src="/lovable-uploads/myplug-logo.png" alt="MyPlug" className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className={`p-3 sm:p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask MyPlug about products..."
                    disabled={isSending}
                    className={`flex-1 rounded-full text-sm sm:text-base ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isSending}
                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
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

      {/* Product Detail Popup */}
      <ChatProductDetailPopup
        product={selectedPopupProduct}
        isOpen={showProductPopup}
        onClose={() => setShowProductPopup(false)}
        onAddToCart={onAddToCart}
        onToggleLike={(p) => onToggleLike(p.id || p)}
        isLiked={selectedPopupProduct ? likedItems.includes(selectedPopupProduct.id) : false}
      />
    </>
  );
};

const AskMyPlug = (props: AskMyPlugProps) => {
  return (
    <SidebarProvider>
      <AskMyPlugInner {...props} />
    </SidebarProvider>
  );
};

export default AskMyPlug;