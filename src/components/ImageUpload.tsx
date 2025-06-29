import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { ImageUploadService, ImageUploadResult } from "@/services/imageUploadService";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (result: ImageUploadResult) => void;
  onImageRemove?: (imageUrl: string) => void;
  existingImages?: string[];
  multiple?: boolean;
  maxImages?: number;
  className?: string;
}

interface UploadingImage {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  result?: ImageUploadResult;
}

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  existingImages = [], 
  multiple = false, 
  maxImages = 5,
  className = ""
}: ImageUploadProps) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalImages = existingImages.length + uploadingImages.length + fileArray.length;
    
    if (totalImages > maxImages) {
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
      status: 'uploading'
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
          onImageUpload(result);
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
  }, [existingImages.length, uploadingImages.length, maxImages, onImageUpload, toast]);

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
    setUploadingImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  const removeExistingImage = (imageUrl: string) => {
    if (onImageRemove) {
      onImageRemove(imageUrl);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Uploaded';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
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
        multiple={multiple}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Uploading Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadingImages.map((image, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
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
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 truncate">{image.file.name}</p>
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

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingImages.map((imageUrl, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    {onImageRemove && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6"
                        onClick={() => removeExistingImage(imageUrl)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Current Image
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-500">
        {existingImages.length + uploadingImages.length} of {maxImages} images
      </div>
    </div>
  );
};

export default ImageUpload; 