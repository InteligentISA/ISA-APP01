import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, CheckCircle } from "lucide-react";

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (plan: "weekly" | "monthly" | "annual", paymentMethod: "mpesa" | "airtel_money", phoneNumber: string) => void;
  loading: boolean;
}

const plans = [
  {
    id: "weekly",
    name: "Weekly Premium",
    price: 99,
    period: "week",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 499,
    period: "month",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "annual",
    name: "Annual Premium",
    price: 4500,
    period: "year",
    color: "from-green-400 to-blue-500",
  },
];

const features = [
  "Unlimited access to Gift Section",
  "ISA organizes gift delivery",
  "Up to 100 chats on Ask ISA",
  "Personalized product recommendations",
];

const TierUpgradeModal: React.FC<TierUpgradeModalProps> = ({ isOpen, onClose, onPay, loading }) => {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "annual">("weekly");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "airtel_money">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handlePay = () => {
    if (!phoneNumber.match(/^2547\d{8}$/)) {
      setError("Enter a valid phone number (e.g., 2547XXXXXXXX)");
      return;
    }
    setError("");
    onPay(selectedPlan, paymentMethod, phoneNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-yellow-100 to-pink-100 dark:from-yellow-900/20 dark:to-pink-900/20 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Gift className="w-7 h-7 text-yellow-500" />
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Go Premium</DialogTitle>
          </div>
          <DialogDescription className="text-gray-700 dark:text-gray-200 text-base">
            Unlock all features and get the best experience with ISA!
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`rounded-xl p-4 bg-gradient-to-br ${plan.color} text-white shadow-lg flex flex-col items-center cursor-pointer border-2 ${selectedPlan === plan.id ? 'border-yellow-400 dark:border-yellow-300' : 'border-transparent'}`}
                onClick={() => setSelectedPlan(plan.id as any)}
              >
                <div className="text-lg font-semibold mb-1">{plan.name}</div>
                <div className="text-3xl font-bold mb-1">KES {plan.price}</div>
                <div className="text-xs mb-3">per {plan.period}</div>
                {selectedPlan === plan.id && <span className="text-xs bg-white text-yellow-600 px-2 py-1 rounded-full font-bold">Selected</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Payment Method</label>
              <select
                className="w-full rounded-md border-gray-300 dark:border-slate-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
              >
                <option value="mpesa">M-Pesa</option>
                <option value="airtel_money">Airtel Money</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Phone Number</label>
              <input
                type="tel"
                className="w-full rounded-md border-gray-300 dark:border-slate-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                placeholder="2547XXXXXXXX"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          <div className="mt-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-pink-500" />
              Premium Features
            </div>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700 dark:text-gray-200">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="bg-gray-50 dark:bg-slate-800 p-4 flex justify-between items-center">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handlePay} disabled={loading} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            {loading ? 'Processing...' : 'Pay & Upgrade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TierUpgradeModal; 