import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Loader } from 'lucide-react';

const MyShipping = () => {
  const { user } = useAuth();
  const [shippingRecords, setShippingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipping = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch all shipping records for the user's orders
        const { data, error } = await supabase
          .from('shipping')
          .select('*')
          .in('order_id', (
            supabase
              .from('orders')
              .select('id')
              .eq('user_id', user.id)
          ));
        if (error) throw error;
        setShippingRecords(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch shipping records');
      } finally {
        setLoading(false);
      }
    };
    fetchShipping();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Shipping Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin w-8 h-8 text-gray-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : shippingRecords.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No shipping records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipping Method</TableHead>
                      <TableHead>Estimated Delivery</TableHead>
                      <TableHead>Actual Delivery</TableHead>
                      <TableHead>Tracking Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shippingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.carrier}</TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>{record.shipping_method}</TableCell>
                        <TableCell>{record.estimated_delivery_date ? new Date(record.estimated_delivery_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{record.actual_delivery_date ? new Date(record.actual_delivery_date).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{record.tracking_number || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyShipping; 