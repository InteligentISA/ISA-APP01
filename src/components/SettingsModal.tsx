import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings as SettingsIcon } from "lucide-react";
import Settings from "./Settings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate?: () => void;
}

const SettingsModal = ({ isOpen, onClose, user, onProfileUpdate }: SettingsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-gray-500" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <Settings user={user} onProfileUpdate={onProfileUpdate} />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
