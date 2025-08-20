import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Lightbulb, Zap, Settings } from 'lucide-react';
import { AnalysisSession } from '@/lib/transformation/interactive-analyzer';
import { PluginFeature } from '@/lib/transformation/api-intelligence';
import FeatureCustomization from './FeatureCustomization';
import PluginPreview from './PluginPreview';

interface InteractiveAnalysisFlowProps {
  session: AnalysisSession;
  onConfirmPurpose: (purpose: string) => void;
  onUpdateFeatures: (selectedFeatures: string[], customizations?: Record<string, any>) => void;
  onUpdateUIPreferences: (preferences: any) => void;
  onUpdateAdvancedSettings: (settings: any) => void;
  onFinalize: () => void;
  onBack: () => void;
  onGetFocusAdjustments: (purpose: string) => PluginFeature[];
}

const InteractiveAnalysisFlow: React.FC<InteractiveAnalysisFlowProps> = ({
  session,
  onConfirmPurpose,
  onUpdateFeatures,
  onUpdateUIPreferences,
  onUpdateAdvancedSettings,
  onFinalize,
  onBack,
  onGetFocusAdjustments
}) => {
  const [customPurpose, setCustomPurpose] = React.useState('');
  const [showCustomPurpose, setShowCustomPurpose] = React.useState(false);

  const getStepTitle = () => {
    switch (session.status) {
      case 'confirming-purpose':
        return 'Confirm API Purpose';
      case 'selecting-features':
        return 'Select Plugin Features';
      case 'configuring':
        return 'Configure Plugin';
      case 'ready':
        return 'Ready to Generate';
      default:
        return 'Analyzing API';
    }
  };

  const getStepDescription = () => {
    switch (session.status) {
      case 'confirming-purpose':
        return 'We analyzed your API and detected its primary purpose. Please confirm or adjust.';
      case 'selecting-features':
        return 'Choose which features to include in your Figma plugin.';
      case 'configuring':
        return 'Customize the plugin interface and behavior.';
      case 'ready':
        return 'Review your plugin configuration and generate the code.';
      default:
        return 'Please wait while we analyze your API...';
    }
  };

  const getProgressPercentage = () => {
    const progressMap = {
      'analyzing': 20,
      'confirming-purpose': 40,
      'selecting-features': 60,
      'configuring': 80,
      'ready': 100
    };
    return progressMap[session.status] || 0;
  };

  const handlePurposeConfirm = (purpose: string) => {
    onConfirmPurpose(purpose);
  };

  const handleCustomPurposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPurpose.trim()) {
      handlePurposeConfirm(customPurpose.trim());
      setShowCustomPurpose(false);
      setCustomPurpose('');
    }
  };

  const canProceed = () => {
    switch (session.status) {
      case 'confirming-purpose':
        return !!session.userChoices.confirmedPurpose;
      case 'selecting-features':
        return session.userChoices.selectedFeatures.length > 0;
      case 'configuring':
      case 'ready':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    switch (session.status) {
      case 'selecting-features':
        // Move to configuration
        break;
      case 'configuring':
        onFinalize();
        break;
      case 'ready':
        // This should trigger plugin generation in parent component
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{getStepTitle()}</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">{getStepTitle()}</h3>
          <p className="text-muted-foreground">{getStepDescription()}</p>
        </div>

        {/* Purpose Confirmation Step */}
        {session.status === 'confirming-purpose' && (
          <div className="space-y-4">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Detected Purpose</CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round(session.intelligence.confidence * 100)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="font-medium text-lg">{session.intelligence.detectedPurpose}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Primary Category: {session.intelligence.primaryCategory}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Detected Focus Areas:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {session.intelligence.focusAreas.slice(0, 4).map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{area.name}</span>
                        <Badge variant="outline">
                          {Math.round(area.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handlePurposeConfirm(session.intelligence.detectedPurpose)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm This Purpose
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomPurpose(true)}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Adjust Focus
                  </Button>
                </div>

                {showCustomPurpose && (
                  <form onSubmit={handleCustomPurposeSubmit} className="space-y-3 pt-4 border-t">
                    <label className="text-sm font-medium">
                      Describe what your plugin should focus on:
                    </label>
                    <input
                      type="text"
                      value={customPurpose}
                      onChange={(e) => setCustomPurpose(e.target.value)}
                      placeholder="e.g., Image enhancement for design assets"
                      className="w-full p-2 border rounded-md"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        Apply Custom Purpose
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomPurpose(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {session.intelligence.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.intelligence.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Feature Selection Step */}
        {session.status === 'selecting-features' && (
          <FeatureCustomization
            features={session.intelligence.suggestedFeatures}
            selectedFeatures={session.userChoices.selectedFeatures}
            onUpdateSelection={onUpdateFeatures}
          />
        )}

        {/* Configuration Step */}
        {session.status === 'configuring' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Configuration</CardTitle>
                <CardDescription>
                  Customize how your plugin will look and behave in Figma.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* UI Style Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interface Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['minimal', 'full-featured', 'workflow-based'].map((style) => (
                      <Button
                        key={style}
                        variant={session.userChoices.uiPreferences.style === style ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onUpdateUIPreferences({ style })}
                        className="capitalize"
                      >
                        {style.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Authentication Strategy */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Authentication Management</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'plugin-managed', label: 'Plugin Managed' },
                      { key: 'user-input', label: 'User Input' }
                    ].map((option) => (
                      <Button
                        key={option.key}
                        variant={session.userChoices.advancedSettings.authenticationStrategy === option.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onUpdateAdvancedSettings({ authenticationStrategy: option.key })}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <PluginPreview session={session} />
          </div>
        )}

        {/* Ready Step */}
        {session.status === 'ready' && (
          <div className="space-y-4">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-800">Plugin Ready for Generation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Purpose</div>
                    <div className="text-muted-foreground">{session.userChoices.confirmedPurpose}</div>
                  </div>
                  <div>
                    <div className="font-medium">Features</div>
                    <div className="text-muted-foreground">{session.userChoices.selectedFeatures.length} selected</div>
                  </div>
                  <div>
                    <div className="font-medium">Style</div>
                    <div className="text-muted-foreground capitalize">{session.userChoices.uiPreferences.style?.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <div className="font-medium">Endpoints</div>
                    <div className="text-muted-foreground">{session.refinedSpec.focusedEndpoints.length} included</div>
                  </div>
                </div>
                
                <PluginPreview session={session} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {session.status !== 'ready' && (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        
        {session.status === 'ready' && (
          <Button onClick={onFinalize}>
            Generate Plugin
            <Zap className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InteractiveAnalysisFlow;