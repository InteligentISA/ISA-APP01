
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Sparkles, Users } from "lucide-react";

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome = ({ onGetStarted }: WelcomeProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12 animate-fade-in-up">
        <div className="space-y-4 sm:space-y-6">
          <img 
            src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
            alt="ISA Logo" 
            className="w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-6 sm:mb-8"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome to Your Intelligent Shopping Assistant
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Your Intelligent Shopping Assistant that revolutionizes the way you discover, 
            save, and purchase products with AI-powered recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 isa-gold mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Smart Shopping</h3>
            <p className="text-sm sm:text-base text-gray-600">AI-curated products tailored to your preferences</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <Heart className="w-8 h-8 sm:w-12 sm:h-12 isa-gold mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Save Favorites</h3>
            <p className="text-sm sm:text-base text-gray-600">Like and save products for later purchase</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 isa-gold mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Personalized</h3>
            <p className="text-sm sm:text-base text-gray-600">Recommendations that learn from your behavior</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 px-4">
          <Button 
            onClick={onGetStarted}
            className="bg-white text-gray-900 font-bold px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl rounded-full hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-gray-200 hover:border-gray-300 w-full sm:w-auto transform hover:scale-105"
          >
            Ask ISA Anything
          </Button>
          <p className="text-gray-500 text-xs sm:text-sm">Join thousands of smart shoppers today</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
