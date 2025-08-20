import { ParsedAPI } from './types';
import { APIIntelligence, APIIntelligenceService, PluginFeature } from './api-intelligence';

export interface AnalysisSession {
  id: string;
  originalAPI: ParsedAPI;
  intelligence: APIIntelligence;
  userChoices: UserCustomization;
  refinedSpec: CustomizedAPISpec;
  status: 'analyzing' | 'confirming-purpose' | 'selecting-features' | 'configuring' | 'ready';
}

export interface UserCustomization {
  confirmedPurpose: string;
  selectedFeatures: string[];
  featureCustomizations: Record<string, any>;
  uiPreferences: UIPreferences;
  advancedSettings: AdvancedSettings;
}

export interface UIPreferences {
  style: 'minimal' | 'full-featured' | 'workflow-based';
  primaryEndpoints: string[];
  customNaming: Record<string, string>;
}

export interface AdvancedSettings {
  authenticationStrategy: 'plugin-managed' | 'user-input' | 'env-variable';
  errorHandling: 'strict' | 'graceful' | 'silent';
  performanceOptimization: boolean;
  debugMode: boolean;
}

export interface CustomizedAPISpec {
  name: string;
  description: string;
  focusedEndpoints: string[];
  enabledFeatures: PluginFeature[];
  uiConfiguration: any;
}

export class InteractiveAnalyzer {
  private intelligenceService: APIIntelligenceService;
  private sessions: Map<string, AnalysisSession>;

  constructor() {
    this.intelligenceService = new APIIntelligenceService();
    this.sessions = new Map();
  }

  async startAnalysis(api: ParsedAPI): Promise<AnalysisSession> {
    const sessionId = this.generateSessionId();
    
    // Perform initial intelligence analysis
    const intelligence = this.intelligenceService.analyzeAPI(api);
    
    // Create new session
    const session: AnalysisSession = {
      id: sessionId,
      originalAPI: api,
      intelligence,
      userChoices: this.getDefaultUserChoices(intelligence),
      refinedSpec: this.generateInitialSpec(api, intelligence),
      status: 'confirming-purpose'
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  confirmPurpose(sessionId: string, confirmedPurpose: string): AnalysisSession {
    const session = this.getSession(sessionId);
    session.userChoices.confirmedPurpose = confirmedPurpose;
    session.status = 'selecting-features';
    
    // Re-analyze with confirmed purpose if it differs significantly
    if (confirmedPurpose !== session.intelligence.detectedPurpose) {
      session.intelligence = this.intelligenceService.analyzeAPI(session.originalAPI);
      session.intelligence.detectedPurpose = confirmedPurpose;
      session.intelligence.suggestedFeatures = this.regenerateFeatures(session.originalAPI, confirmedPurpose);
    }

    this.updateSession(session);
    return session;
  }

  updateFeatureSelection(sessionId: string, selectedFeatures: string[], customizations: Record<string, any> = {}): AnalysisSession {
    const session = this.getSession(sessionId);
    session.userChoices.selectedFeatures = selectedFeatures;
    session.userChoices.featureCustomizations = { ...session.userChoices.featureCustomizations, ...customizations };
    session.status = 'configuring';

    // Update refined spec
    session.refinedSpec.enabledFeatures = session.intelligence.suggestedFeatures.filter(
      f => selectedFeatures.includes(f.id)
    );

    this.updateSession(session);
    return session;
  }

  updateUIPreferences(sessionId: string, preferences: Partial<UIPreferences>): AnalysisSession {
    const session = this.getSession(sessionId);
    session.userChoices.uiPreferences = { ...session.userChoices.uiPreferences, ...preferences };
    
    this.updateSession(session);
    return session;
  }

  updateAdvancedSettings(sessionId: string, settings: Partial<AdvancedSettings>): AnalysisSession {
    const session = this.getSession(sessionId);
    session.userChoices.advancedSettings = { ...session.userChoices.advancedSettings, ...settings };
    
    this.updateSession(session);
    return session;
  }

  finalizeAnalysis(sessionId: string): AnalysisSession {
    const session = this.getSession(sessionId);
    session.status = 'ready';
    
    // Generate final refined spec
    session.refinedSpec = this.generateFinalSpec(session);
    
    this.updateSession(session);
    return session;
  }

  getSession(sessionId: string): AnalysisSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Analysis session not found: ${sessionId}`);
    }
    return session;
  }

  getSuggestedFocusAdjustments(sessionId: string, newPurpose: string): PluginFeature[] {
    const session = this.getSession(sessionId);
    return this.regenerateFeatures(session.originalAPI, newPurpose);
  }

  private generateSessionId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultUserChoices(intelligence: APIIntelligence): UserCustomization {
    return {
      confirmedPurpose: intelligence.detectedPurpose,
      selectedFeatures: intelligence.suggestedFeatures.filter(f => f.enabled).map(f => f.id),
      featureCustomizations: {},
      uiPreferences: {
        style: 'full-featured',
        primaryEndpoints: intelligence.suggestedFeatures
          .filter(f => f.required)
          .flatMap(f => f.endpoints)
          .slice(0, 5),
        customNaming: {}
      },
      advancedSettings: {
        authenticationStrategy: 'plugin-managed',
        errorHandling: 'graceful',
        performanceOptimization: true,
        debugMode: false
      }
    };
  }

  private generateInitialSpec(api: ParsedAPI, intelligence: APIIntelligence): CustomizedAPISpec {
    return {
      name: api.name,
      description: intelligence.detectedPurpose,
      focusedEndpoints: intelligence.suggestedFeatures
        .filter(f => f.enabled)
        .flatMap(f => f.endpoints),
      enabledFeatures: intelligence.suggestedFeatures.filter(f => f.enabled),
      uiConfiguration: this.generateUIConfiguration(intelligence)
    };
  }

  private generateFinalSpec(session: AnalysisSession): CustomizedAPISpec {
    const enabledFeatures = session.intelligence.suggestedFeatures.filter(
      f => session.userChoices.selectedFeatures.includes(f.id)
    );

    return {
      name: session.originalAPI.name,
      description: session.userChoices.confirmedPurpose,
      focusedEndpoints: enabledFeatures.flatMap(f => f.endpoints),
      enabledFeatures,
      uiConfiguration: this.generateUIConfiguration(session.intelligence, session.userChoices)
    };
  }

  private generateUIConfiguration(intelligence: APIIntelligence, userChoices?: UserCustomization): any {
    const config = {
      layout: userChoices?.uiPreferences.style || 'full-featured',
      primaryActions: intelligence.suggestedFeatures
        .filter(f => f.required || f.enabled)
        .slice(0, 3)
        .map(f => ({
          id: f.id,
          name: f.name,
          description: f.description
        })),
      categories: intelligence.endpointCategories.map(cat => ({
        name: cat.name,
        description: cat.description,
        endpoints: cat.endpoints.length
      }))
    };

    if (userChoices?.uiPreferences.customNaming) {
      Object.assign(config, { customNaming: userChoices.uiPreferences.customNaming });
    }

    return config;
  }

  private regenerateFeatures(api: ParsedAPI, purpose: string): PluginFeature[] {
    // This would be enhanced to generate features based on the new purpose
    // For now, return existing features
    return this.intelligenceService.analyzeAPI(api).suggestedFeatures;
  }

  private updateSession(session: AnalysisSession): void {
    this.sessions.set(session.id, session);
  }

  // Cleanup method to prevent memory leaks
  cleanupSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Get all active sessions (for debugging/monitoring)
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}