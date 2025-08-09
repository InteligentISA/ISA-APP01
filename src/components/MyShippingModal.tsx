import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck } from "lucide-react";
import MyShipping from "./MyShipping";

interface MyShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const MyShippingModal = ({ isOpen, onClose, user }: MyShippingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="w-6 h-6 text-blue-500" />
            <span>My Shipping Records</span>
          </DialogTitle>
        </DialogHeader>
        
        <MyShipping user={user} />
      </DialogContent>
    </Dialog>
  );
};

export default MyShippingModal;
