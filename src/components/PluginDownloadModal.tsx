import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Github, CheckCircle } from "lucide-react";
import JSZip from 'jszip';
import { PlatformTransformation } from "@/lib/transformation/types";

interface PluginDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transformation: PlatformTransformation;
  platformName: string;
  apiName: string;
}

export const PluginDownloadModal: React.FC<PluginDownloadModalProps> = ({
  open,
  onOpenChange,
  transformation,
  platformName,
  apiName,
}) => {
  const handleDownload = async () => {
    const zip = new JSZip();
    
    // Add all generated code files to the ZIP
    transformation.codeFiles.forEach(file => {
      zip.file(file.path, file.content);
    });
    
    // Add documentation
    if (transformation.documentation) {
      zip.file('README.md', transformation.documentation);
    }
    
    // Add configuration as JSON
    zip.file('config.json', JSON.stringify(transformation.configuration, null, 2));
    
    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${apiName.toLowerCase().replace(/\s+/g, '-')}-${platformName.toLowerCase()}-plugin.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFigma = platformName.toLowerCase() === 'figma';
  const installationSteps = isFigma
    ? [
        {
          title: '1. Extract Files',
          description: 'Extract the downloaded ZIP file to a local folder (figma-plugin/*).',
        },
        {
          title: '2. Open Figma Desktop',
          description: 'Use the Figma desktop app (required for local development plugins).',
        },
        {
          title: '3. Import Manifest',
          description: 'Plugins → Development → Import plugin from manifest… and select figma-plugin/manifest.json.',
        },
        {
          title: '4. Configure Settings',
          description: 'Open the plugin → Settings tab. Set Base URL and API Key (stored with clientStorage).',
        },
        {
          title: '5. Run Endpoints',
          description: 'Pick an endpoint and click Run. For translation responses, use “Apply to Selection”.',
        },
      ]
    : [
        {
          title: '1. Extract Files',
          description: "Extract the downloaded ZIP file to your local development environment.",
        },
        {
          title: '2. Install Dependencies',
          description: "Navigate to the extracted folder and run 'npm install' to install all required dependencies.",
        },
        {
          title: '3. Configure API Keys',
          description: "Add your API credentials to the .env file. Check the README for required environment variables.",
        },
        {
          title: '4. Setup Shopify CLI',
          description: "Install Shopify CLI if you haven't already: npm install -g @shopify/cli @shopify/theme",
        },
        {
          title: '5. Deploy to Shopify',
          description: "Run 'shopify app serve' to start development or 'shopify app deploy' for production.",
        },
      ];

  const docsUrl = isFigma ? 'https://www.figma.com/plugin-docs/intro/' : 'https://docs.shopify.com/apps';
  const docsLabel = isFigma ? 'Figma Plugin Docs' : 'Shopify App Docs';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Plugin Generated Successfully!
          </DialogTitle>
          <DialogDescription>
            Your {apiName} plugin for {platformName} is ready to download and install.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Your Plugin
              </CardTitle>
              <CardDescription>
                Get the complete plugin package including all code files, configuration, and documentation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Plugin ZIP ({transformation.codeFiles.length} files)
              </Button>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Features</CardTitle>
              <CardDescription>
                Your plugin includes the following features and capabilities:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transformation.features.map((feature, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">{feature.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Installation Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Installation Guide
              </CardTitle>
              <CardDescription>
                Follow these steps to install and configure your plugin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installationSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Generate Another Plugin
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(docsUrl, '_blank')}
              className="flex-1"
            >
              <Github className="w-4 h-4 mr-2" />
              {docsLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};