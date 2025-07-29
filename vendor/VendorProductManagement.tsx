import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Upload, 
  Image as ImageIcon,
  Package,
  DollarSign,
  Star,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Product, ProductAttribute, ProductImage } from "@/types/product";
import { ProductService } from "@/services/productService";
import { ImageUploadService } from "@/services/imageUploadService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "./ImageUpload";
import ProductAttributes from "./ProductAttributes";

interface VendorProductManagementProps {
  user: any;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  stock_quantity: number;
  sku?: string;
  tags: string[];
  specifications: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  main_image?: string;
  images?: string[];
  commission_percentage?: number;
  pickup_location?: string;
  pickup_phone_number?: string;
}

// 1. Add the full category tree and types at the top
export interface CategoryNode {
  name: string;
  sub?: CategoryNode[];
  extraFields?: string[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  { name: "Electronics", sub: [
    { name: "Mobile Phones & Tablets", sub: [
      { name: "Smartphones" },
      { name: "Feature Phones" },
      { name: "Tablets" },
      { name: "Phone Accessories", sub: [
        { name: "Chargers" },
        { name: "Cases & Covers" },
        { name: "Screen Protectors" },
        { name: "Power Banks" }
      ] }
    ] },
    { name: "Computers & Accessories", sub: [
      { name: "Laptops" },
      { name: "Desktops" },
      { name: "Monitors" },
      { name: "Keyboards & Mice" },
      { name: "Printers & Scanners" },
      { name: "Computer Components", sub: [
        { name: "RAM" },
        { name: "Hard Drives or SSD" },
        { name: "Graphics Cards" }
      ] }
    ] },
    { name: "TV, Audio & Video", sub: [
      { name: "Televisions" },
      { name: "Home Theaters" },
      { name: "Speakers" },
      { name: "Projectors" },
      { name: "Soundbars" }
    ] },
    { name: "Cameras & Accessories", sub: [
      { name: "Digital Cameras" },
      { name: "DSLR & Mirrorless Cameras" },
      { name: "Camera Lenses" },
      { name: "Tripods & Stabilizers" },
      { name: "Security Cameras" }
    ] }
  ], extraFields: ["RAM", "Storage", "Processor", "Display Size"] },
  { name: "Fashion", sub: [
    { name: "Women's Fashion", sub: [
      { name: "Clothing" }, { name: "Shoes" }, { name: "Handbags & Wallets" }, { name: "Jewelry & Watches" }, { name: "Lingerie & Sleepwear" }
    ] },
    { name: "Men's Fashion", sub: [
      { name: "Clothing" }, { name: "Shoes" }, { name: "Belts & Wallets" }, { name: "Watches" }
    ] },
    { name: "Kids & Baby Fashion", sub: [
      { name: "Girls' Clothing" }, { name: "Boys' Clothing" }, { name: "Baby Clothing" }, { name: "School Uniforms" }, { name: "Shoes" }
    ] }
  ] },
  { name: "Swimwear", sub: [
    { name: "Women's Swimwear", sub: [
      { name: "One-Piece Swimsuits" }, { name: "Bikinis" }, { name: "Tankinis" }, { name: "Swim Dresses" }, { name: "Cover-ups & Sarongs" }, { name: "Plus Size Swimwear" }, { name: "Maternity Swimwear" }
    ] },
    { name: "Men's Swimwear", sub: [
      { name: "Swim Trunks" }, { name: "Board Shorts" }, { name: "Briefs" }, { name: "Jammers" }
    ] },
    { name: "Kids' Swimwear", sub: [
      { name: "Girls' Swimsuits" }, { name: "One-Piece" }, { name: "Two-Piece" }, { name: "Boys' Swimsuits" }, { name: "Swim Shorts" }, { name: "Rash Guards" }, { name: "Swim Diapers" }
    ] },
    { name: "Accessories", sub: [
      { name: "Swimming Goggles" }, { name: "Swim Caps" }, { name: "Beach Towels" }, { name: "Flip-Flops" }, { name: "Swim Bags" }, { name: "UV Protection Swimwear" }
    ] }
  ] },
  { name: "Home & Living", sub: [
    { name: "Furniture", sub: [
      { name: "Beds & Mattresses" }, { name: "Sofas & Couches" }, { name: "Dining Sets" }, { name: "Wardrobes" }, { name: "Office Desks" }
    ] },
    { name: "Home Décor", sub: [
      { name: "Curtains" }, { name: "Wall Art" }, { name: "Rugs & Carpets" }, { name: "Lighting" }, { name: "Clocks" }
    ] },
    { name: "Kitchen & Dining", sub: [
      { name: "Cookware" }, { name: "Bakeware" }, { name: "Dinner Sets" }, { name: "Utensils" }, { name: "Storage Containers" }
    ] },
    { name: "Home Essentials", sub: [
      { name: "Brooms & Mops" }, { name: "Laundry Baskets" }, { name: "Buckets & Basins" }, { name: "Dustbins" }
    ] }
  ] },
  { name: "Books & Stationery", sub: [
    { name: "Academic Books" }, { name: "Novels" }, { name: "Religious Books" }, { name: "Notebooks & Diaries" }, { name: "Pens & Pencils" }, { name: "Calculators" }, { name: "Art Supplies" }
  ] },
  { name: "Baby Products", sub: [
    { name: "Diapers & Wipes" }, { name: "Baby Food" }, { name: "Baby Bath & Skincare" }, { name: "Nursing & Feeding" }, { name: "Baby Gear", sub: [
      { name: "Strollers" }, { name: "Car Seats" }, { name: "Baby Carriers" }
    ] }
  ] },
  { name: "Health & Beauty", sub: [
    { name: "Beauty", sub: [
      { name: "Makeup" }, { name: "Skincare" }, { name: "Haircare" }, { name: "Fragrances" }, { name: "Beauty Tools" }
    ] }
  ] },
  { name: "Tools & Home Improvement", sub: [
    { name: "Power Tools" }, { name: "Hand Tools" }, { name: "Plumbing Supplies" }, { name: "Electrical Fixtures" }, { name: "Paint & Wall Treatments" }
  ] },
  { name: "Automotive", sub: [
    { name: "Car Accessories", sub: [
      { name: "Seat Covers" }, { name: "Air Fresheners" }, { name: "Car Vacuum Cleaners" }
    ] },
    { name: "Spear parts" }, { name: "Motor Oil & Fluids" }, { name: "Tyres & Rims" }, { name: "Motorcycles & Scooters" }, { name: "Helmets & Riding Gear" }
  ] },
  { name: "Travel & Luggage", sub: [
    { name: "Suitcases" }, { name: "Travel Backpacks" }, { name: "Duffel Bags" }, { name: "Travel Accessories" }
  ] },
  { name: "Groceries", sub: [
    { name: "Beverages", sub: [
      { name: "Water" }, { name: "Juice" }, { name: "Soft Drinks" }
    ] },
    { name: "Dry Foods", sub: [
      { name: "Rice" }, { name: "Pasta" }, { name: "Cereals" }, { name: "Snacks" }
    ] },
    { name: "Spices & Condiments", sub: [
      { name: "Household Essentials" }, { name: "Tissue Paper" }, { name: "Detergents" }, { name: "Cleaning Products" }
    ] }
  ] },
  { name: "Office & Industrial", sub: [
    { name: "Office Furniture" }, { name: "Printers & Toners" }, { name: "Office Electronics" }, { name: "Packaging Materials" }, { name: "Safety & Security Equipment" }
  ] },
  { name: "Alcoholic Beverages", sub: [
    { name: "Beer", sub: [
      { name: "Lager" }, { name: "Stout" }, { name: "Ale" }, { name: "Craft Beer" }, { name: "Non-Alcoholic Beer" }
    ] },
    { name: "Wine", sub: [
      { name: "Red Wine" }, { name: "Merlot" }, { name: "Cabernet Sauvignon" }, { name: "Shiraz" }, { name: "White Wine" }, { name: "Chardonnay" }, { name: "Sauvignon Blanc" }, { name: "Rosé Wine" }, { name: "Sparkling Wine" }, { name: "Champagne" }, { name: "Prosecco" }, { name: "Fortified Wine" }, { name: "Port" }, { name: "Sherry" }
    ] },
    { name: "Spirits", sub: [
      { name: "Whisky" }, { name: "Scotch Whisky" }, { name: "Bourbon" }, { name: "Irish Whiskey" }, { name: "Vodka" }, { name: "Gin" }
    ] },
    { name: "Alcohol Gift Sets & Accessories", sub: [
      { name: "Gift Packs (Assorted)" }, { name: "Wine Openers" }, { name: "Hip Flasks" }, { name: "Whiskey Stones" }, { name: "Bar Sets & Glassware" }
    ] }
  ] }
];

const VendorProductManagement = ({ user }: VendorProductManagementProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [banReasonDialogOpen, setBanReasonDialogOpen] = useState(false);
  const [banReasonText, setBanReasonText] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    category: "",
    subcategory: "",
    brand: "",
    stock_quantity: 0,
    sku: "",
    tags: [],
    specifications: {},
    is_featured: false,
    is_active: true,
    main_image: "",
    images: [],
    commission_percentage: undefined,
    pickup_location: "",
    pickup_phone_number: ""
  });

  const [productAttributes, setProductAttributes] = useState<Omit<ProductAttribute, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([]);
  const [productImages, setProductImages] = useState<Omit<ProductImage, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([]);

  const [tagInput, setTagInput] = useState("");

  // 2. Replace category state with cascading selection state
  const [mainCategory, setMainCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [subSubCategory, setSubSubCategory] = useState<string>("");
  const [extraFields, setExtraFields] = useState<{ [key: string]: string }>({});

  // 3. Helper to get subcategories for a given main category
  const getSubcategories = (main: string) => {
    const node = CATEGORY_TREE.find(cat => cat.name === main);
    return node?.sub || [];
  };
  const getSubSubcategories = (main: string, sub: string) => {
    const node = CATEGORY_TREE.find(cat => cat.name === main)?.sub?.find(s => s.name === sub);
    return node?.sub || [];
  };
  const getExtraFields = (main: string) => {
    const node = CATEGORY_TREE.find(cat => cat.name === main);
    return node?.extraFields || [];
  };

  // Fetch vendor's products
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await ProductService.getProductsByVendor(user.id);
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } else {
        setProducts(result.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await ProductService.getCategories();
      if (!result.error) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !mainCategory) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        ...formData,
        vendor_id: user.id,
        price: parseFloat(formData.price.toString()),
        original_price: formData.original_price ? parseFloat(formData.original_price.toString()) : undefined,
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        main_category: mainCategory,
        category: mainCategory,
        subcategory: subCategory,
        sub_subcategory: subSubCategory,
        ...(mainCategory === 'Electronics' ? {
          ram: extraFields['RAM'] || null,
          storage: extraFields['Storage'] || null,
          processor: extraFields['Processor'] || null,
          display_size: extraFields['Display Size'] || null,
        } : {}),
        rating: 0,
        review_count: 0,
      };

      let productId: string;

      if (editingProduct) {
        const result = await ProductService.updateProduct(editingProduct.id, productData, user.id);
        if (result.error) {
          throw new Error(result.error.message);
        }
        productId = editingProduct.id;
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        const result = await ProductService.createProduct(productData);
        if (result.error) {
          throw new Error(result.error.message);
        }
        productId = result.data[0].id;
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      // Save product attributes if it's a fashion item
      if (mainCategory === 'Fashion' && productAttributes.length > 0) {
        await ProductService.updateProductAttributes(productId, productAttributes);
      }

      // Save product images with descriptions
      if (productImages.length > 0) {
        await ProductService.updateProductImages(productId, productImages);
      }

      setShowAddDialog(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price,
      category: product.category,
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      stock_quantity: product.stock_quantity || 0,
      sku: product.sku || "",
      tags: product.tags || [],
      specifications: product.specifications || {},
      is_featured: product.is_featured || false,
      is_active: product.is_active !== undefined ? product.is_active : true,
      main_image: product.main_image,
      images: product.images || [],
      commission_percentage: product.commission_percentage,
      pickup_location: product.pickup_location || "",
      pickup_phone_number: product.pickup_phone_number || ""
    });
    setMainCategory(product.category);
    setSubCategory(product.subcategory || "");
    setShowAddDialog(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const result = await ProductService.deleteProduct(productId);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      category: "",
      subcategory: "",
      brand: "",
      stock_quantity: 0,
      sku: "",
      tags: [],
      specifications: {},
      is_featured: false,
      is_active: true,
      main_image: "",
      images: [],
      commission_percentage: undefined,
      pickup_location: "",
      pickup_phone_number: ""
    });
    setTagInput("");
    setMainCategory("");
    setSubCategory("");
    setSubSubCategory("");
    setExtraFields({});
    setProductAttributes([]);
    setProductImages([]);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle image upload
  const handleImageUpload = (result: any) => {
    if (result.error) {
      toast({
        title: "Upload Failed",
        description: result.error,
        variant: "destructive"
      });
      return;
    }

    // Set as main image if no main image exists
    if (!formData.main_image) {
      setFormData(prev => ({ ...prev, main_image: result.url }));
    }

    // Add to images array
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), result.url]
    }));

    // Add to product images with description
    const newImage: Omit<ProductImage, 'id' | 'product_id' | 'created_at' | 'updated_at'> = {
      image_url: result.url,
      image_description: `Image ${productImages.length + 1}`,
      display_order: productImages.length,
      is_main_image: productImages.length === 0
    };

    setProductImages(prev => [...prev, newImage]);
  };

  // Handle image removal
  const handleImageRemove = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter(img => img !== imageUrl) || [],
      main_image: prev.main_image === imageUrl ? "" : prev.main_image
    }));

    setProductImages(prev => prev.filter(img => img.image_url !== imageUrl));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KSh', 'Ksh');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Featured</p>
                    <p className="text-2xl font-bold">{products.filter(p => p.is_featured).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold">{products.filter(p => (p.stock_quantity || 0) === 0).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORY_TREE.map(category => (
                  <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading products...</span>
            </div>
          ) : filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.main_image || product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 bg-white/90 hover:bg-white"
                      onClick={() => handleEdit(product)}
                      disabled={product.banned}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8 bg-red-500/90 hover:bg-red-500"
                      onClick={() => handleDelete(product.id)}
                      disabled={product.banned}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {product.is_featured && (
                      <Badge className="bg-yellow-500 text-white">Featured</Badge>
                    )}
                    {!product.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {product.banned && (
                      <Badge className="bg-red-600 text-white">Banned by ISA team</Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">Ksh {product.price?.toLocaleString()}</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Stock: {product.stock_quantity || 0}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{(product.rating || 0).toFixed(1)} ({product.review_count || 0})</span>
                    </div>
                  </div>
                  {product.banned && product.banned_reason && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-400 hover:bg-red-50"
                        onClick={() => {
                          setBanReasonText(product.banned_reason || "");
                          setBanReasonDialogOpen(true);
                        }}
                      >
                        View Ban Reason
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== "All" 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"
              }
            </p>
            {!searchQuery && selectedCategory === "All" && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingProduct ? "Edit product information and details." : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Main Category *</Label>
                  <Select value={mainCategory} onValueChange={(value) => {
                    setMainCategory(value);
                    setSubCategory("");
                    setSubSubCategory("");
                    setFormData(prev => ({ ...prev, category: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Main Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_TREE.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {mainCategory && getSubcategories(mainCategory).length > 0 && (
                  <div>
                    <Label>Subcategory</Label>
                    <Select value={subCategory} onValueChange={(value) => {
                      setSubCategory(value);
                      setSubSubCategory("");
                      setFormData(prev => ({ ...prev, subcategory: value }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubcategories(mainCategory).map(sub => (
                          <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {mainCategory && subCategory && getSubSubcategories(mainCategory, subCategory).length > 0 && (
                  <div>
                    <Label>Sub-Subcategory</Label>
                    <Select value={subSubCategory} onValueChange={(value) => {
                      setSubSubCategory(value);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sub-Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubSubcategories(mainCategory, subCategory).map(subsub => (
                          <SelectItem key={subsub.name} value={subsub.name}>{subsub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {mainCategory === 'Electronics' && getExtraFields(mainCategory).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getExtraFields(mainCategory).map(field => (
                      <div key={field}>
                        <Label>{field}</Label>
                        <Input
                          type="text"
                          value={extraFields[field] || ''}
                          onChange={e => setExtraFields(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={`Enter ${field}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Attributes for Fashion */}
                {mainCategory === 'Fashion' && (
                  <ProductAttributes
                    category={mainCategory}
                    subcategory={subCategory}
                    attributes={productAttributes}
                    onAttributesChange={setProductAttributes}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Enter SKU Code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min={0}
                      value={formData.stock_quantity}
                      onChange={e => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup_location">Pickup Location *</Label>
                    <Textarea
                      id="pickup_location"
                      value={formData.pickup_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                      placeholder="Enter pickup location details (address, landmarks, etc.)"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup_phone_number">Pickup Phone Number *</Label>
                    <Input
                      id="pickup_phone_number"
                      type="tel"
                      value={formData.pickup_phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickup_phone_number: e.target.value }))}
                      placeholder="e.g. +254700000000"
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Now (Current Price) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Ksh</span>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        value={formData.price}
                        onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                        placeholder="e.g. 19500"
                        className="pl-14 mb-1"
                      />
                      {formData.price > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          You will receive <span className="font-semibold">{Math.floor(formData.price * 0.9)}</span>Ksh, <span className="font-semibold">{Math.ceil(formData.price * 0.1)}</span>Ksh goes to ISA maintenance
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="original_price">Was (Original Price)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Ksh</span>
                      <Input
                        id="original_price"
                        type="number"
                        min={0}
                        value={formData.original_price ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, original_price: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        placeholder="e.g. 20000"
                        className="pl-14 mb-4"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="commission_percentage">Commission Percentage (%)</Label>
                  <Input
                    id="commission_percentage"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={formData.commission_percentage ?? ''}
                    onChange={e => setFormData(prev => ({ ...prev, commission_percentage: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    placeholder="e.g. 10 for 10%"
                    className="mb-4"
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label>Product Images</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload product images. The first image will be used as the main product image.
                  </p>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    existingImages={formData.images || []}
                    multiple={true}
                    maxImages={5}
                  />
                </div>
                
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="featured">Featured Product</Label>
                    <p className="text-sm text-gray-600">Show this product in featured sections</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active">Active Product</Label>
                    <p className="text-sm text-gray-600">Make this product visible to customers</p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingProduct(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={banReasonDialogOpen} onOpenChange={setBanReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Reason</DialogTitle>
            <DialogDescription className="sr-only">
              View the reason why this product was banned.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-red-700 whitespace-pre-line">
            {banReasonText}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setBanReasonDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProductManagement;