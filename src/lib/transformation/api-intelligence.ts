import { ParsedAPI, APIEndpoint } from './types';

export interface APIIntelligence {
  detectedPurpose: string;
  confidence: number;
  primaryCategory: string;
  suggestedFeatures: PluginFeature[];
  endpointCategories: EndpointCategory[];
  recommendations: string[];
  focusAreas: FocusArea[];
}

export interface PluginFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  category: string;
  endpoints: string[];
  figmaIntegration: {
    type: 'selection' | 'canvas' | 'ui' | 'batch' | 'workflow';
    description: string;
  };
}

export interface EndpointCategory {
  name: string;
  endpoints: APIEndpoint[];
  description: string;
  priority: number;
}

export interface FocusArea {
  name: string;
  description: string;
  confidence: number;
  endpoints: string[];
}

export class APIIntelligenceService {
  analyzeAPI(api: ParsedAPI): APIIntelligence {
    const endpointCategories = this.categorizeEndpoints(api.endpoints);
    const focusAreas = this.detectFocusAreas(api, endpointCategories);
    const primaryCategory = this.determinePrimaryCategory(focusAreas);
    const detectedPurpose = this.detectPurpose(api, primaryCategory, focusAreas);
    const confidence = this.calculateConfidence(focusAreas, api.endpoints);
    const suggestedFeatures = this.generateFeatureSuggestions(api, primaryCategory, endpointCategories);
    const recommendations = this.generateRecommendations(api, primaryCategory, focusAreas);

    return {
      detectedPurpose,
      confidence,
      primaryCategory,
      suggestedFeatures,
      endpointCategories,
      recommendations,
      focusAreas
    };
  }

  private categorizeEndpoints(endpoints: APIEndpoint[]): EndpointCategory[] {
    const categories = new Map<string, APIEndpoint[]>();

    endpoints.forEach(endpoint => {
      const category = this.categorizeEndpoint(endpoint);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(endpoint);
    });

    return Array.from(categories.entries()).map(([name, endpoints]) => ({
      name,
      endpoints,
      description: this.getCategoryDescription(name),
      priority: this.getCategoryPriority(name, endpoints)
    })).sort((a, b) => b.priority - a.priority);
  }

  private categorizeEndpoint(endpoint: APIEndpoint): string {
    const path = endpoint.path.toLowerCase();
    const name = endpoint.name.toLowerCase();
    const description = endpoint.description.toLowerCase();
    const combined = `${path} ${name} ${description}`;

    // Image processing patterns
    if (this.matchesPattern(combined, ['upscal', 'enhance', 'resize', 'image', 'photo', 'picture'])) {
      return 'Image Processing';
    }

    // Translation patterns
    if (this.matchesPattern(combined, ['translat', 'language', 'locale', 'detect'])) {
      return 'Translation';
    }

    // Authentication patterns
    if (this.matchesPattern(combined, ['auth', 'login', 'token', 'key', 'credential'])) {
      return 'Authentication';
    }

    // Document processing patterns
    if (this.matchesPattern(combined, ['document', 'pdf', 'file', 'convert', 'parse'])) {
      return 'Document Processing';
    }

    // Data management patterns
    if (this.matchesPattern(combined, ['user', 'account', 'profile', 'manage'])) {
      return 'User Management';
    }

    // AI/ML patterns
    if (this.matchesPattern(combined, ['ai', 'ml', 'predict', 'classify', 'analyze'])) {
      return 'AI/ML Processing';
    }

    return 'General API';
  }

  private matchesPattern(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private detectFocusAreas(api: ParsedAPI, categories: EndpointCategory[]): FocusArea[] {
    const focusAreas: FocusArea[] = [];

    categories.forEach(category => {
      if (category.endpoints.length > 0) {
        const confidence = Math.min(0.9, category.priority / 10);
        focusAreas.push({
          name: category.name,
          description: category.description,
          confidence,
          endpoints: category.endpoints.map(e => e.id)
        });
      }
    });

    return focusAreas.sort((a, b) => b.confidence - a.confidence);
  }

  private determinePrimaryCategory(focusAreas: FocusArea[]): string {
    return focusAreas.length > 0 ? focusAreas[0].name : 'General API';
  }

  private detectPurpose(api: ParsedAPI, primaryCategory: string, focusAreas: FocusArea[]): string {
    const purposeMap: Record<string, string> = {
      'Image Processing': 'Image Enhancement and Processing API',
      'Translation': 'Language Translation Service',
      'Authentication': 'Authentication and Authorization Service',
      'Document Processing': 'Document Processing and Conversion API',
      'User Management': 'User Management and Profile API',
      'AI/ML Processing': 'AI-Powered Analysis and Processing API',
      'General API': `${api.name} Integration`
    };

    return purposeMap[primaryCategory] || `${api.name} API Integration`;
  }

  private calculateConfidence(focusAreas: FocusArea[], endpoints: APIEndpoint[]): number {
    if (focusAreas.length === 0) return 0.3;
    
    const topFocus = focusAreas[0];
    const endpointCoverage = topFocus.endpoints.length / endpoints.length;
    
    return Math.min(0.95, topFocus.confidence * 0.6 + endpointCoverage * 0.4);
  }

  private generateFeatureSuggestions(api: ParsedAPI, primaryCategory: string, categories: EndpointCategory[]): PluginFeature[] {
    const features: PluginFeature[] = [];

    switch (primaryCategory) {
      case 'Image Processing':
        features.push(
          {
            id: 'image-selection',
            name: 'Process Selected Images',
            description: 'Apply image processing to selected image layers in Figma',
            enabled: true,
            required: true,
            category: 'Core Features',
            endpoints: this.getEndpointsByCategory(categories, 'Image Processing'),
            figmaIntegration: {
              type: 'selection',
              description: 'Works with selected image nodes in Figma'
            }
          },
          {
            id: 'batch-processing',
            name: 'Batch Image Processing',
            description: 'Process multiple images at once with progress tracking',
            enabled: true,
            required: false,
            category: 'Productivity',
            endpoints: this.getEndpointsByCategory(categories, 'Image Processing'),
            figmaIntegration: {
              type: 'batch',
              description: 'Processes multiple selected images with progress indicator'
            }
          },
          {
            id: 'quality-settings',
            name: 'Processing Settings',
            description: 'Adjust processing parameters and preview results',
            enabled: true,
            required: false,
            category: 'Configuration',
            endpoints: this.getEndpointsByCategory(categories, 'Image Processing'),
            figmaIntegration: {
              type: 'ui',
              description: 'Settings panel for processing options'
            }
          }
        );
        break;

      case 'Translation':
        features.push(
          {
            id: 'text-translation',
            name: 'Translate Selected Text',
            description: 'Translate text in selected text layers',
            enabled: true,
            required: true,
            category: 'Core Features',
            endpoints: this.getEndpointsByCategory(categories, 'Translation'),
            figmaIntegration: {
              type: 'selection',
              description: 'Works with selected text nodes in Figma'
            }
          },
          {
            id: 'language-detection',
            name: 'Auto Language Detection',
            description: 'Automatically detect source language',
            enabled: true,
            required: false,
            category: 'Smart Features',
            endpoints: this.getEndpointsByCategory(categories, 'Translation'),
            figmaIntegration: {
              type: 'workflow',
              description: 'Enhances translation workflow with auto-detection'
            }
          }
        );
        break;

      default:
        features.push(
          {
            id: 'api-integration',
            name: 'API Integration',
            description: 'Connect Figma with the API endpoints',
            enabled: true,
            required: true,
            category: 'Core Features',
            endpoints: api.endpoints.map(e => e.id),
            figmaIntegration: {
              type: 'ui',
              description: 'General API integration interface'
            }
          }
        );
    }

    // Add authentication if needed
    const authEndpoints = this.getEndpointsByCategory(categories, 'Authentication');
    if (authEndpoints.length > 0 || api.authentication.length > 0) {
      features.push({
        id: 'authentication',
        name: 'API Authentication',
        description: 'Manage API credentials and authentication',
        enabled: true,
        required: true,
        category: 'Setup',
        endpoints: authEndpoints,
        figmaIntegration: {
          type: 'ui',
          description: 'Secure credential management interface'
        }
      });
    }

    return features;
  }

  private getEndpointsByCategory(categories: EndpointCategory[], categoryName: string): string[] {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.endpoints.map(e => e.id) : [];
  }

  private generateRecommendations(api: ParsedAPI, primaryCategory: string, focusAreas: FocusArea[]): string[] {
    const recommendations: string[] = [];

    if (primaryCategory === 'Image Processing') {
      recommendations.push(
        'Consider adding image format validation to ensure compatibility',
        'Include progress indicators for processing operations',
        'Add undo/redo functionality for processed images'
      );
    } else if (primaryCategory === 'Translation') {
      recommendations.push(
        'Include language auto-detection for better user experience',
        'Add support for batch translation of multiple text layers',
        'Consider caching translations to improve performance'
      );
    }

    if (api.authentication.length > 0) {
      recommendations.push('Implement secure API key storage and management');
    }

    if (api.endpoints.length > 10) {
      recommendations.push('Group endpoints by functionality for better organization');
    }

    return recommendations;
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'Image Processing': 'Endpoints for image enhancement, processing, and manipulation',
      'Translation': 'Language translation and localization services',
      'Authentication': 'User authentication and authorization endpoints',
      'Document Processing': 'Document conversion and processing capabilities',
      'User Management': 'User account and profile management',
      'AI/ML Processing': 'AI-powered analysis and processing services',
      'General API': 'General purpose API endpoints'
    };

    return descriptions[category] || 'API endpoints for various operations';
  }

  private getCategoryPriority(category: string, endpoints: APIEndpoint[]): number {
    const basePriority: Record<string, number> = {
      'Image Processing': 9,
      'Translation': 8,
      'AI/ML Processing': 7,
      'Document Processing': 6,
      'User Management': 5,
      'Authentication': 4,
      'General API': 3
    };

    const base = basePriority[category] || 3;
    const endpointMultiplier = Math.min(2, endpoints.length / 5);
    
    return base + endpointMultiplier;
  }
}