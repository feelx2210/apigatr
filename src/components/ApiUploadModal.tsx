
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiUploadModal = ({ open, onOpenChange }: ApiUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['.json', '.yaml', '.yml'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON, YAML, or YML file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUrlSubmit = async () => {
    if (!apiUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid API documentation URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "API Documentation Processed",
        description: "Your plugins are being generated. You'll receive an email when they're ready.",
      });
      onOpenChange(false);
      setApiUrl("");
    }, 2000);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate file processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "File Uploaded Successfully",
        description: "Your plugins are being generated. You'll receive an email when they're ready.",
      });
      onOpenChange(false);
      setSelectedFile(null);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-crocodile-dark">
            Upload Your API Documentation
          </DialogTitle>
          <DialogDescription className="text-lg">
            Choose how you'd like to provide your API documentation to generate plugins.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              API URL
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              File Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url" className="text-sm font-medium">
                API Documentation URL
              </Label>
              <Input
                id="api-url"
                type="url"
                placeholder="https://api.example.com/docs"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL to your OpenAPI/Swagger documentation
              </p>
            </div>
            
            <Button 
              onClick={handleUrlSubmit}
              disabled={isLoading}
              className="w-full bg-crocodile-dark hover:bg-crocodile-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Generate Plugins from URL
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-file" className="text-sm font-medium">
                Upload API Documentation File
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-crocodile-medium transition-colors">
                <input
                  id="api-file"
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="api-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="w-8 h-8 text-crocodile-medium" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JSON, YAML, or YML files only
                  </span>
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleFileSubmit}
              disabled={isLoading}
              className="w-full bg-crocodile-dark hover:bg-crocodile-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Generate Plugins from File
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ApiUploadModal;
