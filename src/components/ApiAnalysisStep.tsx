
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle, Code, Database, Shield, Zap } from "lucide-react";
import { Platform, ApiAnalysis } from "@/types/platform";

interface ApiAnalysisStepProps {
  platform: Platform;
  analysis: ApiAnalysis;
  onConfirm: () => void;
  onBack: () => void;
}

const ApiAnalysisStep = ({ platform, analysis, onConfirm, onBack }: ApiAnalysisStepProps) => {
  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 border-green-200',
      POST: 'bg-blue-100 text-blue-800 border-blue-200',
      PUT: 'bg-orange-100 text-orange-800 border-orange-200',
      DELETE: 'bg-red-100 text-red-800 border-red-200',
      PATCH: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getFeatureIcon = (feature: string) => {
    const icons = {
      'User Management': Shield,
      'Authentication': Shield,
      'Data Sync': Database,
      'Real-time Updates': Zap
    };
    const IconComponent = icons[feature as keyof typeof icons] || Code;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">API Analysis Complete</h3>
        </div>
        <p className="text-green-700 text-sm">
          We successfully analyzed your API documentation and found {analysis.endpoints.length} endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{platform.logo}</span>
              API Overview
            </CardTitle>
            <CardDescription>
              Summary of your API for {platform.name} integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">API Name</h4>
              <p className="text-lg font-semibold text-crocodile-dark">{analysis.name}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{analysis.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Detected Features</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {getFeatureIcon(feature)}
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              {analysis.endpoints.length} endpoints will be integrated into your {platform.name} plugin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analysis.endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-mono ${getMethodColor(endpoint.method)}`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-sm font-medium">{endpoint.name}</p>
                  <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What your {platform.name} plugin will include</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platform.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        
        <Button
          onClick={onConfirm}
          className="bg-crocodile-dark hover:bg-crocodile-medium"
        >
          Looks Good, Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ApiAnalysisStep;
