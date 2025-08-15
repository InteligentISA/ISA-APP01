import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  Gift, 
  TrendingUp, 
  History, 
  Share2, 
  Copy, 
  Check,
  Star,
  Users,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoyaltyService } from "@/services/loyaltyService";

interface UserWalletProps {
  user: any;
}

const UserWallet = ({ user }: UserWalletProps) => {
  const [userPoints, setUserPoints] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pointsConfig, setPointsConfig] = useState<any>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Use LoyaltyService instead of direct Supabase calls
      const points = await LoyaltyService.getUserPoints(user.id);
      setUserPoints(points);

      const transactions = await LoyaltyService.getPointsTransactions(user.id, 10);
      setTransactions(transactions);

      const config = await LoyaltyService.getPointsConfig();
      setPointsConfig(config);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of points to redeem.",
        variant: "destructive"
      });
      return;
    }

    if (!userPoints || points > userPoints.available_points) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough points to redeem.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Redeem points using LoyaltyService
      const data = await LoyaltyService.redeemPoints(user.id, points);

      const success = data;

      if (success) {
        toast({
          title: "Points redeemed successfully!",
          description: `${points} points have been redeemed. Value: KES ${(points * (pointsConfig?.point_value_kes || 0.1)).toFixed(2)}`
        });
        setShowRedeemDialog(false);
        setRedeemAmount("");
        loadUserData(); // Refresh data
      } else {
        toast({
          title: "Redemption failed",
          description: "Unable to redeem points. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast({
        title: "Error",
        description: "Failed to redeem points. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${user.id}`;
  };

  const copyReferralLink = async () => {
    const link = generateReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'redeemed':
        return <Gift className="w-4 h-4 text-orange-600" />;
      case 'expired':
        return <History className="w-4 h-4 text-red-600" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'redeemed':
        return 'text-orange-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Wallet className="w-6 h-6" />
            <span>ISA Points Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-orange-600">
                {userPoints?.available_points || 0}
              </div>
              <div className="text-sm text-gray-600">Available Points</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {userPoints?.lifetime_earned || 0}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                KES {((userPoints?.available_points || 0) * (pointsConfig?.point_value_kes || 0.1)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Current Value</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setShowRedeemDialog(true)}
              disabled={!userPoints?.available_points || userPoints.available_points <= 0}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Redeem Points
            </Button>
            <Button 
              variant="outline" 
              onClick={copyReferralLink}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Referral Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>How to Earn Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Shopping</div>
                <div className="text-sm text-gray-600">
                  {pointsConfig?.spending_points_per_100_kes || 10} points per KES 100 spent
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Refer Friends</div>
                <div className="text-sm text-gray-600">
                  {pointsConfig?.referral_signup_points || 200} points per signup
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">Style Quiz</div>
                <div className="text-sm text-gray-600">
                  {pointsConfig?.quiz_completion_points || 20} points for completion
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <Gift className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium">First Purchase</div>
                <div className="text-sm text-gray-600">
                  {pointsConfig?.first_purchase_points || 100} bonus points
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-orange-600" />
            <span>Redemption Values</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { points: 100, value: 10 },
              { points: 500, value: 50 },
              { points: 1000, value: 100 },
              { points: 5000, value: 500 }
            ].map((tier) => (
              <div key={tier.points} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{tier.points}</div>
                <div className="text-sm text-gray-600">points</div>
                <div className="text-lg font-semibold text-green-600">KES {tier.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Start shopping to earn points!
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <div className="font-medium">{transaction.reason}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.points} points
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem Points Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="redeemAmount">Number of Points to Redeem</Label>
              <Input
                id="redeemAmount"
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Enter points to redeem"
                min="100"
                max={userPoints?.available_points || 0}
              />
            </div>
            {redeemAmount && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  Value: KES {(parseInt(redeemAmount) * (pointsConfig?.point_value_kes || 0.1)).toFixed(2)}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button 
                onClick={handleRedeemPoints}
                disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > (userPoints?.available_points || 0)}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Redeem Points
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRedeemDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserWallet;


