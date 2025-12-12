import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VendorReviewsProps {
  vendorId: string;
}

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  is_verified: boolean;
}

const VendorReviews = ({ vendorId }: VendorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    fourStarReviews: 0,
    threeStarReviews: 0,
    twoStarReviews: 0,
    oneStarReviews: 0
  });

  useEffect(() => {
    if (vendorId) fetchReviews();
  }, [vendorId]);

  const fetchReviews = async () => {
    if (!vendorId) { setLoading(false); return; }
    
    try {
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select(`*, products!inner (vendor_id, name)`)
        .eq('products.vendor_id', vendorId);

      if (reviewsData) {
        const userIds = reviewsData.map(review => review.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const vendorReviews: Review[] = reviewsData.map(review => {
          const profile = profiles?.find(p => p.id === review.user_id);
          return {
            id: review.id,
            product_id: review.product_id || '',
            product_name: (review.products as any)?.name || 'Unknown Product',
            customer_name: profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.first_name || 'Anonymous',
            customer_email: '',
            rating: review.rating || 0,
            comment: review.comment || '',
            created_at: review.created_at || '',
            helpful_count: 0,
            is_verified: review.is_verified_purchase || false
          };
        });

        setReviews(vendorReviews);

        const totalReviews = vendorReviews.length;
        const averageRating = totalReviews > 0 
          ? vendorReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        setStats({
          totalReviews,
          averageRating,
          fiveStarReviews: vendorReviews.filter(r => r.rating === 5).length,
          fourStarReviews: vendorReviews.filter(r => r.rating === 4).length,
          threeStarReviews: vendorReviews.filter(r => r.rating === 3).length,
          twoStarReviews: vendorReviews.filter(r => r.rating === 2).length,
          oneStarReviews: vendorReviews.filter(r => r.rating === 1).length
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating})</span>
    </div>
  );

  const getRatingPercentage = (count: number) => stats.totalReviews === 0 ? 0 : Math.round((count / stats.totalReviews) * 100);

  if (loading) return <div className="flex justify-center items-center h-64">Loading reviews...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Reviews</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">5-Star Reviews</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.fiveStarReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">1-Star Reviews</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats.oneStarReviews}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No customer reviews yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.slice(0, 10).map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{review.product_name}</TableCell>
                    <TableCell>{review.customer_name}</TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell><p className="text-sm line-clamp-2">{review.comment}</p></TableCell>
                    <TableCell>
                      {review.is_verified && <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorReviews;