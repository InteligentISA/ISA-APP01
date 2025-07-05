import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ProductService } from '@/services/productService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Product } from '@/types/product';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Edit, Trash2 } from "lucide-react";

interface VendorProductManagementProps {
  user: any;
}

const VendorProductManagement = ({ user }: VendorProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    tags: [] as string[],
    stock_quantity: 0,
    is_featured: false,
    is_active: true,
    commission_percentage: 0,
    pickup_location: '',
    pickup_phone: ''
  });

  useEffect(() => {
    if (user) {
      loadProducts();
      loadCategories();
    }
  }, [user]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ProductService.getVendorProducts(user.id);
      if (error) {
        toast({
          title: "Error loading products",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProducts(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message || "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await ProductService.getCategories();
      if (error) {
        toast({
          title: "Error loading categories",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCategories(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message || "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  const handleOpenModal = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      category: '',
      subcategory: '',
      brand: '',
      sku: '',
      tags: [] as string[],
      stock_quantity: 0,
      is_featured: false,
      is_active: true,
      commission_percentage: 0,
      pickup_location: '',
      pickup_phone: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: any) => {
    const { name, checked } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: checked }));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || 0,
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      sku: product.sku || '',
      tags: product.tags || [],
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
      is_active: product.is_active,
      commission_percentage: product.commission_percentage || 0,
      pickup_location: product.pickup_location || '',
      pickup_phone: product.pickup_phone || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductService.deleteProduct(productId);
        setProducts(prev => prev.filter(product => product.id !== productId));
        toast({
          title: "Product deleted",
          description: "Product has been successfully deleted.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock_quantity || !newProduct.pickup_location || !newProduct.pickup_phone) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = {
          ...editingProduct,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          original_price: newProduct.original_price,
          category: newProduct.category,
          subcategory: newProduct.subcategory,
          brand: newProduct.brand,
          sku: newProduct.sku,
          tags: newProduct.tags,
          stock_quantity: newProduct.stock_quantity,
          is_featured: newProduct.is_featured,
          is_active: newProduct.is_active,
          commission_percentage: newProduct.commission_percentage,
          pickup_location: newProduct.pickup_location,
          pickup_phone: newProduct.pickup_phone
        };
        await ProductService.updateProduct(updatedProduct.id, updatedProduct);
        setProducts(prev => prev.map(product => product.id === updatedProduct.id ? updatedProduct : product));
        toast({
          title: "Product updated",
          description: "Product has been successfully updated.",
        });
      } else {
        // Create new product
        const productData = {
          ...newProduct,
          vendor_id: user.id,
          rating: 0,
          review_count: 0,
          pickup_location: newProduct.pickup_location,
          pickup_phone: newProduct.pickup_phone
        };
        await ProductService.createProduct(productData);
        loadProducts(); // Reload products to reflect the new product
        toast({
          title: "Product created",
          description: "Product has been successfully created.",
        });
      }
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive",
      });
    } finally {
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        original_price: 0,
        category: '',
        subcategory: '',
        brand: '',
        sku: '',
        tags: [],
        stock_quantity: 0,
        is_featured: false,
        is_active: true,
        commission_percentage: 0,
        pickup_location: '',
        pickup_phone: ''
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No products found. Add a product to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>KES {product.price}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{product.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={showModal} onOpenChange={setShowModal}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</SheetTitle>
            <SheetDescription>
              {editingProduct ? 'Edit the details of your product.' : 'Create a new product for your store.'}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Product name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  required
                />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  name="original_price"
                  type="number"
                  value={newProduct.original_price}
                  onChange={handleInputChange}
                  placeholder="Original Price"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={newProduct.subcategory}
                onChange={handleInputChange}
                placeholder="Subcategory"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={newProduct.brand}
                onChange={handleInputChange}
                placeholder="Brand"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={newProduct.sku}
                onChange={handleInputChange}
                placeholder="SKU"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={newProduct.tags.join(',')}
                onChange={handleInputChange}
                placeholder="Tags (comma separated)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                value={newProduct.stock_quantity}
                onChange={handleInputChange}
                placeholder="Stock Quantity"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                name="is_featured"
                checked={newProduct.is_featured}
                onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, is_featured: !!checked }))}
              />
              <Label htmlFor="is_featured">Is Featured</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                name="is_active"
                checked={newProduct.is_active}
                onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, is_active: !!checked }))}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission_percentage">Commission Percentage</Label>
              <Input
                id="commission_percentage"
                name="commission_percentage"
                type="number"
                value={newProduct.commission_percentage}
                onChange={handleInputChange}
                placeholder="Commission Percentage"
              />
            </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup_location">Pickup Location *</Label>
                      <Input
                        id="pickup_location"
                        value={newProduct.pickup_location}
                        onChange={(e) => setNewProduct({...newProduct, pickup_location: e.target.value})}
                        placeholder="Where can buyers pickup this item?"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickup_phone">Pickup Contact Phone *</Label>
                      <Input
                        id="pickup_phone"
                        value={newProduct.pickup_phone}
                        onChange={(e) => setNewProduct({...newProduct, pickup_phone: e.target.value})}
                        placeholder="Phone number for pickup inquiries"
                        required
                      />
                    </div>
                  </div>
          </div>
          <SheetFooter>
            <Button type="submit" onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VendorProductManagement;
