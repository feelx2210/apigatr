
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, FileText, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Platform } from "@/types/platform";

interface ApiUploadStepProps {
  platform: Platform;
  onSubmit: (data: { source: 'url' | 'file'; url?: string; file?: File }) => void;
  isLoading: boolean;
  onBack: () => void;
}

const ApiUploadStep = ({ platform, onSubmit, isLoading, onBack }: ApiUploadStepProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');
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

  const handleUrlSubmit = () => {
    if (!apiUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid API documentation URL.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ source: 'url', url: apiUrl });
  };

  const handleFileSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "File required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ source: 'file', file: selectedFile });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{platform.logo}</span>
          <span className="font-medium">{platform.name} Plugin</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          {platform.description}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'file')} className="w-full">
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
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={activeTab === 'url' ? handleUrlSubmit : handleFileSubmit}
          disabled={isLoading}
          className="bg-crocodile-dark hover:bg-crocodile-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing API...
            </>
          ) : (
            <>
              {activeTab === 'url' ? <Link className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Analyze API
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ApiUploadStep;
