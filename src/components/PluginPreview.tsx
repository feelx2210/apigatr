import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Monitor, Smartphone, Settings, Play, Image, Type, Layers } from 'lucide-react';
import { AnalysisSession } from '@/lib/transformation/interactive-analyzer';

interface PluginPreviewProps {
  session: AnalysisSession;
}

const PluginPreview: React.FC<PluginPreviewProps> = ({ session }) => {
  const [previewMode, setPreviewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  const enabledFeatures = session.intelligence.suggestedFeatures.filter(
    f => session.userChoices.selectedFeatures.includes(f.id)
  );

  const getPreviewDimensions = () => {
    return previewMode === 'desktop' ? 'w-80 h-96' : 'w-60 h-80';
  };

  const renderMockUI = () => {
    const { uiPreferences } = session.userChoices;
    const style = uiPreferences.style || 'full-featured';

    if (style === 'minimal') {
      return (
        <div className="p-4 space-y-3">
          <div className="text-sm font-medium">API Settings</div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="space-y-2">
            {enabledFeatures.slice(0, 2).map((feature, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs">{feature.name}</span>
                <div className="h-4 w-12 bg-primary/20 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-8 bg-primary/10 rounded flex items-center justify-center">
            <span className="text-xs font-medium">Execute</span>
          </div>
        </div>
      );
    }

    if (style === 'workflow-based') {
      return (
        <div className="p-4 space-y-4">
          <div className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Connected
          </div>
          
          {/* Workflow steps */}
          <div className="space-y-3">
            {enabledFeatures.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-2 border rounded">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium">{feature.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {feature.figmaIntegration.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-xs font-medium text-white">Start Workflow</span>
          </div>
        </div>
      );
    }

    // Full-featured (default)
    return (
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate">
            {session.originalAPI.name}
          </div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {enabledFeatures.slice(0, 3).map((feature, i) => (
            <div
              key={i}
              className={`px-2 py-1 text-xs border-b-2 ${
                i === 0 ? 'border-primary text-primary' : 'border-transparent text-gray-500'
              }`}
            >
              {feature.name.split(' ')[0]}
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="space-y-3">
          {/* Selection info */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-xs">
            <Layers className="w-3 h-3" />
            <span>2 layers selected</span>
          </div>

          {/* Feature controls */}
          <div className="space-y-2">
            <div className="text-xs font-medium">Options</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Quality</span>
                <div className="h-4 w-16 bg-gray-100 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Scale</span>
                <div className="h-4 w-12 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>

          {/* Preview area */}
          <div className="h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center text-xs text-gray-400">
              <Image className="w-6 h-6 mx-auto mb-1" />
              Preview
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-xs font-medium text-white">Apply Changes</span>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 h-5 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs">Reset</span>
              </div>
              <div className="flex-1 h-5 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs">Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Plugin Preview</CardTitle>
            <CardDescription>
              Preview how your plugin will look and behave in Figma
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Window */}
        <div className="flex justify-center">
          <div className={`${getPreviewDimensions()} border-2 border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden`}>
            {renderMockUI()}
          </div>
        </div>

        <Separator />

        {/* Feature Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Included Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enabledFeatures.map(feature => (
              <div key={feature.id} className="flex items-start gap-2 p-2 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div className="min-w-0">
                  <div className="font-medium text-sm">{feature.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {feature.figmaIntegration.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Technical Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="font-medium">Endpoints</div>
              <div className="text-muted-foreground">{session.refinedSpec.focusedEndpoints.length}</div>
            </div>
            <div>
              <div className="font-medium">Auth Method</div>
              <div className="text-muted-foreground capitalize">
                {session.userChoices.advancedSettings.authenticationStrategy?.replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="font-medium">UI Style</div>
              <div className="text-muted-foreground capitalize">
                {session.userChoices.uiPreferences.style?.replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="font-medium">Error Handling</div>
              <div className="text-muted-foreground capitalize">
                {session.userChoices.advancedSettings.errorHandling}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PluginPreview;