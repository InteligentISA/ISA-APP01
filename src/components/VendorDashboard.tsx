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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Vendor Dashboard</h1>
              <span className="text-xs sm:text-sm text-gray-500">Welcome, {user?.name}</span>
              <div className="flex items-center space-x-2">
                {isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="text-xs sm:text-sm text-orange-600 font-medium">Pending Verification</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2 w-full sm:w-auto"
              size="sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      {!isVerified && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 mx-3 sm:mx-4 mt-3 sm:mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm text-orange-700">
                Your vendor account is pending verification. You'll be able to upload and sell products once verified by our team. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:space-x-1 bg-gray-100 p-1 rounded-lg mb-4 sm:mb-6 w-full sm:w-fit">
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="flex items-center justify-center space-x-2 mb-1 sm:mb-0"
            disabled={!isVerified}
            size="sm"
          >
            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Products</span>
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className="flex items-center justify-center space-x-2 mb-1 sm:mb-0"
            disabled={!isVerified}
            size="sm"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Orders</span>
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('upload')}
            className="flex items-center justify-center space-x-2"
            disabled={!isVerified}
            size="sm"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Upload Product</span>
          </Button>
        </div>

        {/* Content sections remain the same but are disabled if not verified */}
        {isVerified ? (
          <>
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Products</h2>
                  <Button onClick={() => setActiveTab('upload')} className="flex items-center justify-center space-x-2 w-full sm:w-auto" size="sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Add Product</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-w-16 aspect-h-9">
                        <img src={product.image} alt={product.name} className="w-full h-40 sm:h-48 object-cover" />
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold text-base sm:text-lg mb-2">{product.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">Category: {product.category}</p>
                        <p className="text-base sm:text-lg font-bold text-green-600 mb-3 sm:mb-4">${product.price}</p>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 text-red-500">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Orders</h2>
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base">{order.productName}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Customer: {order.customerName}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Quantity: {order.quantity}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Date: {order.date}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <p className="text-base sm:text-lg font-bold text-green-600">${order.total}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload New Product</h2>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleProductUpload} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                          <Input
                            type="text"
                            value={uploadForm.name}
                            onChange={(e) => handleUploadFormChange('name', e.target.value)}
                            placeholder="Enter product name"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <Select value={uploadForm.category} onValueChange={(value) => handleUploadFormChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Fashion">Fashion</SelectItem>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Beauty">Beauty</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="Books">Books</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                        <Input
                          type="number"
                          value={uploadForm.price}
                          onChange={(e) => handleUploadFormChange('price', e.target.value)}
                          placeholder="Enter price"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs sm:text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          <input
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="mt-2 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            Choose File
                          </label>
                        </div>
                        {uploadForm.image && (
                          <p className="text-xs sm:text-sm text-green-600 mt-2">✓ {uploadForm.image.name}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Upload Product
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setActiveTab('products')} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Account Verification Required</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
              Your vendor account needs to be verified before you can start uploading products and managing orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
