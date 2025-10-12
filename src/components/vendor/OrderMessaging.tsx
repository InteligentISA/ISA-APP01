import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";

interface OrderMessagingProps {
  orderId: string;
  userType: 'customer' | 'vendor';
  userId: string;
}

const OrderMessaging = ({ orderId, userType, userId }: OrderMessagingProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload only image files",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(`order-messages/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      // Insert message with image
      const { error: insertError } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_id: userId,
          sender_type: userType,
          image_url: publicUrl,
          message_text: null
        });

      if (insertError) throw insertError;

      toast({
        title: "Image Sent",
        description: "Your image has been sent successfully",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    // Vendors cannot send text messages
    if (userType === 'vendor') {
      toast({
        title: "Action Not Allowed",
        description: "Vendors can only send images, not text messages",
        variant: "destructive"
      });
      return;
    }

    // Check for contact information in message
    const contactPatterns = [
      /\b\d{10,}\b/, // Phone numbers
      /\b[\w\.-]+@[\w\.-]+\.\w+\b/, // Email addresses
      /\bwhatsapp\b/i,
      /\bcall me\b/i,
      /\bphone\b/i,
      /\bemail\b/i,
    ];

    const hasContactInfo = contactPatterns.some(pattern => pattern.test(messageText));
    if (hasContactInfo) {
      toast({
        title: "Warning",
        description: "Please do not share personal contact information in messages",
        variant: "destructive"
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('order_messages')
        .insert({
          order_id: orderId,
          sender_id: userId,
          sender_type: userType,
          message_text: messageText,
          image_url: null
        });

      if (error) throw error;

      setMessageText("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });

      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning for vendors */}
      {userType === 'vendor' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You can only send images. No text messages or file attachments allowed. Any attempt to exchange contact information will result in account suspension.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for customers */}
      {userType === 'customer' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please do not share personal contact information such as phone numbers or email addresses in messages.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Display */}
      <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No messages yet</p>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={`p-3 ${message.sender_type === userType ? 'ml-auto bg-blue-50' : 'mr-auto bg-white'} max-w-[80%]`}>
              <div className="text-xs text-gray-500 mb-1">
                {message.sender_type === 'vendor' ? 'Vendor' : 'Customer'} • {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
              {message.message_text && (
                <p className="text-sm">{message.message_text}</p>
              )}
              {message.image_url && (
                <img 
                  src={message.image_url} 
                  alt="Message attachment" 
                  className="max-w-full rounded mt-2"
                />
              )}
            </Card>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        {userType === 'customer' && (
          <Textarea
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
            rows={3}
          />
        )}
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {userType === 'customer' && (
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderMessaging;
