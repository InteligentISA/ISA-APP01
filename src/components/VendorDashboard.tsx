import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Package, ShoppingCart, LogOut, Plus, Eye, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

const VendorDashboard = ({ user, onLogout }: VendorDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'upload'>('products');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Sample Product",
      category: "Electronics",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      status: "Active"
    }
  ]);
  const [orders, setOrders] = useState([
    {
      id: 1,
      productName: "Sample Product",
      customerName: "John Doe",
      quantity: 2,
      total: 599.98,
      status: "Pending",
      date: "2024-01-15"
    }
  ]);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "",
    price: "",
    image: null as File | null
  });
  const { toast } = useToast();

  const handleUploadFormChange = (field: string, value: string | File | null) => {
    setUploadForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFormChange('image', file);
    }
  };

  const handleProductUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.category || !uploadForm.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newProduct = {
      id: products.length + 1,
      name: uploadForm.name,
      category: uploadForm.category,
      price: parseFloat(uploadForm.price),
      image: uploadForm.image ? URL.createObjectURL(uploadForm.image) : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
      status: "Active"
    };

    setProducts(prev => [...prev, newProduct]);
    setUploadForm({ name: "", category: "", price: "", image: null });
    
    toast({
      title: "Success!",
      description: "Product uploaded successfully.",
    });
    
    setActiveTab('products');
  };

  // Add verification status - you can modify this based on your user data structure
  const isVerified = user?.isVerified || false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Vendor Dashboard</h1>
              <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
              <div className="flex items-center space-x-2">
                {isVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">Pending Verification</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      {!isVerified && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                Your vendor account is pending verification. You'll be able to upload and sell products once verified by our team. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="flex items-center space-x-2"
            disabled={!isVerified}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className="flex items-center space-x-2"
            disabled={!isVerified}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders</span>
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('upload')}
            className="flex items-center space-x-2"
            disabled={!isVerified}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Product</span>
          </Button>
        </div>

        {/* Content sections remain the same but are disabled if not verified */}
        {isVerified ? (
          <>
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                  <Button onClick={() => setActiveTab('upload')} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9">
                        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
                        <p className="text-lg font-bold text-green-600 mb-4">${product.price}</p>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Product Tab */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Product</h2>
                
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleProductUpload} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                        <Input
                          type="text"
                          placeholder="Enter product name"
                          value={uploadForm.name}
                          onChange={(e) => handleUploadFormChange('name', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <Select value={uploadForm.category} onValueChange={(value) => handleUploadFormChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="home">Home & Garden</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="books">Books</SelectItem>
                            <SelectItem value="beauty">Beauty</SelectItem>
                            <SelectItem value="toys">Toys</SelectItem>
                            <SelectItem value="automotive">Automotive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={uploadForm.price}
                          onChange={(e) => handleUploadFormChange('price', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Photo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <div className="text-sm text-gray-600 mb-2">
                            <label htmlFor="photo-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                              Click to upload
                            </label>
                            <span> or drag and drop</span>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          {uploadForm.image && (
                            <p className="mt-2 text-sm text-green-600">Selected: {uploadForm.image.name}</p>
                          )}
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Upload Product
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Verification Required</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Please wait for your vendor account to be verified before you can start uploading products and managing orders. 
              You'll receive an email notification once the verification is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
