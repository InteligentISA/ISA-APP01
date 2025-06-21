
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, Heart, ShoppingCart, Star, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GiftsSectionProps {
  user: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
}

const GiftsSection = ({ user, onBack, onAddToCart }: GiftsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState("surprise");
  const { toast } = useToast();

  const giftCategories = [
    { id: "surprise", name: "Surprise Me", icon: "✨" },
    { id: "birthday", name: "Birthday", icon: "🎂" },
    { id: "anniversary", name: "Anniversary", icon: "💝" },
    { id: "graduation", name: "Graduation", icon: "🎓" },
    { id: "wedding", name: "Wedding", icon: "💒" },
    { id: "holiday", name: "Holiday", icon: "🎄" }
  ];

  const surpriseGifts = [
    {
      id: "gift-1",
      name: "Mystery Tech Bundle",
      price: "KES 5,000 - 15,000",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop",
      description: "A surprise selection of tech gadgets",
      rating: "4.8 (120 reviews)"
    },
    {
      id: "gift-2", 
      name: "Fashion Surprise Box",
      price: "KES 3,000 - 10,000",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop",
      description: "Curated fashion items for any style",
      rating: "4.6 (89 reviews)"
    },
    {
      id: "gift-3",
      name: "Home Comfort Package",
      price: "KES 4,000 - 12,000", 
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=300&fit=crop",
      description: "Cozy home essentials and decor",
      rating: "4.7 (95 reviews)"
    }
  ];

  const handleAddToCart = (gift: any) => {
    onAddToCart(gift);
    toast({
      title: "Gift added to cart!",
      description: `${gift.name} has been added to your cart.`,
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
              src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
              alt="ISA Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-900">Gifts & Surprises</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <Gift className="inline w-8 h-8 mr-2 text-yellow-500" />
            Perfect Gifts for Every Occasion
          </h2>
          <p className="text-gray-600">Let ISA help you find the perfect surprise for your loved ones</p>
        </div>

        {/* Gift Categories */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Occasion</h3>
          <div className="flex flex-wrap gap-3">
            {giftCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Surprise Gifts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              <Sparkles className="inline w-6 h-6 mr-2 text-yellow-500" />
              Surprise Packages
            </h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              ISA Curated
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surpriseGifts.map((gift) => (
              <Card key={gift.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Surprise
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{gift.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{gift.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{gift.rating}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {gift.price}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(gift)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Buy Surprise
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Gift Builder */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-center">
                <Sparkles className="inline w-6 h-6 mr-2 text-purple-600" />
                Create Custom Surprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                Tell ISA about the person and let AI create the perfect surprise package
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Recipient's age" />
                <Input placeholder="Budget range (e.g., 5000-10000)" />
                <Input placeholder="Their interests/hobbies" className="md:col-span-2" />
                <Input placeholder="Special occasion details" className="md:col-span-2" />
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Let ISA Create Surprise
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GiftsSection;
