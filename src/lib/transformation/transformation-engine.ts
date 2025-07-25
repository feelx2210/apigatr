import { ShopifyTransformer } from './transformers/shopify-transformer';
import { ParsedAPI, PlatformTransformation } from './types';

export class TransformationEngine {
  private parser: any;
  private transformers: Map<string, any>;

  constructor() {
    this.parser = null;
    this.transformers = new Map();
    
    // Register platform transformers
    this.transformers.set('shopify', new ShopifyTransformer());
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
}

// Export singleton instance
export const transformationEngine = new TransformationEngine();