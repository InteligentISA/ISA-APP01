import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Sparkles, Users } from "lucide-react";

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome = ({ onGetStarted }: WelcomeProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-12 animate-fade-in-up">
        <div className="space-y-6">
          <img 
            src="/lovable-uploads/c01498a5-d048-4876-b256-a7fdc6f331ba.png" 
            alt="ISA Logo" 
            className="w-32 h-32 mx-auto mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="isa-gold">ISA</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Your Intelligent Shopping Assistant that revolutionizes the way you discover, 
            save, and purchase products with AI-powered recommendations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <ShoppingBag className="w-12 h-12 isa-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Smart Shopping</h3>
            <p className="text-white/70">AI-curated products tailored to your preferences</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Heart className="w-12 h-12 isa-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Save Favorites</h3>
            <p className="text-white/70">Like and save products for later purchase</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Sparkles className="w-12 h-12 isa-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Personalized</h3>
            <p className="text-white/70">Recommendations that learn from your behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={onGetStarted}
            className="isa-gold-bg text-black font-semibold px-12 py-4 text-lg rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
          <p className="text-white/60 text-sm">Join thousands of smart shoppers today</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
