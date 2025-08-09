import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Palette } from "lucide-react";
import StyleQuiz from "./StyleQuiz";

interface StyleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const StyleQuizModal = ({ isOpen, onClose, user }: StyleQuizModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-purple-500" />
            <span>Style Quiz</span>
          </DialogTitle>
        </DialogHeader>
        
        <StyleQuiz user={user} onComplete={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default StyleQuizModal;


