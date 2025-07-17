import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Package, ShoppingCart, LogOut, Plus, Eye, Edit, Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/productService";
import { ImageUploadService } from "@/services/imageUploadService";
import { OrderService } from "@/services/orderService";
import { Product } from "@/types/product";
import { OrderWithDetails } from "@/types/order";

interface VendorDashboardProps {
  user: any;
  onLogout: () => void;
}

const VendorDashboard = ({ user, onLogout }: VendorDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'upload'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock_quantity: "",
    brand: "",
    pickup_location: "",
    pickup_phone_number: "",
    image: null as File | null,
    imageUrl: "" // For image links
  });
  const { toast } = useToast();

  // Load vendor's products and orders on component mount
  useEffect(() => {
    if (user?.id) {
      loadVendorProducts();
      loadVendorOrders();
    }
  }, [user?.id]);

  const loadVendorProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await ProductService.getProductsByVendor(user.id);
      if (error) {
        console.error('Error loading vendor products:', error);
        toast({
          title: "Error",
          description: `Failed to load products: ${error.message || error}`,
          variant: "destructive"
        });
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Exception loading vendor products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVendorOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await OrderService.getVendorOrders(user.id);
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUploadFormChange = (field: string, value: string | File | null) => {
    setUploadForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (500KB limit)
      if (file.size > 500 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 500KB",
          variant: "destructive"
        });
        return;
      }
      handleUploadFormChange('image', file);
      handleUploadFormChange('imageUrl', ''); // Clear URL if file is selected
    }
  };

  const handleProductUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!uploadForm.name || !uploadForm.category || !uploadForm.price || !uploadForm.stock_quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate image (either file or URL)
    if (!uploadForm.image && !uploadForm.imageUrl) {
      toast({
        title: "Error",
        description: "Please provide either an image file or image URL.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      let mainImage = '';
      
      // Handle image upload
      if (uploadForm.image) {
        const uploadResult = await ImageUploadService.uploadImage(uploadForm.image, 'products');
        if (uploadResult.error) {
          toast({
            title: "Image Upload Failed",
            description: uploadResult.error,
            variant: "destructive"
          });
          return;
        }
        mainImage = uploadResult.url;
      } else if (uploadForm.imageUrl) {
        mainImage = uploadForm.imageUrl;
      }

      // Create product object
      const newProduct = {
        name: uploadForm.name,
        description: uploadForm.description,
        price: parseFloat(uploadForm.price),
        category: uploadForm.category,
        stock_quantity: parseInt(uploadForm.stock_quantity),
        brand: uploadForm.brand,
        main_image: mainImage,
        images: [mainImage],
        pickup_location: uploadForm.pickup_location,
        pickup_phone_number: uploadForm.pickup_phone_number,
        vendor_id: user.id,
        is_active: true,
        rating: 0,
        review_count: 0,
        is_featured: false,
        currency: 'KES'
      };

      // Save to database
      const { data, error } = await ProductService.createProduct(newProduct);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create product",
          variant: "destructive"
        });
        return;
      }

      // Reset form and reload products
      setUploadForm({
        name: "",
        description: "",
        category: "",
        price: "",
        stock_quantity: "",
        brand: "",
        pickup_location: "",
        pickup_phone_number: "",
        image: null,
        imageUrl: ""
      });
      
      await loadVendorProducts();
      
      toast({
        title: "Success!",
        description: "Product uploaded successfully.",
      });
      
      setActiveTab('products');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload product",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await ProductService.deleteProduct(productId);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
        return;
      }

      await loadVendorProducts();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  // Vendors who reach this dashboard are already approved
  const isVerified = true;

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
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-xs sm:text-sm text-green-600 font-medium">Approved Vendor</span>
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
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9">
                          <img 
                            src={product.main_image || product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"} 
                            alt={product.name} 
                            className="w-full h-40 sm:h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />
                        </div>
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="font-semibold text-base sm:text-lg mb-2">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Category: {product.category}</p>
                          {product.brand && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Brand: {product.brand}</p>
                          )}
                          <p className="text-base sm:text-lg font-bold text-green-600 mb-2">
                            KES {product.price?.toLocaleString()}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Stock: {product.stock_quantity} units
                          </p>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex space-x-1 sm:space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 sm:w-10 sm:h-10 text-red-500"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Orders</h2>
                
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Loading orders...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders from your products will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col space-y-3">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm sm:text-base">
                                  Order #{order.order_number}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex flex-col sm:items-end space-y-1">
                                <p className="text-base sm:text-lg font-bold text-green-600">
                                  KES {order.total_amount?.toLocaleString()}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                              <div className="space-y-2">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex-1">
                                      <p className="font-medium">{item.product_name}</p>
                                      <p className="text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-gray-900">KES {item.total_price?.toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Customer:</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Email: {order.customer_email}</p>
                                {order.customer_phone && (
                                  <p>Phone: {order.customer_phone}</p>
                                )}
                                {order.notes && (
                                  <p>Notes: {order.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload New Product</h2>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleProductUpload} className="space-y-4 sm:space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                          <Input
                            type="text"
                            value={uploadForm.name}
                            onChange={(e) => handleUploadFormChange('name', e.target.value)}
                            placeholder="Enter product name"
                            className="w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                          <Select value={uploadForm.category} onValueChange={(value) => handleUploadFormChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Electronics">Electronics</SelectItem>
                              <SelectItem value="Fashion">Fashion</SelectItem>
                              <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                              <SelectItem value="Beauty & Health">Beauty & Health</SelectItem>
                              <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                              <SelectItem value="Books & Media">Books & Media</SelectItem>
                              <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                              <SelectItem value="Automotive">Automotive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <Textarea
                          value={uploadForm.description}
                          onChange={(e) => handleUploadFormChange('description', e.target.value)}
                          placeholder="Describe your product..."
                          className="w-full"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES) *</label>
                          <Input
                            type="number"
                            value={uploadForm.price}
                            onChange={(e) => handleUploadFormChange('price', e.target.value)}
                            placeholder="0.00"
                            className="w-full"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                          <Input
                            type="number"
                            value={uploadForm.stock_quantity}
                            onChange={(e) => handleUploadFormChange('stock_quantity', e.target.value)}
                            placeholder="0"
                            className="w-full"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                          <Input
                            type="text"
                            value={uploadForm.brand}
                            onChange={(e) => handleUploadFormChange('brand', e.target.value)}
                            placeholder="Brand name"
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Pickup Information */}
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                            <Input
                              type="text"
                              value={uploadForm.pickup_location}
                              onChange={(e) => handleUploadFormChange('pickup_location', e.target.value)}
                              placeholder="Address or location details"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Phone Number</label>
                            <Input
                              type="tel"
                              value={uploadForm.pickup_phone_number}
                              onChange={(e) => handleUploadFormChange('pickup_phone_number', e.target.value)}
                              placeholder="Phone number for inquiries"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Image Upload */}
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h3>
                        
                        {/* Image URL Option */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                          <Input
                            type="url"
                            value={uploadForm.imageUrl}
                            onChange={(e) => handleUploadFormChange('imageUrl', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">Or upload an image file below</p>
                        </div>

                        {/* File Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">PNG, JPG, WebP up to 500KB</p>
                          <input
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="mt-2 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            Choose File
                          </label>
                        </div>
                        {uploadForm.image && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs sm:text-sm text-green-600">✓ {uploadForm.image.name} ({(uploadForm.image.size / 1024).toFixed(1)}KB)</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Upload Product'
                          )}
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
