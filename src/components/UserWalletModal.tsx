import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import UserWallet from "./UserWallet";

interface UserWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserWalletModal = ({ isOpen, onClose, user }: UserWalletModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-orange-500" />
            <span>Points Wallet</span>
          </DialogTitle>
        </DialogHeader>
        
        <UserWallet user={user} />
      </DialogContent>
    </Dialog>
  );
};

export default UserWalletModal;


