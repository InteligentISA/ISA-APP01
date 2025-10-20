import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoPreloader from '@/components/LogoPreloader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Smartphone } from 'lucide-react';
import { SharingService, SharedContent } from '@/services/sharingService';
import { ConversationService } from '@/services/conversationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SharedContentPage() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentData, setContentData] = useState<any>(null);

  useEffect(() => {
    if (shareCode) {
      loadSharedContent();
    }
  }, [shareCode]);

  const loadSharedContent = async () => {
    try {
      setLoading(true);
      const content = await SharingService.getSharedContent(shareCode!);
      
      if (!content) {
        setError('Shared content not found or has expired');
        return;
      }

      setSharedContent(content);
      
      // Load actual content data based on type
      switch (content.content_type) {
        case 'product':
          // Load product details
          setContentData(content.metadata.product);
          break;
        case 'wishlist':
        case 'cart':
          setContentData(content.metadata.items);
          break;
        case 'conversation':
          // Load conversation messages
          const messages = await ConversationService.getConversationMessages(content.content_id);
          setContentData({ ...content.metadata.conversation, messages });
          break;
      }
    } catch (error) {
      console.error('Error loading shared content:', error);
      setError('Failed to load shared content');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.href);
    navigate('/auth');
  };

  const handleViewInApp = () => {
    // Redirect to app or show app download prompt
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open in app, fallback to web
      window.location.href = `myplug://shared/${shareCode}`;
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1000);
    } else {
      toast({
        title: 'Download MyPlug App',
        description: 'Get the MyPlug app for the best experience!',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-500 flex items-center justify-center">
        <LogoPreloader message="Loading shared content..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-orange-500 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Content Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-500">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {sharedContent?.metadata?.title || 'Shared Content'}
              </h1>
              <p className="text-sm text-gray-600">
                Shared by {sharedContent?.user_id ? 'a MyPlug user' : 'someone'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewInApp}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              View in App
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(window.location.href, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!user && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-900">Want to interact with this content?</h3>
                  <p className="text-sm text-orange-700">Sign in to MyPlug to add items to your cart or wishlist</p>
                </div>
                <Button onClick={handleLoginRedirect} className="bg-orange-600 hover:bg-orange-700">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Render content based on type */}
        {sharedContent?.content_type === 'product' && contentData && (
          <ProductContentView product={contentData} />
        )}
        
        {sharedContent?.content_type === 'wishlist' && contentData && (
          <WishlistContentView items={contentData} />
        )}
        
        {sharedContent?.content_type === 'cart' && contentData && (
          <CartContentView items={contentData} />
        )}
        
        {sharedContent?.content_type === 'conversation' && contentData && (
          <ConversationContentView conversation={contentData} />
        )}
      </div>
    </div>
  );
}

// Content view components
function ProductContentView({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {product.name}
          <Badge variant="secondary">Product</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-orange-600">
                KES {product.price?.toLocaleString()}
              </h3>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-600">{product.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Vendor</h4>
              <p className="text-gray-600">{product.vendor_name}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistContentView({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Wishlist ({items.length} items)
          <Badge variant="secondary">Wishlist</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-orange-600 font-bold">
                  KES {item.price?.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CartContentView({ items }: { items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cart ({items.length} items)
          <Badge variant="secondary">Cart</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">
                  KES {(item.price * item.quantity)?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConversationContentView({ conversation }: { conversation: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {conversation.title}
          <Badge variant="secondary">Conversation</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">{conversation.preview}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Continue this conversation</h4>
            <p className="text-sm text-gray-600">
              Sign in to MyPlug to continue this conversation with our AI assistant.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
