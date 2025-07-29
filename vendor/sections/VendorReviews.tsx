import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    main_image: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface VendorReviewsProps {
  vendorId: string;
}

const VendorReviews = ({ vendorId }: VendorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [vendorId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products!inner (
            id,
            name,
            main_image,
            vendor_id
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('products.vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      // Transform the data to match Review interface
      const transformedReviews = (data || []).map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        created_at: review.created_at,
        product: {
          id: review.products.id,
          name: review.products.name,
          main_image: review.products.main_image
        },
        profiles: review.profiles
      }));

      setReviews(transformedReviews);
      calculateStats(transformedReviews);
    } catch (error) {
      console.error('Exception fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    const totalReviews = reviewsData.length;
    const averageRating = totalReviews > 0 
      ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    setStats({ totalReviews, averageRating, ratingDistribution });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
      
      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.ratingDistribution).reverse().map(([rating, count]) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-4">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded" 
                      style={{ width: `${stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Encourage customers to leave reviews!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.profiles?.first_name?.[0]}{review.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {review.profiles?.first_name} {review.profiles?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge variant="outline">{review.rating}/5</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">
                          Product: <span className="font-medium">{review.product.name}</span>
                        </div>
                        {review.title && (
                          <div className="font-medium text-gray-900 mb-1">{review.title}</div>
                        )}
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    </div>

                    {review.product.main_image && (
                      <img 
                        src={review.product.main_image} 
                        alt={review.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorReviews;