import { ShopifyTransformer } from './transformers/shopify-transformer';
import { WordPressTransformer } from './transformers/wordpress-transformer';
import { FigmaTransformer } from './transformers/figma-transformer';
import { ParsedAPI, PlatformTransformation } from './types';
import { InteractiveAnalyzer, AnalysisSession } from './interactive-analyzer';

export class TransformationEngine {
  private parser: any;
  private transformers: Map<string, any>;
  private interactiveAnalyzer: InteractiveAnalyzer;

  constructor() {
    this.parser = null;
    this.transformers = new Map();
    this.interactiveAnalyzer = new InteractiveAnalyzer();
    
    // Register platform transformers
    this.transformers.set('shopify', new ShopifyTransformer());
    this.transformers.set('wordpress', new WordPressTransformer());
    this.transformers.set('figma', new FigmaTransformer());
  }

  private async getParser() {
    if (!this.parser) {
      const { OpenAPIParser } = await import('./openapi-parser');
      this.parser = new OpenAPIParser();
    }
    return this.parser;
  }

  async transformFromUrl(url: string, platform: string): Promise<PlatformTransformation> {
    console.log(`Starting transformation of API from URL: ${url} for platform: ${platform}`);
    
    try {
      // Parse the OpenAPI specification
      const parser = await this.getParser();
      const parsedAPI = await parser.parseFromUrl(url);
      console.log('API parsed successfully:', parsedAPI.name);
      
      // Get the appropriate transformer
      const transformer = this.transformers.get(platform);
      if (!transformer) {
        throw new Error(`No transformer available for platform: ${platform}`);
      }
      
      // Transform the API to platform-specific implementation
      const transformation = transformer.transform(parsedAPI);
      console.log('Transformation completed successfully');
      
      return transformation;
    } catch (error) {
      console.error('Transformation failed:', error);
      throw error;
    }
  }

  async transformFromFile(file: File, platform: string): Promise<PlatformTransformation> {
    console.log(`Starting transformation of API from file: ${file.name} for platform: ${platform}`);
    
    try {
      // Parse the OpenAPI specification
      const parser = await this.getParser();
      const parsedAPI = await parser.parseFromFile(file);
      console.log('API parsed successfully:', parsedAPI.name);
      
      // Get the appropriate transformer
      const transformer = this.transformers.get(platform);
      if (!transformer) {
        throw new Error(`No transformer available for platform: ${platform}`);
      }
      
      // Transform the API to platform-specific implementation
      const transformation = transformer.transform(parsedAPI);
      console.log('Transformation completed successfully');
      
      return transformation;
    } catch (error) {
      console.error('Transformation failed:', error);
      throw error;
    }
  }

  async analyzeAPI(source: 'url' | 'file', data: string | File): Promise<ParsedAPI> {
    try {
      const parser = await this.getParser();
      if (source === 'url') {
        return await parser.parseFromUrl(data as string);
      } else {
        return await parser.parseFromFile(data as File);
      }
    } catch (error) {
      console.error('API analysis failed:', error);
      throw error;
    }
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.transformers.keys());
  }

  hasPlatformSupport(platform: string): boolean {
    return this.transformers.has(platform);
  }

  // New intelligent analysis methods
  async startInteractiveAnalysis(api: ParsedAPI): Promise<AnalysisSession> {
    return await this.interactiveAnalyzer.startAnalysis(api);
  }

  getAnalysisSession(sessionId: string): AnalysisSession {
    return this.interactiveAnalyzer.getSession(sessionId);
  }

  confirmPurpose(sessionId: string, purpose: string): AnalysisSession {
    return this.interactiveAnalyzer.confirmPurpose(sessionId, purpose);
  }

  updateFeatureSelection(sessionId: string, selectedFeatures: string[], customizations?: Record<string, any>): AnalysisSession {
    return this.interactiveAnalyzer.updateFeatureSelection(sessionId, selectedFeatures, customizations);
  }

  finalizeAnalysis(sessionId: string): AnalysisSession {
    return this.interactiveAnalyzer.finalizeAnalysis(sessionId);
  }

  async transformFromSession(session: AnalysisSession, platform: string): Promise<PlatformTransformation> {
    const transformer = this.transformers.get(platform);
    if (!transformer) {
      throw new Error(`No transformer available for platform: ${platform}`);
    }

    // Use the refined spec from the session for more intelligent transformation
    const transformation = transformer.transform(session.originalAPI, {
      customizedSpec: session.refinedSpec,
      userChoices: session.userChoices,
      intelligence: session.intelligence
    });

    return transformation;
  }
}

// Export singleton instance
export const transformationEngine = new TransformationEngine();