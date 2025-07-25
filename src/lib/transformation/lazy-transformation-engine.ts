import { ParsedAPI, PlatformTransformation } from './types';

// Lightweight interface for the transformation engine
export interface LazyTransformationEngine {
  transformFromUrl(url: string, platform: string): Promise<PlatformTransformation>;
  transformFromFile(file: File, platform: string): Promise<PlatformTransformation>;
  analyzeAPI(source: 'url' | 'file', data: string | File): Promise<ParsedAPI>;
  getSupportedPlatforms(): string[];
  hasPlatformSupport(platform: string): boolean;
}

// Mock transformation engine for when heavy dependencies fail
class MockTransformationEngine implements LazyTransformationEngine {
  async transformFromUrl(url: string, platform: string): Promise<PlatformTransformation> {
    throw new Error('Transformation features are temporarily unavailable. Please try again later.');
  }

  async transformFromFile(file: File, platform: string): Promise<PlatformTransformation> {
    throw new Error('Transformation features are temporarily unavailable. Please try again later.');
  }

  async analyzeAPI(source: 'url' | 'file', data: string | File): Promise<ParsedAPI> {
    // Provide a basic mock analysis
    return {
      name: source === 'url' ? 'API from URL' : 'API from File',
      description: 'API analysis temporarily unavailable',
      version: '1.0.0',
      authentication: [],
      endpoints: [],
      schemas: [],
      tags: []
    };
  }

  getSupportedPlatforms(): string[] {
    return ['shopify'];
  }

  hasPlatformSupport(platform: string): boolean {
    return platform === 'shopify';
  }
}

// Lazy-loaded transformation engine
let transformationEngineInstance: LazyTransformationEngine | null = null;
let isLoading = false;

export async function getTransformationEngine(): Promise<LazyTransformationEngine> {
  if (transformationEngineInstance) {
    return transformationEngineInstance;
  }

  if (isLoading) {
    // Wait for the current loading to complete
    return new Promise((resolve) => {
      const checkLoading = () => {
        if (transformationEngineInstance) {
          resolve(transformationEngineInstance);
        } else if (!isLoading) {
          resolve(new MockTransformationEngine());
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    });
  }

  isLoading = true;

  try {
    // Try to dynamically import the heavy transformation engine
    const { transformationEngine } = await import('./transformation-engine');
    transformationEngineInstance = transformationEngine;
    isLoading = false;
    return transformationEngineInstance;
  } catch (error) {
    console.warn('Failed to load transformation engine, using mock:', error);
    transformationEngineInstance = new MockTransformationEngine();
    isLoading = false;
    return transformationEngineInstance;
  }
}

// Reset function for testing or error recovery
export function resetTransformationEngine(): void {
  transformationEngineInstance = null;
  isLoading = false;
}