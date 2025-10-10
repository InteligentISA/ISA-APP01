import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GuidelineFile {
  name: string;
  url: string;
  uploaded_at: string;
  size: number;
}

const VendorGuidelines = () => {
  const [file, setFile] = useState<File | null>(null);
  const [guidelines, setGuidelines] = useState<GuidelineFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from("product-images")
        .list("vendor-guidelines");

      if (error) throw error;

      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(`vendor-guidelines/${file.name}`);

          return {
            name: file.name,
            url: urlData.publicUrl,
            uploaded_at: file.created_at || new Date().toISOString(),
            size: file.metadata?.size || 0,
          };
        })
      );

      setGuidelines(filesWithUrls);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Please select a PDF file");
      }
    }
  };

  const uploadGuideline = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(`vendor-guidelines/${fileName}`, file);

      if (uploadError) throw uploadError;

      toast.success("Guideline uploaded successfully");
      setFile(null);
      fetchGuidelines();
    } catch (error: any) {
      console.error("Error uploading guideline:", error);
      toast.error(error.message || "Failed to upload guideline");
    } finally {
      setUploading(false);
    }
  };

  const deleteGuideline = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this guideline?")) return;

    try {
      const { error } = await supabase.storage
        .from("product-images")
        .remove([`vendor-guidelines/${fileName}`]);

      if (error) throw error;

      toast.success("Guideline deleted successfully");
      fetchGuidelines();
    } catch (error: any) {
      console.error("Error deleting guideline:", error);
      toast.error(error.message || "Failed to delete guideline");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ISA Vendor Guidelines</h1>
        <p className="text-muted-foreground">Manage vendor onboarding documents</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Guideline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">PDF Document</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>
          <Button
            onClick={uploadGuideline}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload Guideline"}
          </Button>
        </CardContent>
      </Card>

      {/* Guidelines List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : guidelines.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No guidelines uploaded yet
            </p>
          ) : (
            <div className="space-y-4">
              {guidelines.map((guideline) => (
                <div
                  key={guideline.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium">{guideline.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(guideline.size)} • Uploaded{" "}
                        {new Date(guideline.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(guideline.url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteGuideline(guideline.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorGuidelines;
