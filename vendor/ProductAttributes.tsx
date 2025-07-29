import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Tag } from "lucide-react";
import { ProductAttribute } from "@/types/product";

interface ProductAttributesProps {
  category: string;
  subcategory?: string;
  attributes: ProductAttribute[];
  onAttributesChange: (attributes: Omit<ProductAttribute, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]) => void;
}

interface AttributeField {
  name: string;
  type: 'text' | 'select';
  options?: string[];
  required?: boolean;
}

const ProductAttributes = ({ 
  category, 
  subcategory, 
  attributes, 
  onAttributesChange 
}: ProductAttributesProps) => {
  const [localAttributes, setLocalAttributes] = useState<Omit<ProductAttribute, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([]);
  const [customAttributeName, setCustomAttributeName] = useState("");
  const [customAttributeValue, setCustomAttributeValue] = useState("");

  // Define attribute fields based on category and subcategory
  const getAttributeFields = (): AttributeField[] => {
    if (category === "Fashion") {
      const baseFields: AttributeField[] = [
        { name: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"], required: true },
        { name: "Color", type: "text", required: true },
        { name: "Material", type: "text" },
        { name: "Style", type: "text" },
        { name: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls", "Baby"] },
        { name: "Age Group", type: "select", options: ["Infant", "Toddler", "Kids", "Teen", "Adult"] }
      ];

      // Add specific fields for shoes
      if (subcategory?.toLowerCase().includes("shoes") || subcategory?.toLowerCase().includes("footwear")) {
        return [
          { name: "Shoe Size", type: "select", options: [
            "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13"
          ], required: true },
          { name: "Color", type: "text", required: true },
          { name: "Material", type: "text" },
          { name: "Style", type: "select", options: ["Casual", "Formal", "Sports", "Boots", "Sandals", "Slippers"] },
          { name: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
          { name: "Age Group", type: "select", options: ["Kids", "Teen", "Adult"] }
        ];
      }

      // Add specific fields for clothing
      if (subcategory?.toLowerCase().includes("clothing")) {
        return [
          { name: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"], required: true },
          { name: "Color", type: "text", required: true },
          { name: "Material", type: "text" },
          { name: "Style", type: "select", options: ["Casual", "Formal", "Business", "Sportswear", "Evening", "Beach"] },
          { name: "Clothing Type", type: "select", options: ["T-Shirt", "Shirt", "Dress", "Pants", "Jeans", "Skirt", "Jacket", "Coat", "Sweater", "Hoodie"] },
          { name: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
          { name: "Age Group", type: "select", options: ["Kids", "Teen", "Adult"] }
        ];
      }

      return baseFields;
    }

    return [];
  };

  const attributeFields = getAttributeFields();

  useEffect(() => {
    // Initialize local attributes from props
    if (attributes.length > 0) {
      setLocalAttributes(attributes.map(attr => ({
        attribute_name: attr.attribute_name,
        attribute_value: attr.attribute_value
      })));
    }
  }, [attributes]);

  useEffect(() => {
    // Notify parent of changes
    onAttributesChange(localAttributes);
  }, [localAttributes, onAttributesChange]);

  const addAttribute = (name: string, value: string) => {
    if (!name.trim() || !value.trim()) return;
    
    // Check if attribute already exists
    if (localAttributes.some(attr => attr.attribute_name === name.trim())) {
      return;
    }

    setLocalAttributes(prev => [...prev, {
      attribute_name: name.trim(),
      attribute_value: value.trim()
    }]);
  };

  const removeAttribute = (name: string) => {
    setLocalAttributes(prev => prev.filter(attr => attr.attribute_name !== name));
  };

  const updateAttribute = (name: string, value: string) => {
    setLocalAttributes(prev => prev.map(attr => 
      attr.attribute_name === name 
        ? { ...attr, attribute_value: value }
        : attr
    ));
  };

  const addCustomAttribute = () => {
    addAttribute(customAttributeName, customAttributeValue);
    setCustomAttributeName("");
    setCustomAttributeValue("");
  };

  if (category !== "Fashion") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Product Attributes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Predefined Attributes */}
        {attributeFields.map((field) => {
          const existingAttribute = localAttributes.find(attr => attr.attribute_name === field.name);
          
          return (
            <div key={field.name} className="space-y-2">
              <Label className="flex items-center gap-2">
                {field.name}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.type === 'select' ? (
                <Select
                  value={existingAttribute?.attribute_value || ""}
                  onValueChange={(value) => {
                    if (existingAttribute) {
                      updateAttribute(field.name, value);
                    } else {
                      addAttribute(field.name, value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={existingAttribute?.attribute_value || ""}
                    onChange={(e) => {
                      if (existingAttribute) {
                        updateAttribute(field.name, e.target.value);
                      } else {
                        addAttribute(field.name, e.target.value);
                      }
                    }}
                    placeholder={`Enter ${field.name}`}
                  />
                  {existingAttribute && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAttribute(field.name)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Attributes */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium">Add Custom Attribute</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={customAttributeName}
              onChange={(e) => setCustomAttributeName(e.target.value)}
              placeholder="Attribute name"
              className="flex-1"
            />
            <Input
              value={customAttributeValue}
              onChange={(e) => setCustomAttributeValue(e.target.value)}
              placeholder="Attribute value"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomAttribute}
              disabled={!customAttributeName.trim() || !customAttributeValue.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Display Current Attributes */}
        {localAttributes.length > 0 && (
          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Current Attributes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {localAttributes.map((attr) => (
                <Badge key={attr.attribute_name} variant="secondary" className="flex items-center gap-1">
                  <span className="font-medium">{attr.attribute_name}:</span>
                  <span>{attr.attribute_value}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeAttribute(attr.attribute_name)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductAttributes; 