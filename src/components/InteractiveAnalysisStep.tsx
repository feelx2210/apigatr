import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Platform } from '@/types/platform';
import { useApiIntelligence } from '@/hooks/use-api-intelligence';
import InteractiveAnalysisFlow from './InteractiveAnalysisFlow';

interface InteractiveAnalysisStepProps {
  platform: Platform;
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

const InteractiveAnalysisStep: React.FC<InteractiveAnalysisStepProps> = ({
  platform,
  onComplete,
  onBack
}) => {
  const {
    session,
    isAnalyzing,
    error,
    confirmPurpose,
    updateFeatureSelection,
    updateUIPreferences,
    updateAdvancedSettings,
    finalizeAnalysis,
    getSuggestedFocusAdjustments
  } = useApiIntelligence();

  const handleComplete = () => {
    if (session && session.status === 'ready') {
      onComplete(session.id);
    }
  };

  const handleFinalize = () => {
    finalizeAnalysis();
    // After finalizing, the session status becomes 'ready'
    // and handleComplete will be called
    setTimeout(() => {
      if (session) {
        onComplete(session.id);
      }
    }, 100);
  };

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="text-red-600">
          <h3 className="font-semibold">Analysis Error</h3>
          <p className="text-sm">{error}</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (isAnalyzing || !session) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <div>
          <h3 className="font-semibold">Analyzing API</h3>
          <p className="text-sm text-muted-foreground">
            We're examining your API to understand its capabilities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <InteractiveAnalysisFlow
      session={session}
      onConfirmPurpose={confirmPurpose}
      onUpdateFeatures={updateFeatureSelection}
      onUpdateUIPreferences={updateUIPreferences}
      onUpdateAdvancedSettings={updateAdvancedSettings}
      onFinalize={handleFinalize}
      onBack={onBack}
      onGetFocusAdjustments={getSuggestedFocusAdjustments}
    />
  );
};

export default InteractiveAnalysisStep;