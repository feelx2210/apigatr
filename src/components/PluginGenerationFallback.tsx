import { Button } from "@/components/ui/button";
import { ExternalLink, Code, FileText } from "lucide-react";

interface PluginGenerationFallbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PluginGenerationFallback = ({ open, onOpenChange }: PluginGenerationFallbackProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Plugin Generator</h2>
        <p className="text-muted-foreground mb-6">
          The plugin generation feature is currently loading. In the meantime, 
          you can explore our documentation and examples.
        </p>
        
        <div className="space-y-3 mb-6">
          <a 
            href="https://shopify.dev/docs/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-3" />
            Shopify App Development
          </a>
          
          <a 
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
          >
            <Code className="w-4 h-4 mr-3" />
            View Example Code
          </a>
          
          <a 
            href="https://apigatr.com/docs"
            className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4 mr-3" />
            API Documentation
          </a>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PluginGenerationFallback;