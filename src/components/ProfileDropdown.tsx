import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Palette, 
  Star, 
  CreditCard,
  Gift,
  ChevronDown,
  Truck,
  Award,
  Package
} from "lucide-react";
import { SubscriptionService, UserSubscription } from "@/services/subscriptionService";
import { LoyaltyService } from "@/services/loyaltyService";

interface ProfileDropdownProps {
  user: any;
  onShowProfile: () => void;
  onShowSettings: () => void;
  onShowStyleQuiz: () => void;
  onShowSubscriptions: () => void;
  onShowShipping: () => void;
  onShowWallet: () => void;
  onShowOrders: () => void;
  onLogout: () => void;
}

const ProfileDropdown = ({ 
  user, 
  onShowProfile, 
  onShowSettings, 
  onShowStyleQuiz, 
  onShowSubscriptions, 
  onShowShipping, 
  onShowWallet, 
  onShowOrders,
  onLogout 
}: ProfileDropdownProps) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [userPoints, setUserPoints] = useState<any>(null);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [subscriptionData, pointsData, quizCompleted] = await Promise.all([
        SubscriptionService.getUserSubscription(user.id),
        LoyaltyService.getUserPoints(user.id),
        LoyaltyService.hasCompletedQuiz(user.id)
      ]);

      setSubscription(subscriptionData);
      setUserPoints(pointsData);
      setHasCompletedQuiz(quizCompleted);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'premium': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-medium">{user?.name || user?.email || 'User'}</span>
            {subscription && (
              <Badge variant="secondary" className={`text-xs ${getPlanBadgeColor(subscription.plan_type)}`}>
                {subscription.plan_type.toUpperCase()}
              </Badge>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-2" align="end">
        {/* User Info Header */}
        <div className="flex items-center space-x-3 p-3 border-b">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gray-200 text-gray-800">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {subscription && (
                <Badge className={`text-xs ${getPlanBadgeColor(subscription.plan_type)}`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {subscription.plan_type.toUpperCase()}
                </Badge>
              )}
              {userPoints && userPoints.available_points >= 1000 && (
                <Badge className="text-xs bg-yellow-500 text-black">
                  <Award className="w-3 h-3 mr-1" />
                  GOLD
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Points Info */}
        {!loading && userPoints && (
          <div className="p-3 bg-gray-50 rounded-lg my-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Points</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {userPoints.available_points?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Main Menu Items */}
        <DropdownMenuItem onClick={onShowProfile} className="flex items-center space-x-2 cursor-pointer">
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onShowSubscriptions} className="flex items-center space-x-2 cursor-pointer">
          <Crown className="w-4 h-4" />
          <span>Subscriptions & Plans</span>
          {!subscription && (
            <Badge variant="outline" className="ml-auto text-xs">
              Upgrade
            </Badge>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onShowStyleQuiz} className="flex items-center space-x-2 cursor-pointer">
          <Palette className="w-4 h-4" />
          <span>Style Quiz</span>
          {!hasCompletedQuiz && (
            <Badge variant="outline" className="ml-auto text-xs">
              Take Quiz
            </Badge>
          )}
          {hasCompletedQuiz && (
            <Badge variant="secondary" className="ml-auto text-xs">
              ✓ Completed
            </Badge>
          )}
        </DropdownMenuItem>

        {userPoints && (
          <DropdownMenuItem onClick={onShowWallet} className="flex items-center space-x-2 cursor-pointer">
            <Star className="w-4 h-4" />
            <span>Loyalty Points</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {userPoints.available_points || 0}
            </Badge>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onShowShipping} className="flex items-center space-x-2 cursor-pointer">
          <Truck className="w-4 h-4" />
          <span>My Shipping</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onShowOrders} className="flex items-center space-x-2 cursor-pointer">
          <Package className="w-4 h-4" />
          <span>My Orders</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onShowSettings} className="flex items-center space-x-2 cursor-pointer">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
