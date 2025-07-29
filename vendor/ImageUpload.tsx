import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Link as LinkIcon,
  Camera,
  Edit,
  Trash2
} from "lucide-react";
import { ImageUploadService } from "@/services/imageUploadService";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (result: any) => void;
  onImageRemove: (imageUrl: string) => void;
  existingImages?: string[];
  multiple?: boolean;
  maxImages?: number;
}

interface ImageData {
  url: string;
  description: string;
  isMain: boolean;
  type: 'upload' | 'link';
}

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  existingImages = [], 
  multiple = false, 
  maxImages = 5 
}: ImageUploadProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize images from existing images
  useState(() => {
    if (existingImages.length > 0) {
      const initialImages = existingImages.map((url, index) => ({
        url,
        description: `Image ${index + 1}`,
        isMain: index === 0,
        type: 'upload' as const
      }));
      setImages(initialImages);
    }
  });

  const handleFileUpload = async (files: FileList) => {
    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const file = files[0];
      const result = await ImageUploadService.uploadImage(file);
      
      if (result.error) {
        throw new Error(result.error);
      }

      const newImage: ImageData = {
        url: result.url,
        description: `Image ${images.length + 1}`,
        isMain: images.length === 0,
        type: 'upload'
      };

      setImages(prev => [...prev, newImage]);
      onImageUpload(result);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLinkAdd = () => {
    if (!linkUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only add up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    const newImage: ImageData = {
      url: linkUrl.trim(),
      description: linkDescription.trim() || `Image ${images.length + 1}`,
      isMain: images.length === 0,
      type: 'link'
    };

    setImages(prev => [...prev, newImage]);
    onImageUpload({ url: linkUrl.trim() });
    
    setLinkUrl("");
    setLinkDescription("");
    setShowLinkDialog(false);
    
    toast({
      title: "Success",
      description: "Image link added successfully"
    });
  };

  const handleImageRemove = (imageUrl: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.url !== imageUrl);
      // If we removed the main image, make the first remaining image the main one
      if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
        newImages[0].isMain = true;
      }
      return newImages;
    });
    onImageRemove(imageUrl);
  };

  const handleSetMainImage = (imageUrl: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.url === imageUrl
    })));
  };

  const handleDescriptionChange = (imageUrl: string, description: string) => {
    setImages(prev => prev.map(img => 
      img.url === imageUrl ? { ...img, description } : img
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
          uploading ? 'opacity-50 pointer-events-none' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Upload Product Images
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= maxImages || uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLinkDialog(true)}
              disabled={images.length >= maxImages}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Add Image Link
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <Label>Product Images ({images.length}/{maxImages})</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={image.url} className="relative group">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.description}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Image Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 bg-white/90 hover:bg-white"
                        onClick={() => handleSetMainImage(image.url)}
                        disabled={image.isMain}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8 bg-red-500/90 hover:bg-red-500"
                        onClick={() => handleImageRemove(image.url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.isMain && (
                        <Badge className="bg-blue-500 text-white">Main</Badge>
                      )}
                      <Badge variant="secondary">
                        {image.type === 'link' ? 'Link' : 'Upload'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600">Description</Label>
                        <Textarea
                          value={image.description}
                          onChange={(e) => handleDescriptionChange(image.url, e.target.value)}
                          placeholder="e.g., Front view, Side view, Detail shot..."
                          className="text-sm h-16 resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Image {index + 1}</span>
                        {image.isMain && (
                          <span className="text-blue-600 font-medium">Main Image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Image Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image Link</DialogTitle>
            <DialogDescription>
              Enter the URL of an image and provide a description for it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="imageDescription">Description</Label>
              <Textarea
                id="imageDescription"
                value={linkDescription}
                onChange={(e) => setLinkDescription(e.target.value)}
                placeholder="e.g., Front view, Side view, Detail shot..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkAdd}>
              Add Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
