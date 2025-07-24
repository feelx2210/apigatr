import SwaggerParser from '@apidevtools/swagger-parser';
import { ParsedAPI, OpenAPISpec, APIEndpoint, AuthenticationMethod, EndpointParameter } from './types';

export class OpenAPIParser {
  async parseFromUrl(url: string): Promise<ParsedAPI> {
    try {
      const api = await SwaggerParser.dereference(url) as OpenAPISpec;
      return this.parseSpec(api);
    } catch (error) {
      console.error('Error parsing OpenAPI from URL:', error);
      throw new Error(`Failed to parse OpenAPI specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseFromFile(file: File): Promise<ParsedAPI> {
    try {
      const content = await file.text();
      let spec: OpenAPISpec;
      
      if (file.name.endsWith('.json') || content.trim().startsWith('{')) {
        spec = JSON.parse(content);
      } else {
        // Assume YAML
        const yaml = await import('js-yaml');
        spec = yaml.load(content) as OpenAPISpec;
      }
      
      const api = await SwaggerParser.dereference(spec) as OpenAPISpec;
      return this.parseSpec(api);
    } catch (error) {
      console.error('Error parsing OpenAPI from file:', error);
      throw new Error(`Failed to parse OpenAPI file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseSpec(spec: OpenAPISpec): ParsedAPI {
    return {
      name: spec.info.title,
      description: spec.info.description || '',
      version: spec.info.version,
      authentication: this.parseAuthentication(spec),
      endpoints: this.parseEndpoints(spec),
      schemas: spec.components?.schemas || {},
      tags: this.extractTags(spec)
    };
  }

  private parseAuthentication(spec: OpenAPISpec): AuthenticationMethod[] {
    const methods: AuthenticationMethod[] = [];
    
    if (spec.components?.securitySchemes) {
      Object.entries(spec.components.securitySchemes).forEach(([name, scheme]) => {
        methods.push({
          type: scheme.type,
          name,
          location: scheme.in,
          scheme: scheme.scheme,
          flows: scheme.flows
        });
      });
    }
    
    return methods;
  }

  private parseEndpoints(spec: OpenAPISpec): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const endpoint: APIEndpoint = {
            id: operation.operationId || `${method}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            path,
            description: operation.description || operation.summary || '',
            parameters: this.parseParameters(operation.parameters || []),
            requestBody: operation.requestBody,
            responses: operation.responses,
            tags: operation.tags || [],
            category: this.categorizeEndpoint(operation, path)
          };
          endpoints.push(endpoint);
        }
      });
    });
    
    return endpoints;
  }

  private parseParameters(params: any[]): EndpointParameter[] {
    return params.map(param => ({
      name: param.name,
      type: param.schema?.type || 'string',
      required: param.required || false,
      location: param.in,
      description: param.description,
      example: param.example || param.schema?.example
    }));
  }

  private categorizeEndpoint(operation: any, path: string): string {
    const tags = operation.tags?.[0]?.toLowerCase() || '';
    const pathSegments = path.toLowerCase().split('/').filter(Boolean);
    
    // Common API patterns
    if (tags.includes('auth') || path.includes('auth') || path.includes('login')) return 'authentication';
    if (tags.includes('user') || path.includes('user')) return 'user-management';
    if (tags.includes('translate') || path.includes('translate')) return 'translation';
    if (tags.includes('document') || path.includes('document')) return 'document-processing';
    if (tags.includes('language') || path.includes('language')) return 'language-support';
    if (operation.method === 'GET' && pathSegments.length === 1) return 'listing';
    if (operation.method === 'POST' && pathSegments.length === 1) return 'creation';
    if (operation.method === 'GET' && path.includes('{')) return 'retrieval';
    if (['PUT', 'PATCH'].includes(operation.method)) return 'modification';
    if (operation.method === 'DELETE') return 'deletion';
    
    return 'general';
  }

  private extractTags(spec: OpenAPISpec): string[] {
    const tags = new Set<string>();
    
    Object.values(spec.paths).forEach(pathItem => {
      Object.values(pathItem).forEach(operation => {
        if (operation.tags) {
          operation.tags.forEach(tag => tags.add(tag));
        }
      });
    });
    
    return Array.from(tags);
  }
}