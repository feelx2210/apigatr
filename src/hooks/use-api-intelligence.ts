import { useState, useCallback, useRef, useEffect } from 'react';
import { ParsedAPI } from '@/lib/transformation/types';
import { InteractiveAnalyzer, AnalysisSession, UserCustomization, UIPreferences, AdvancedSettings } from '@/lib/transformation/interactive-analyzer';
import { PluginFeature } from '@/lib/transformation/api-intelligence';

interface UseApiIntelligenceReturn {
  session: AnalysisSession | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Actions
  startAnalysis: (api: ParsedAPI) => Promise<void>;
  confirmPurpose: (purpose: string) => void;
  updateFeatureSelection: (selectedFeatures: string[], customizations?: Record<string, any>) => void;
  updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;
  finalizeAnalysis: () => void;
  getSuggestedFocusAdjustments: (newPurpose: string) => PluginFeature[];
  resetAnalysis: () => void;
  
  // Utilities
  canProceedToNextStep: () => boolean;
  getCurrentStepProgress: () => number;
}

export const useApiIntelligence = (): UseApiIntelligenceReturn => {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyzerRef = useRef<InteractiveAnalyzer>();

  // Initialize analyzer on first use
  useEffect(() => {
    if (!analyzerRef.current) {
      analyzerRef.current = new InteractiveAnalyzer();
    }
  }, []);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (session && analyzerRef.current) {
        analyzerRef.current.cleanupSession(session.id);
      }
    };
  }, [session]);

  const startAnalysis = useCallback(async (api: ParsedAPI) => {
    if (!analyzerRef.current) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const newSession = await analyzerRef.current.startAnalysis(api);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const confirmPurpose = useCallback((purpose: string) => {
    if (!session || !analyzerRef.current) return;
    
    try {
      const updatedSession = analyzerRef.current.confirmPurpose(session.id, purpose);
      setSession(updatedSession);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm purpose');
    }
  }, [session]);

  const updateFeatureSelection = useCallback((selectedFeatures: string[], customizations: Record<string, any> = {}) => {
    if (!session || !analyzerRef.current) return;
    
    try {
      const updatedSession = analyzerRef.current.updateFeatureSelection(session.id, selectedFeatures, customizations);
      setSession(updatedSession);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature selection');
    }
  }, [session]);

  const updateUIPreferences = useCallback((preferences: Partial<UIPreferences>) => {
    if (!session || !analyzerRef.current) return;
    
    try {
      const updatedSession = analyzerRef.current.updateUIPreferences(session.id, preferences);
      setSession(updatedSession);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update UI preferences');
    }
  }, [session]);

  const updateAdvancedSettings = useCallback((settings: Partial<AdvancedSettings>) => {
    if (!session || !analyzerRef.current) return;
    
    try {
      const updatedSession = analyzerRef.current.updateAdvancedSettings(session.id, settings);
      setSession(updatedSession);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update advanced settings');
    }
  }, [session]);

  const finalizeAnalysis = useCallback(() => {
    if (!session || !analyzerRef.current) return;
    
    try {
      const updatedSession = analyzerRef.current.finalizeAnalysis(session.id);
      setSession(updatedSession);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize analysis');
    }
  }, [session]);

  const getSuggestedFocusAdjustments = useCallback((newPurpose: string): PluginFeature[] => {
    if (!session || !analyzerRef.current) return [];
    
    try {
      return analyzerRef.current.getSuggestedFocusAdjustments(session.id, newPurpose);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get focus adjustments');
      return [];
    }
  }, [session]);

  const resetAnalysis = useCallback(() => {
    if (session && analyzerRef.current) {
      analyzerRef.current.cleanupSession(session.id);
    }
    setSession(null);
    setError(null);
    setIsAnalyzing(false);
  }, [session]);

  const canProceedToNextStep = useCallback((): boolean => {
    if (!session) return false;
    
    switch (session.status) {
      case 'analyzing':
        return false;
      case 'confirming-purpose':
        return !!session.userChoices.confirmedPurpose;
      case 'selecting-features':
        return session.userChoices.selectedFeatures.length > 0;
      case 'configuring':
        return true; // UI preferences are optional
      case 'ready':
        return true;
      default:
        return false;
    }
  }, [session]);

  const getCurrentStepProgress = useCallback((): number => {
    if (!session) return 0;
    
    const progressMap = {
      'analyzing': 0.2,
      'confirming-purpose': 0.4,
      'selecting-features': 0.6,
      'configuring': 0.8,
      'ready': 1.0
    };
    
    return progressMap[session.status] || 0;
  }, [session]);

  return {
    session,
    isAnalyzing,
    error,
    startAnalysis,
    confirmPurpose,
    updateFeatureSelection,
    updateUIPreferences,
    updateAdvancedSettings,
    finalizeAnalysis,
    getSuggestedFocusAdjustments,
    resetAnalysis,
    canProceedToNextStep,
    getCurrentStepProgress
  };
};