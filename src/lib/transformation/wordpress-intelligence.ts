import { ParsedAPI, APIEndpoint } from './types';
import { APIIntelligence, PluginFeature, EndpointCategory, FocusArea } from './api-intelligence';

export interface WordPressIntegration {
  type: 'admin-page' | 'media-library' | 'gutenberg-block' | 'shortcode' | 'widget' | 'rest-endpoint' | 'cron-job' | 'theme-integration' | 'editor-plugin';
  hookPoints: string[];
  capabilities: string[];
  dependencies: string[];
  placement?: string;
  trigger?: string;
}

export interface WordPressFeature extends PluginFeature {
  wordpressIntegration: WordPressIntegration;
  wpCompatibility: {
    minVersion: string;
    maxVersion?: string;
    multisite: boolean;
  };
  phpRequirements: {
    minVersion: string;
    extensions: string[];
  };
  priority: 'high' | 'medium' | 'low';
  estimatedComplexity: 'high' | 'medium' | 'low';
  userBenefit: string;
}

export interface WordPressIntelligence extends APIIntelligence {
  wordpressContext: WordPressContext;
  wordpressFeatures: WordPressFeature[];
  integrationStrategy: IntegrationStrategy;
  securityConsiderations: SecurityConsideration[];
}

export interface WordPressContext {
  primaryUseCase: 'content-management' | 'media-processing' | 'user-management' | 'e-commerce' | 'seo' | 'analytics' | 'external-integration';
  suggestedPluginType: 'utility' | 'content-enhancement' | 'media-tool' | 'admin-tool' | 'frontend-feature' | 'integration';
  wooCommerceCompatible: boolean;
  multisiteCompatible: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
}

export interface IntegrationStrategy {
  primary: WordPressIntegration['type'];
  secondary: WordPressIntegration['type'][];
  backgroundProcessing: boolean;
  caching: boolean;
  apiRateLimit: boolean;
}

export interface SecurityConsideration {
  type: 'authentication' | 'data-validation' | 'capability-check' | 'nonce-verification' | 'sanitization';
  description: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

export class WordPressIntelligenceService {
  
  analyzeForWordPress(api: ParsedAPI): WordPressIntelligence {
    const baseIntelligence = this.getBaseIntelligence(api);
    const wordpressContext = this.analyzeWordPressContext(api);
    const wordpressFeatures = this.generateWordPressFeatures(api, baseIntelligence.endpointCategories);
    const integrationStrategy = this.suggestIntegrationStrategy(api, wordpressContext);
    const securityConsiderations = this.analyzeSecurityRequirements(api);

    return {
      ...baseIntelligence,
      wordpressContext,
      wordpressFeatures,
      integrationStrategy,
      securityConsiderations
    };
  }

  private getBaseIntelligence(api: ParsedAPI): APIIntelligence {
    // Simplified base intelligence - in real implementation, this would use the main service
    const endpointCategories = this.categorizeEndpoints(api.endpoints);
    const primaryCategory = endpointCategories[0]?.name || 'general';
    
    return {
      detectedPurpose: this.detectPurpose(api, endpointCategories),
      confidence: this.calculateConfidence(api, endpointCategories),
      primaryCategory,
      endpointCategories,
      focusAreas: this.detectFocusAreas(api, endpointCategories),
      suggestedFeatures: [],
      recommendations: []
    };
  }

  private analyzeWordPressContext(api: ParsedAPI): WordPressContext {
    const endpointPatterns = api.endpoints.map(e => e.path.toLowerCase() + ' ' + e.name.toLowerCase()).join(' ');
    
    // Detect primary use case
    let primaryUseCase: WordPressContext['primaryUseCase'] = 'external-integration';
    let suggestedPluginType: WordPressContext['suggestedPluginType'] = 'utility';
    
    if (endpointPatterns.includes('translate') || endpointPatterns.includes('language')) {
      primaryUseCase = 'content-management';
      suggestedPluginType = 'content-enhancement';
    } else if (endpointPatterns.includes('image') || endpointPatterns.includes('media') || endpointPatterns.includes('upscale')) {
      primaryUseCase = 'media-processing';
      suggestedPluginType = 'media-tool';
    } else if (endpointPatterns.includes('user') || endpointPatterns.includes('auth')) {
      primaryUseCase = 'user-management';
      suggestedPluginType = 'admin-tool';
    } else if (endpointPatterns.includes('product') || endpointPatterns.includes('order') || endpointPatterns.includes('payment')) {
      primaryUseCase = 'e-commerce';
      suggestedPluginType = 'integration';
    }

    return {
      primaryUseCase,
      suggestedPluginType,
      wooCommerceCompatible: primaryUseCase === 'e-commerce' || endpointPatterns.includes('product'),
      multisiteCompatible: !endpointPatterns.includes('file') && !endpointPatterns.includes('upload'),
      performanceImpact: this.assessPerformanceImpact(api)
    };
  }

  private generateWordPressFeatures(api: ParsedAPI, categories: EndpointCategory[]): WordPressFeature[] {
    const features: WordPressFeature[] = [];
    
    categories.forEach(category => {
      const categoryFeatures = this.generateCategoryFeatures(category, api);
      features.push(...categoryFeatures);
    });

    // Always add admin dashboard
    features.push(this.generateAdminDashboardFeature(api));

    return features;
  }

  private generateCategoryFeatures(category: EndpointCategory, api: ParsedAPI): WordPressFeature[] {
    const categoryName = category.name.toLowerCase();
    
    switch (categoryName) {
      case 'translation':
        return this.generateTranslationFeatures(category.endpoints, api);
      case 'image-processing':
        return this.generateImageProcessingFeatures(category.endpoints, api);
      case 'text-processing':
        return this.generateTextProcessingFeatures(category.endpoints, api);
      case 'data-management':
        return this.generateDataManagementFeatures(category.endpoints, api);
      default:
        return this.generateGenericFeatures(category.endpoints, api, categoryName);
    }
  }

  private generateTranslationFeatures(endpoints: APIEndpoint[], api: ParsedAPI): WordPressFeature[] {
    return [
        {
          id: 'wp-post-translation',
          name: 'Post & Page Translation',
          description: 'Translate WordPress posts and pages directly from the editor',
          enabled: false,
          required: false,
          category: 'translation',
          endpoints: endpoints.filter(e => e.path.includes('/translate')).map(e => e.id),
          figmaIntegration: {
            type: 'ui',
            description: 'Gutenberg sidebar integration for content translation'
          },
          priority: 'high',
          estimatedComplexity: 'medium',
          userBenefit: 'Streamline multilingual content creation',
          wordpressIntegration: {
            type: 'gutenberg-block',
            hookPoints: ['enqueue_block_editor_assets', 'init'],
            capabilities: ['edit_posts', 'edit_pages'],
            dependencies: ['gutenberg'],
            placement: 'editor-sidebar',
            trigger: 'translate-button'
          },
          wpCompatibility: {
            minVersion: '5.0',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json']
          }
        },
        {
          id: 'wp-bulk-translation',
          name: 'Bulk Content Translation',
          description: 'Translate multiple posts, pages, and custom content in batches',
          enabled: false,
          required: false,
          category: 'translation',
          endpoints: endpoints.map(e => e.id),
          figmaIntegration: {
            type: 'batch',
            description: 'Bulk processing interface for multiple content items'
          },
          priority: 'high',
          estimatedComplexity: 'high',
          userBenefit: 'Efficiently localize large content volumes',
          wordpressIntegration: {
            type: 'admin-page',
            hookPoints: ['admin_menu', 'wp_ajax_bulk_translate'],
            capabilities: ['manage_options', 'edit_posts'],
            dependencies: ['wp-cron'],
            placement: 'tools-menu'
          },
          wpCompatibility: {
            minVersion: '4.9',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json']
          }
        }
    ];
  }

  private generateImageProcessingFeatures(endpoints: APIEndpoint[], api: ParsedAPI): WordPressFeature[] {
    return [
        {
          id: 'wp-auto-image-enhancement',
          name: 'Automatic Image Enhancement',
          description: 'Automatically enhance images upon upload to media library',
          enabled: false,
          required: false,
          category: 'media',
          endpoints: endpoints.filter(e => e.path.includes('/upscale') || e.path.includes('/enhance')).map(e => e.id),
          figmaIntegration: {
            type: 'workflow',
            description: 'Automated image processing workflow'
          },
          priority: 'high',
          estimatedComplexity: 'medium',
          userBenefit: 'Improve image quality without manual intervention',
          wordpressIntegration: {
            type: 'media-library',
            hookPoints: ['wp_handle_upload', 'add_attachment'],
            capabilities: ['upload_files'],
            dependencies: ['wp-cron'],
            trigger: 'automatic'
          },
          wpCompatibility: {
            minVersion: '4.7',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json', 'gd']
          }
        },
        {
          id: 'wp-bulk-image-processing',
          name: 'Bulk Image Processing',
          description: 'Process existing media library images in background batches',
          enabled: false,
          required: false,
          category: 'media',
          endpoints: endpoints.map(e => e.id),
          figmaIntegration: {
            type: 'batch',
            description: 'Bulk image processing with progress tracking'
          },
          priority: 'medium',
          estimatedComplexity: 'high',
          userBenefit: 'Optimize entire media library efficiently',
          wordpressIntegration: {
            type: 'cron-job',
            hookPoints: ['wp_ajax_bulk_process_images', 'wp_cron'],
            capabilities: ['manage_options'],
            dependencies: ['wp-cron'],
            placement: 'media-menu'
          },
          wpCompatibility: {
            minVersion: '4.7',
            multisite: false
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json', 'gd']
          }
        }
    ];
  }

  private generateTextProcessingFeatures(endpoints: APIEndpoint[], api: ParsedAPI): WordPressFeature[] {
    return [
        {
          id: 'wp-content-enhancement',
          name: 'AI Content Enhancement',
          description: 'Enhance post content with AI processing and optimization',
          enabled: false,
          required: false,
          category: 'content',
          endpoints: endpoints.map(e => e.id),
          figmaIntegration: {
            type: 'ui',
            description: 'Content enhancement from Gutenberg editor'
          },
          priority: 'high',
          estimatedComplexity: 'medium',
          userBenefit: 'Improve content quality and engagement',
          wordpressIntegration: {
            type: 'gutenberg-block',
            hookPoints: ['enqueue_block_editor_assets', 'wp_ajax_enhance_content'],
            capabilities: ['edit_posts'],
            dependencies: ['gutenberg'],
            placement: 'gutenberg-sidebar'
          },
          wpCompatibility: {
            minVersion: '5.0',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json']
          }
        }
    ];
  }

  private generateDataManagementFeatures(endpoints: APIEndpoint[], api: ParsedAPI): WordPressFeature[] {
    return [
        {
          id: 'wp-data-sync',
          name: 'External Data Synchronization',
          description: 'Sync WordPress content with external API data sources',
          enabled: false,
          required: false,
          category: 'integration',
          endpoints: endpoints.map(e => e.id),
          figmaIntegration: {
            type: 'workflow',
            description: 'Background data synchronization workflow'
          },
          priority: 'medium',
          estimatedComplexity: 'high',
          userBenefit: 'Keep content synchronized with external systems',
          wordpressIntegration: {
            type: 'cron-job',
            hookPoints: ['wp_cron', 'admin_menu'],
            capabilities: ['manage_options'],
            dependencies: ['wp-cron'],
            placement: 'tools-menu'
          },
          wpCompatibility: {
            minVersion: '4.9',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json']
          }
        }
    ];
  }

  private generateGenericFeatures(endpoints: APIEndpoint[], api: ParsedAPI, categoryName: string): WordPressFeature[] {
    return [
        {
          id: `wp-${categoryName}-integration`,
          name: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Integration`,
          description: `WordPress integration for ${api.name} ${categoryName} functionality`,
          enabled: false,
          required: false,
          category: 'integration',
          endpoints: endpoints.map(e => e.id),
          figmaIntegration: {
            type: 'ui',
            description: `Integration interface for ${categoryName} functionality`
          },
          priority: 'medium',
          estimatedComplexity: 'medium',
          userBenefit: `Access ${api.name} ${categoryName} features from WordPress`,
          wordpressIntegration: {
            type: 'admin-page',
            hookPoints: ['admin_menu', 'wp_ajax_' + categoryName],
            capabilities: ['manage_options'],
            dependencies: [],
            placement: 'main-menu'
          },
          wpCompatibility: {
            minVersion: '4.7',
            multisite: true
          },
          phpRequirements: {
            minVersion: '7.4',
            extensions: ['curl', 'json']
          }
        }
    ];
  }

  private generateAdminDashboardFeature(api: ParsedAPI): WordPressFeature {
    return {
      id: 'wp-admin-dashboard',
      name: 'Plugin Dashboard',
      description: `Centralized dashboard for managing ${api.name} integration settings and features`,
      enabled: true,
      required: true,
      category: 'admin',
      endpoints: [],
      figmaIntegration: {
        type: 'ui',
        description: 'Administrative dashboard interface'
      },
      priority: 'high',
      estimatedComplexity: 'low',
      userBenefit: 'Unified control panel for all plugin features',
      wordpressIntegration: {
        type: 'admin-page',
        hookPoints: ['admin_menu', 'admin_init'],
        capabilities: ['manage_options'],
        dependencies: [],
        placement: 'main-menu'
      },
      wpCompatibility: {
        minVersion: '4.7',
        multisite: true
      },
      phpRequirements: {
        minVersion: '7.4',
        extensions: []
      }
    };
  }

  private suggestIntegrationStrategy(api: ParsedAPI, context: WordPressContext): IntegrationStrategy {
    let primary: WordPressIntegration['type'] = 'admin-page';
    let secondary: WordPressIntegration['type'][] = [];
    
    switch (context.primaryUseCase) {
      case 'content-management':
        primary = 'gutenberg-block';
        secondary = ['admin-page', 'shortcode'];
        break;
      case 'media-processing':
        primary = 'media-library';
        secondary = ['admin-page', 'cron-job'];
        break;
      case 'user-management':
        primary = 'admin-page';
        secondary = ['rest-endpoint'];
        break;
      case 'e-commerce':
        primary = 'admin-page';
        secondary = ['shortcode', 'widget'];
        break;
    }

    return {
      primary,
      secondary,
      backgroundProcessing: context.performanceImpact === 'high' || api.endpoints.length > 5,
      caching: api.endpoints.some(e => e.method === 'GET'),
      apiRateLimit: true
    };
  }

  private analyzeSecurityRequirements(api: ParsedAPI): SecurityConsideration[] {
    const considerations: SecurityConsideration[] = [
      {
        type: 'capability-check',
        description: 'Implement proper WordPress capability checks for all admin functions',
        implementation: 'current_user_can() checks before any admin operations',
        priority: 'high'
      },
      {
        type: 'nonce-verification',
        description: 'Use WordPress nonces for all AJAX requests and form submissions',
        implementation: 'wp_nonce_field() and wp_verify_nonce() for security',
        priority: 'high'
      },
      {
        type: 'data-validation',
        description: 'Sanitize and validate all user input and API responses',
        implementation: 'sanitize_text_field(), wp_kses(), and custom validation',
        priority: 'high'
      }
    ];

    if (api.authentication.length > 0) {
      considerations.push({
        type: 'authentication',
        description: 'Securely store and handle API credentials',
        implementation: 'Use WordPress options API with proper encryption',
        priority: 'high'
      });
    }

    return considerations;
  }

  // Helper methods
  private categorizeEndpoints(endpoints: APIEndpoint[]): EndpointCategory[] {
    // Simplified implementation - in real app, use the main service
    const categories: Record<string, APIEndpoint[]> = {};
    
    endpoints.forEach(endpoint => {
      const path = endpoint.path.toLowerCase();
      const name = endpoint.name.toLowerCase();
      
      let category = 'general';
      if (path.includes('translate') || name.includes('translate')) category = 'translation';
      else if (path.includes('image') || path.includes('upscale') || name.includes('image')) category = 'image-processing';
      else if (path.includes('text') || name.includes('text')) category = 'text-processing';
      else if (path.includes('data') || name.includes('data')) category = 'data-management';
      
      if (!categories[category]) categories[category] = [];
      categories[category].push(endpoint);
    });

    return Object.entries(categories).map(([name, endpoints]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      description: `${name} related functionality`,
      endpoints,
      priority: name === 'translation' || name === 'image-processing' ? 1 : 0.5
    }));
  }

  private detectPurpose(api: ParsedAPI, categories: EndpointCategory[]): string {
    const primaryCategory = categories[0]?.name.toLowerCase() || 'general';
    const apiName = api.name.toLowerCase();
    
    if (primaryCategory.includes('translation') || apiName.includes('translate')) {
      return 'Translation Service API';
    } else if (primaryCategory.includes('image') || apiName.includes('image')) {
      return 'Image Processing API';
    } else if (primaryCategory.includes('text') || apiName.includes('text')) {
      return 'Text Processing API';
    }
    
    return `${api.name} Integration`;
  }

  private calculateConfidence(api: ParsedAPI, categories: EndpointCategory[]): number {
    let confidence = 0.5;
    
    // Higher confidence for well-structured APIs
    if (api.description && api.description.length > 10) confidence += 0.2;
    if (categories.length > 0) confidence += 0.2;
    if (api.endpoints.length > 3) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private detectFocusAreas(api: ParsedAPI, categories: EndpointCategory[]): FocusArea[] {
    return categories.map(category => ({
      name: category.name,
      description: category.description,
      endpoints: category.endpoints.map(e => e.id),
      confidence: 0.8
    }));
  }

  private assessPerformanceImpact(api: ParsedAPI): 'low' | 'medium' | 'high' {
    if (api.endpoints.length > 10) return 'high';
    if (api.endpoints.some(e => e.path.includes('/upload') || e.path.includes('/file'))) return 'high';
    if (api.endpoints.length > 5) return 'medium';
    return 'low';
  }
}