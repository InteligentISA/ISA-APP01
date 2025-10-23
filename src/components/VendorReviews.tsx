import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    if (vendorId) {
      fetchReviews();
    }
  }, [vendorId]);

  const fetchReviews = async () => {
    if (!vendorId) {
      console.log('Vendor ID not available, skipping fetchReviews');
      setLoading(false);
      return;
    }
    
    try {
      // Fetch reviews for vendor's products
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products!inner (vendor_id, name)
        `)
        .eq('products.vendor_id', vendorId);

      if (reviewsData) {
        // Fetch user profiles separately to avoid RLS issues
        const userIds = reviewsData.map(review => review.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const vendorReviews: Review[] = reviewsData.map(review => {
          const profile = profiles?.find(p => p.id === review.user_id);
          return {
            id: review.id,
            product_id: review.product_id,
            product_name: review.products?.name || 'Unknown Product',
            customer_name: profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.first_name || profile?.last_name || 'Anonymous',
            customer_email: '', // Email is not available in profiles table
            rating: review.rating || 0,
            comment: review.comment || '',
            created_at: review.created_at,
            helpful_count: review.helpful_count || 0,
            is_verified: review.is_verified || false
          };
        });

        setReviews(vendorReviews);

        // Calculate stats
        const totalReviews = vendorReviews.length;
        const averageRating = totalReviews > 0 
          ? vendorReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        const ratingCounts = {
          fiveStar: vendorReviews.filter(r => r.rating === 5).length,
          fourStar: vendorReviews.filter(r => r.rating === 4).length,
          threeStar: vendorReviews.filter(r => r.rating === 3).length,
          twoStar: vendorReviews.filter(r => r.rating === 2).length,
          oneStar: vendorReviews.filter(r => r.rating === 1).length
        };

        setStats({
          totalReviews,
          averageRating,
          fiveStarReviews: ratingCounts.fiveStar,
          fourStarReviews: ratingCounts.fourStar,
          threeStarReviews: ratingCounts.threeStar,
          twoStarReviews: ratingCounts.twoStar,
          oneStarReviews: ratingCounts.oneStar
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getRatingPercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Reviews</h1>
      
      {/* Summary Cards */}
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
            <div className="flex items-center mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">5-Star Reviews</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.fiveStarReviews}</div>
            <p className="text-xs text-gray-600 mt-1">{getRatingPercentage(stats.fiveStarReviews)}% of total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">1-Star Reviews</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats.oneStarReviews}</div>
            <p className="text-xs text-gray-600 mt-1">{getRatingPercentage(stats.oneStarReviews)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stars: 5, count: stats.fiveStarReviews, color: 'bg-green-500' },
              { stars: 4, count: stats.fourStarReviews, color: 'bg-blue-500' },
              { stars: 3, count: stats.threeStarReviews, color: 'bg-yellow-500' },
              { stars: 2, count: stats.twoStarReviews, color: 'bg-orange-500' },
              { stars: 1, count: stats.oneStarReviews, color: 'bg-red-500' }
            ].map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center w-16">
                  <span className="text-sm font-medium">{rating.stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${rating.color}`}
                    style={{
                      width: `${getRatingPercentage(rating.count)}%`
                    }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-medium">{rating.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No customer reviews yet.</p>
              <p className="text-sm">Reviews will appear here once customers start reviewing your products.</p>
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
                    <TableCell>
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {review.product_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.customer_name}</div>
                        <div className="text-sm text-gray-500">{review.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">{review.comment}</p>
                        {review.helpful_count > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {review.helpful_count} found this helpful
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {review.is_verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Negative'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Positive Reviews (4-5 stars)</span>
                <span className="font-semibold text-green-600">
                  {stats.fourStarReviews + stats.fiveStarReviews} ({getRatingPercentage(stats.fourStarReviews + stats.fiveStarReviews)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Neutral Reviews (3 stars)</span>
                <span className="font-semibold text-yellow-600">
                  {stats.threeStarReviews} ({getRatingPercentage(stats.threeStarReviews)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Negative Reviews (1-2 stars)</span>
                <span className="font-semibold text-red-600">
                  {stats.oneStarReviews + stats.twoStarReviews} ({getRatingPercentage(stats.oneStarReviews + stats.twoStarReviews)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {stats.totalReviews > 0 
                    ? `You have ${stats.totalReviews} customer reviews with an average rating of ${stats.averageRating.toFixed(1)} stars.`
                    : "No reviews yet. Focus on providing excellent customer service to get your first reviews."
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {stats.oneStarReviews + stats.twoStarReviews > 0
                    ? `You have ${stats.oneStarReviews + stats.twoStarReviews} negative reviews. Consider addressing customer concerns.`
                    : "Great job! No negative reviews yet. Keep up the excellent service."
                  }
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  {stats.fiveStarReviews > 0
                    ? `You have ${stats.fiveStarReviews} 5-star reviews! Excellent work.`
                    : "Work towards getting your first 5-star review by exceeding customer expectations."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorReviews; 