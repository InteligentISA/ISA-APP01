import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProductImageLoader from "@/components/ProductImage";

interface GiftsSectionProps {
  user: any;
  onBack: () => void;
  onAddToCart: (product: any) => void;
  onToggleLike: (product: any) => void;
  onViewProduct: (product: any) => void;
  likedItems: string[];
}

const GiftsSection = ({ user, onBack, onAddToCart, onToggleLike, onViewProduct, likedItems }: GiftsSectionProps) => {
  const { toast } = useToast();

  // State for gift finder form
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occasion, setOccasion] = useState("");
  const [interests, setInterests] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  const handleLetISASuggest = async () => {
    if (!age || !interests || !budgetMin || !budgetMax) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Age, Hobbies & Interests, Budget)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSuggestedProducts([]);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('gift-finder', {
        body: {
          age: Number(age),
          gender: gender || 'any',
          relationship: relationship || 'anyone',
          occasion: occasion || 'general',
          hobbies: interests,
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax)
        }
      });

      if (error) throw error;

      const products = result?.products || [];
      if (products.length > 0) {
        setSuggestedProducts(products);
      } else {
        toast({
          title: "No products found",
          description: "MyPlug couldn't find matching products. Try different criteria!",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Gift finder error:', err);
      toast({
        title: "Error",
        description: "Unable to fetch gift suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 space-x-2 sm:space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="w-8 h-8 sm:w-10 sm:h-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />
            </Button>
            <img 
              src="/lovable-uploads/myplug-logo.png" 
              alt="MyPlug App Icon" 
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Gifts & Surprises</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find the Perfect Gift
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Let MyPlug help you discover thoughtful gifts that will make someone's day special ✨
          </p>
        </div>

        {/* Gift Finder Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center text-gray-900 dark:text-white">Tell us about them</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                Age <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">Relationship</label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                Special Occasion
              </label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select occasion (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                Hobbies & Interests <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., reading, music, cooking, sports"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                  Budget Min (KES) <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 1000"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white mb-1 block">
                  Budget Max (KES) <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 5000"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>

            <Button
              onClick={handleLetISASuggest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              {loading ? "Finding gifts..." : "Let MyPlug Suggest"}
            </Button>
          </CardContent>
        </Card>

        {/* Suggestions Section */}
        {suggestedProducts.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your suggestions will appear here</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fill in the form and let MyPlug find amazing gifts!
            </p>
          </div>
        )}

        {suggestedProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Perfect Gift Suggestions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedProducts.map((product) => (
                <Card key={product.id} className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <ProductImageLoader
                        src={product.main_image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          KES {product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onToggleLike(product)}
                          className={likedItems.includes(product.id) ? "bg-red-50 text-red-600 border-red-300" : ""}
                        >
                          <Heart className={`w-4 h-4 ${likedItems.includes(product.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewProduct(product)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(product)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftsSection;
