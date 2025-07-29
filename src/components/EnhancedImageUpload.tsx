import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Link,
  FileImage
} from "lucide-react";
import { ImageUploadService, ImageUploadResult } from "@/services/imageUploadService";
import { useToast } from "@/hooks/use-toast";

export interface ProductImageData {
  id: string;
  image_url: string;
  image_description: string;
  is_main_image: boolean;
  display_order: number;
  source: 'upload' | 'link';
}

interface EnhancedImageUploadProps {
  onImagesChange: (images: ProductImageData[]) => void;
  existingImages?: ProductImageData[];
  maxImages?: number;
  className?: string;
}

interface UploadingImage {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  result?: ImageUploadResult;
  description: string;
}

interface LinkImage {
  url: string;
  description: string;
  status: 'validating' | 'valid' | 'invalid';
  preview?: string;
}

const EnhancedImageUpload = ({ 
  onImagesChange, 
  existingImages = [], 
  maxImages = 5,
  className = ""
}: EnhancedImageUploadProps) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [linkImages, setLinkImages] = useState<LinkImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Combine all images for validation
  const totalImages = existingImages.length + uploadingImages.length + linkImages.length;

  const validateImageUrl = async (url: string): Promise<{ valid: boolean; preview?: string }> => {
    try {
      // Basic URL validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false };
      }

      // Check if it's an image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );

      if (!hasImageExtension) {
        return { valid: false };
      }

      // Try to load the image to validate it
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ valid: true, preview: url });
        img.onerror = () => resolve({ valid: false });
        img.src = url;
      });
    } catch {
      return { valid: false };
    }
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (totalImages + fileArray.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    const newUploadingImages: UploadingImage[] = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      description: ''
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload each image
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadIndex = uploadingImages.length + i;
      
      try {
        const result = await ImageUploadService.uploadImage(file);
        
        setUploadingImages(prev => prev.map((img, index) => 
          index === uploadIndex 
            ? { ...img, status: result.error ? 'error' : 'success', result }
            : img
        ));

        if (!result.error) {
          toast({
            title: "Upload successful",
            description: `${file.name} uploaded successfully`
          });
        } else {
          toast({
            title: "Upload failed",
            description: result.error,
            variant: "destructive"
          });
        }
      } catch (error) {
        setUploadingImages(prev => prev.map((img, index) => 
          index === uploadIndex 
            ? { ...img, status: 'error', result: { url: '', path: '', error: 'Upload failed' } }
            : img
        ));
        
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive"
        });
      }
    }
  }, [totalImages, maxImages, uploadingImages.length, toast]);

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }

    if (totalImages >= maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    const newLinkImage: LinkImage = {
      url: linkUrl.trim(),
      description: linkDescription.trim(),
      status: 'validating'
    };

    setLinkImages(prev => [...prev, newLinkImage]);
    setLinkUrl("");
    setLinkDescription("");

    // Validate the image URL
    const validation = await validateImageUrl(newLinkImage.url);
    
    setLinkImages(prev => prev.map(img => 
      img.url === newLinkImage.url 
        ? { ...img, status: validation.valid ? 'valid' : 'invalid', preview: validation.preview }
        : img
    ));

    if (!validation.valid) {
      toast({
        title: "Invalid image URL",
        description: "Please provide a valid image URL",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Image link added",
        description: "Image link validated successfully"
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadingImage = (index: number) => {
    setUploadingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeLinkImage = (url: string) => {
    setLinkImages(prev => prev.filter(img => img.url !== url));
  };

  const removeExistingImage = (imageId: string) => {
    const updatedImages = existingImages.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const updateImageDescription = (imageId: string, description: string) => {
    const updatedImages = existingImages.map(img => 
      img.id === imageId ? { ...img, image_description: description } : img
    );
    onImagesChange(updatedImages);
  };

  const updateUploadingImageDescription = (index: number, description: string) => {
    setUploadingImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description } : img
    ));
  };

  const updateLinkImageDescription = (url: string, description: string) => {
    setLinkImages(prev => prev.map(img => 
      img.url === url ? { ...img, description } : img
    ));
  };

  const setMainImage = (imageId: string) => {
    const updatedImages = existingImages.map(img => ({
      ...img,
      is_main_image: img.id === imageId
    }));
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'validating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'validating':
        return 'Validating...';
      case 'success':
        return 'Uploaded';
      case 'valid':
        return 'Valid';
      case 'error':
        return 'Failed';
      case 'invalid':
        return 'Invalid';
      default:
        return '';
    }
  };

  // Update parent component whenever images change
  const updateParentImages = useCallback(() => {
    const allImages: ProductImageData[] = [
      ...existingImages,
      ...uploadingImages
        .filter(img => img.status === 'success' && img.result)
        .map((img, index) => ({
          id: `uploading-${index}`,
          image_url: img.result!.url,
          image_description: img.description,
          is_main_image: existingImages.length === 0 && index === 0,
          display_order: existingImages.length + index,
          source: 'upload' as const
        })),
      ...linkImages
        .filter(img => img.status === 'valid')
        .map((img, index) => ({
          id: `link-${index}`,
          image_url: img.url,
          image_description: img.description,
          is_main_image: existingImages.length === 0 && uploadingImages.length === 0 && index === 0,
          display_order: existingImages.length + uploadingImages.length + index,
          source: 'link' as const
        }))
    ];

    onImagesChange(allImages);
  }, [existingImages, uploadingImages, linkImages, onImagesChange]);

  // Update parent whenever images change
  React.useEffect(() => {
    updateParentImages();
  }, [updateParentImages]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Image Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, JPEG, WebP up to 500KB each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 400x400px • Max: {maxImages} images
                </p>
              </div>
              <Button onClick={openFileDialog} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple={true}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Uploading Images */}
          {uploadingImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploading Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadingImages.map((image, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-3">
                      <div className="relative aspect-square mb-3">
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          {getStatusIcon(image.status)}
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => removeUploadingImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 truncate">{image.file.name}</p>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={image.description}
                            onChange={(e) => updateUploadingImageDescription(index, e.target.value)}
                            placeholder="Describe this image..."
                            className="text-xs h-16"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={image.status === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {getStatusText(image.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {(image.file.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      </div>
                      {image.status === 'error' && image.result?.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="w-3 h-3" />
                          <AlertDescription className="text-xs">
                            {image.result.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          {/* Add Image Link Form */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="imageDescription">Description</Label>
                  <Textarea
                    id="imageDescription"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="Describe this image..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={handleAddLink} 
                  disabled={!linkUrl.trim() || totalImages >= maxImages}
                  className="w-full"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Add Image Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Link Images */}
          {linkImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Image Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {linkImages.map((image, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-3">
                      <div className="relative aspect-square mb-3">
                        {image.preview ? (
                          <img
                            src={image.preview}
                            alt="Image preview"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          {getStatusIcon(image.status)}
                        </div>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => removeLinkImage(image.url)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 truncate">{image.url}</p>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={image.description}
                            onChange={(e) => updateLinkImageDescription(image.url, e.target.value)}
                            placeholder="Describe this image..."
                            className="text-xs h-16"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={image.status === 'invalid' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {getStatusText(image.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Link
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingImages.map((image) => (
              <Card key={image.id} className="relative">
                <CardContent className="p-3">
                  <div className="relative aspect-square mb-3">
                    <img
                      src={image.image_url}
                      alt={image.image_description || "Product image"}
                      className="w-full h-full object-cover rounded"
                    />
                    {image.is_main_image && (
                      <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs">
                        Main
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => removeExistingImage(image.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={image.image_description || ""}
                        onChange={(e) => updateImageDescription(image.id, e.target.value)}
                        placeholder="Describe this image..."
                        className="text-xs h-16"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {image.source === 'upload' ? 'Uploaded' : 'Link'}
                      </Badge>
                      {!image.is_main_image && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMainImage(image.id)}
                          className="text-xs h-6"
                        >
                          Set as Main
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-500">
        {totalImages} of {maxImages} images
      </div>
    </div>
  );
};

export default EnhancedImageUpload; 