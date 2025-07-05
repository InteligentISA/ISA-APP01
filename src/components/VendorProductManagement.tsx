import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import { ImageUploadService } from "@/services/imageUploadService";
import { Plus, Trash2 } from "lucide-react";

interface VendorProductManagementProps {
  user: any;
}

const VendorProductManagement = ({ user }: VendorProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [commissionPercentage, setCommissionPercentage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await ProductService.getProductsByVendor(user.id);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsLoading(true);
      const { data, error } = await ProductService.uploadProductImages(files, user.id);
      if (error) throw error;

      setAdditionalImages(prevImages => [...prevImages, ...(data || [])]);
      toast({
        title: "Images Uploaded",
        description: "Images have been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      const { error } = await ProductService.deleteProductImage(imageUrl);
      if (error) throw error;

      setAdditionalImages(prevImages => prevImages.filter(img => img !== imageUrl));
      toast({
        title: "Image Removed",
        description: "Image has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMainImage = (imageUrl: string) => {
    setMainImage(imageUrl);
    toast({
      title: "Main Image Set",
      description: "Main image has been set successfully.",
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price?.toString() || '');
    setStockQuantity(product.stock_quantity?.toString() || '');
    setCategory(product.category);
    setSubcategory(product.subcategory || '');
    setBrand(product.brand || '');
    setSku(product.sku || '');
    setTags(product.tags?.join(',') || '');
    setMainImage(product.main_image || '');
    setAdditionalImages(product.images || []);
    setSpecifications(product.specifications ? JSON.stringify(product.specifications) : '');
    setIsFeatured(product.is_featured);
    setCommissionPercentage(product.commission_percentage?.toString() || '');
    setPickupLocation(product.pickup_location || '');
    setPickupPhone(product.pickup_phone || '');
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await ProductService.deleteProduct(id);
      if (error) throw error;

      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !category || !pickupLocation || !pickupPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including pickup location and phone.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const productData = {
        vendor_id: user.id,
        name,
        description,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
        stock_quantity: parseInt(stockQuantity),
        category,
        subcategory: subcategory || null,
        brand: brand || null,
        sku: sku || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        main_image: mainImage || null,
        images: additionalImages,
        specifications: specifications ? JSON.parse(specifications) : null,
        is_featured: isFeatured,
        is_active: true,
        pickup_location: pickupLocation,
        pickup_phone: pickupPhone,
        rating: 0,
        review_count: 0,
        commission_percentage: commissionPercentage ? parseFloat(commissionPercentage) : null
      };

      if (editingProduct) {
        const { error } = await ProductService.updateProduct(editingProduct.id, productData);
        if (error) throw error;
        
        toast({
          title: "Product Updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        const { error } = await ProductService.createProduct(productData);
        if (error) throw error;
        
        toast({
          title: "Product Created",
          description: "Your product has been created successfully.",
        });
      }

      // Reset form
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setStockQuantity('');
    setCategory('');
    setSubcategory('');
    setBrand('');
    setSku('');
    setTags('');
    setMainImage('');
    setAdditionalImages([]);
    setSpecifications('');
    setIsFeatured(false);
    setCommissionPercentage('');
    setPickupLocation('');
    setPickupPhone('');
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Manage Products</h2>
      </div>

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-4">No products found. Add a new product below.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-md p-4">
                  <div className="relative">
                    <img
                      src={product.main_image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button size="icon" variant="secondary" onClick={() => handleEditProduct(product)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.082.285a.75.75 0 00.69 1.352l.283-.079a5.25 5.25 0 002.214-1.32L19.513 8.199z" />
                        </svg>
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">KES {product.price}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  required
                />
              </div>
              <div>
                <Label htmlFor="original-price">Original Price</Label>
                <Input
                  id="original-price"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Original Price (if different)"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Stock Quantity"
                />
              </div>
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Subcategory"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                />
              </div>
            </div>

            {/* Description and Tags */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags"
              />
            </div>

            {/* Pickup Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pickup-location">Pickup Location *</Label>
                <Input
                  id="pickup-location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Where customers can pickup this item"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide clear location details for customer pickup
                </p>
              </div>
              <div>
                <Label htmlFor="pickup-phone">Pickup Contact Phone *</Label>
                <Input
                  id="pickup-phone"
                  value={pickupPhone}
                  onChange={(e) => setPickupPhone(e.target.value)}
                  placeholder="254700000000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number customers can call for pickup inquiries
                </p>
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Images</Label>
              <div className="flex items-center space-x-4">
                <Input type="file" id="image-upload" multiple onChange={handleImageUpload} className="hidden" />
                <Label htmlFor="image-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2 px-4">
                  <Plus className="inline-block w-4 h-4 mr-2" />
                  Add Images
                </Label>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt={`Additional Image ${index}`} className="w-full h-24 object-cover rounded-md" />
                    <div className="absolute top-0 right-0 flex space-x-1">
                      <Button size="icon" variant="outline" onClick={() => handleSetMainImage(img)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 01-.75.75H9.75a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zm0 4.5a.75.75 0 01-.75.75H9.75a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zm0 4.5a.75.75 0 01-.75.75H9.75a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75z" />
                        </svg>
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleRemoveImage(img)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {mainImage && (
                <div className="mt-2">
                  <Label>Main Image</Label>
                  <img src={mainImage} alt="Main Image" className="w-32 h-32 object-cover rounded-md" />
                </div>
              )}
            </div>

            {/* Specifications */}
            <div>
              <Label htmlFor="specifications">Specifications (JSON)</Label>
              <Textarea
                id="specifications"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder='e.g., {"color": "red", "size": "large"}'
              />
            </div>

            {/* Featured Product */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked || false)}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            {/* Commission Percentage */}
            <div>
              <Label htmlFor="commission">Commission Percentage</Label>
              <Input
                id="commission"
                type="number"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
                placeholder="Commission Percentage"
              />
            </div>

            {/* Submit Button */}
            <Button disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProductManagement;
