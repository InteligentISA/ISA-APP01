import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Truck, Package } from "lucide-react";
import { OrderWithDetails } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithDetails;
  type: 'product' | 'delivery';
  onSuccess: () => void;
}

export const RatingDialog = ({ open, onOpenChange, order, type, onSuccess }: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const updateData: any = {};
      
      if (type === 'product') {
        updateData.product_rating = rating;
        updateData.product_review_comment = comment.trim() || null;
      } else {
        updateData.delivery_rating = rating;
        updateData.delivery_review_comment = comment.trim() || null;
      }

      // If both ratings are provided, set rated_at
      if (order.product_rating && order.delivery_rating) {
        updateData.rated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: `Thank you for your ${type} rating!`,
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setRating(0);
      setComment("");
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setRating(0);
    setComment("");
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getTitle = () => {
    return type === 'product' ? 'Rate Product' : 'Rate Delivery Experience';
  };

  const getDescription = () => {
    return type === 'product' 
      ? 'How would you rate this product?'
      : 'How would you rate your delivery experience?';
  };

  const getIcon = () => {
    return type === 'product' ? (
      <Package className="w-6 h-6" />
    ) : (
      <Truck className="w-6 h-6" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{getDescription()}</p>
            {renderStars()}
            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Tell us about your ${type} experience...`}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
