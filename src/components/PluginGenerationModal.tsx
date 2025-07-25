
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Platform, PluginGenerationData } from "@/types/platform";
import { platforms } from "@/data/platforms";
import { getTransformationEngine } from "@/lib/transformation/lazy-transformation-engine";
import { TransformationErrorBoundary } from "./TransformationErrorBoundary";
import type { ParsedAPI, PlatformTransformation } from "@/lib/transformation/types";
import PlatformCard from "./PlatformCard";
import ApiUploadStep from "./ApiUploadStep";
import ApiAnalysisStep from "./ApiAnalysisStep";
import { PluginDownloadModal } from "./PluginDownloadModal";

interface PluginGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'platform' | 'upload' | 'analysis' | 'confirmation';

const PluginGenerationModal = ({ open, onOpenChange }: PluginGenerationModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('platform');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PluginGenerationData>({} as PluginGenerationData);
  const [parsedAPI, setParsedAPI] = useState<ParsedAPI | null>(null);
  const [transformation, setTransformation] = useState<PlatformTransformation | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { toast } = useToast();

  const handlePlatformSelect = (platform: Platform) => {
    setData(prev => ({ ...prev, platform }));
  };

  const handleApiSubmit = async (apiData: { source: 'url' | 'file'; url?: string; file?: File }) => {
    setIsLoading(true);
    try {
      // Use the lazy transformation engine to analyze the API
      const engine = await getTransformationEngine();
      let apiAnalysis: ParsedAPI;
      
      if (apiData.source === 'url' && apiData.url) {
        apiAnalysis = await engine.analyzeAPI('url', apiData.url);
      } else if (apiData.source === 'file' && apiData.file) {
        apiAnalysis = await engine.analyzeAPI('file', apiData.file);
      } else {
        throw new Error('Invalid API source data');
      }
      
      setParsedAPI(apiAnalysis);
      
      // Convert ParsedAPI to legacy format for backward compatibility
      const mockAnalysis = {
        name: apiAnalysis.name,
        description: apiAnalysis.description,
        endpoints: apiAnalysis.endpoints.map(endpoint => ({
          name: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          description: endpoint.description
        })),
        features: apiAnalysis.tags.length > 0 ? apiAnalysis.tags : ["API Integration"]
      };

      setData(prev => ({ 
        ...prev, 
        apiSource: apiData.source,
        apiUrl: apiData.url,
        apiFile: apiData.file,
        analysis: mockAnalysis 
      }));
      
      setCurrentStep('analysis');
    } catch (error) {
      console.error('API analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: `Could not analyze the API specification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAnalysis = () => {
    setCurrentStep('confirmation');
  };

  const handleFinalConfirmation = async () => {
    setIsLoading(true);
    try {
      if (!parsedAPI || !data.platform) {
        throw new Error('Missing API data or platform selection');
      }
      
      // Use the lazy transformation engine to generate the plugin
      const engine = await getTransformationEngine();
      const platformTransformation = data.apiUrl 
        ? await engine.transformFromUrl(data.apiUrl, data.platform.id)
        : data.apiFile 
        ? await engine.transformFromFile(data.apiFile, data.platform.id)
        : null;
      
      if (!platformTransformation) {
        throw new Error('Failed to generate platform transformation');
      }
      
      setTransformation(platformTransformation);
      setShowDownloadModal(true);
      onOpenChange(false);
    } catch (error) {
      console.error('Plugin generation failed:', error);
      toast({
        title: "Generation Failed",
        description: `Could not generate the plugin: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('platform');
    setData({} as PluginGenerationData);
    setParsedAPI(null);
    setTransformation(null);
    setIsLoading(false);
  };

  const canProceedFromPlatform = !!data.platform;
  const canProceedFromAnalysis = !!data.analysis;

  const stepTitles = {
    platform: 'Choose Your Platform',
    upload: 'Upload API Documentation',
    analysis: 'Review API Analysis',
    confirmation: 'Confirm Plugin Generation'
  };

  const stepDescriptions = {
    platform: 'Select the platform where you want to create your plugin',
    upload: `Upload your API documentation for ${data.platform?.name || 'the selected platform'}`,
    analysis: 'Review what we found in your API documentation',
    confirmation: 'Confirm the details and start plugin generation'
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-crocodile-dark">
            {stepTitles[currentStep]}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {stepDescriptions[currentStep]}
          </DialogDescription>
          
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {(['platform', 'upload', 'analysis', 'confirmation'] as Step[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep ? 'bg-crocodile-medium text-white' :
                  ['platform', 'upload', 'analysis'].indexOf(currentStep) > ['platform', 'upload', 'analysis'].indexOf(step) ? 'bg-crocodile-light text-crocodile-dark' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 ${
                    ['platform', 'upload', 'analysis'].indexOf(currentStep) > index ? 'bg-crocodile-light' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <TransformationErrorBoundary onRetry={() => setCurrentStep('platform')}>
        <div className="mt-6">
          {currentStep === 'platform' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    selected={data.platform?.id === platform.id}
                    onSelect={() => handlePlatformSelect(platform)}
                  />
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setCurrentStep('upload')}
                  disabled={!canProceedFromPlatform}
                  className="bg-crocodile-dark hover:bg-crocodile-medium"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'upload' && (
            <div>
              <ApiUploadStep
                platform={data.platform}
                onSubmit={handleApiSubmit}
                isLoading={isLoading}
                onBack={() => setCurrentStep('platform')}
              />
            </div>
          )}

          {currentStep === 'analysis' && data.analysis && (
            <div>
              <ApiAnalysisStep
                platform={data.platform}
                analysis={data.analysis}
                onConfirm={handleConfirmAnalysis}
                onBack={() => setCurrentStep('upload')}
              />
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Ready to Generate Plugin</h3>
                </div>
                <p className="text-green-700 text-sm">
                  We'll create a {data.platform?.name} plugin for the "{data.analysis?.name}" API with {data.analysis?.endpoints.length} endpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Platform</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{data.platform?.logo}</span>
                    <span>{data.platform?.name}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">API</h4>
                  <p className="text-sm text-muted-foreground">{data.analysis?.name}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {data.analysis?.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Endpoints</h4>
                  <p className="text-sm text-muted-foreground">
                    {data.analysis?.endpoints.length} API endpoints detected
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('analysis')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={handleFinalConfirmation}
                  disabled={isLoading}
                  className="bg-crocodile-dark hover:bg-crocodile-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Plugin'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        </TransformationErrorBoundary>
      </DialogContent>
    </Dialog>
    
    {transformation && (
      <PluginDownloadModal
        open={showDownloadModal}
        onOpenChange={(open) => {
          setShowDownloadModal(open);
          if (!open) {
            resetModal();
          }
        }}
        transformation={transformation}
        platformName={data.platform?.name || ''}
        apiName={parsedAPI?.name || ''}
      />
    )}
  </>
  );
};

export default PluginGenerationModal;
