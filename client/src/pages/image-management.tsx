import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Download, Eye, RefreshCw, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  uploadImage, 
  listImages, 
  deleteImage, 
  IMAGE_CATEGORIES, 
  getImageUrl,
  type ImageCategory,
  type ImageKey,
  IMAGE_REGISTRY
} from '@/lib/images';

export default function ImageManagement() {
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('general');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to list images in selected category
  const { data: imageList, isLoading: isLoadingImages } = useQuery({
    queryKey: ['images', selectedCategory],
    queryFn: () => listImages(selectedCategory)
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, category, fileName }: { file: File; category: ImageCategory; fileName: string }) => {
      return uploadImage(file, category, fileName);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Upload Successful",
          description: "Image has been uploaded to Supabase storage."
        });
        queryClient.invalidateQueries({ queryKey: ['images'] });
        setUploadFile(null);
        setUploadFileName('');
        setPreviewUrl(null);
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: result.error || "Failed to upload image."
        });
      }
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Delete Successful",
          description: "Image has been removed from storage."
        });
        queryClient.invalidateQueries({ queryKey: ['images'] });
      } else {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: result.error || "Failed to delete image."
        });
      }
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Generate suggested filename based on category
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      const extension = file.name.split('.').pop();
      setUploadFileName(`${selectedCategory}-${baseName}-${timestamp}.${extension}`);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadFileName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file and enter a filename."
      });
      return;
    }

    uploadMutation.mutate({
      file: uploadFile,
      category: selectedCategory,
      fileName: uploadFileName
    });
  };

  const handleDelete = (imageKey: ImageKey) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(imageKey);
    }
  };

  const handlePreview = (imageKey: ImageKey) => {
    const url = getImageUrl(imageKey);
    window.open(url, '_blank');
  };

  const getRegisteredImages = () => {
    return Object.entries(IMAGE_REGISTRY).filter(([key, path]) => 
      path.startsWith(selectedCategory + '/')
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Image Management System</h1>
        <p className="text-gray-600">
          Centralized image management for your Supabase storage. Upload, organize, and manage images with SEO-friendly naming.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Image
          </CardTitle>
          <CardDescription>
            Upload images to your Supabase storage with automatic organization and SEO-friendly naming.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ImageCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IMAGE_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Select Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {uploadFile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">SEO-Friendly Filename</Label>
                <Input
                  id="filename"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="e.g., warehouse-interior-operations-2024.jpg"
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="max-w-xs h-32 object-cover rounded border"
                  />
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={uploadMutation.isPending}
                className="w-full md:w-auto"
              >
                {uploadMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Browse Images - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </CardTitle>
          <CardDescription>
            View and manage images in the selected category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading images...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Registered Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Registered Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRegisteredImages().map(([imageKey, imagePath]) => (
                    <Card key={imageKey} className="overflow-hidden">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <img
                          src={getImageUrl(imageKey as ImageKey)}
                          alt={imageKey}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate" title={imageKey}>
                          {imageKey}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={imagePath}>
                          {imagePath}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(imageKey as ImageKey)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = getImageUrl(imageKey as ImageKey);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = imageKey;
                              a.click();
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(imageKey as ImageKey)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Storage Browser */}
              {imageList?.success && imageList.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Storage Files</h3>
                  <div className="space-y-2">
                    {imageList.images.map((file) => (
                      <div key={file.name} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.metadata?.size ? `${Math.round(file.metadata.size / 1024)} KB` : 'Unknown size'} • 
                            {file.updated_at ? new Date(file.updated_at).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${selectedCategory}/${file.name}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageList?.success && imageList.images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No images found in this category. Upload some images to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}