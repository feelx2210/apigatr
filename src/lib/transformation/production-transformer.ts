import { ParsedAPI, PlatformTransformation } from './types';
import { LazyTransformationEngine } from './lazy-transformation-engine';

// Production-safe transformer that doesn't use heavy dependencies
export class ProductionTransformer implements LazyTransformationEngine {
  async transformFromUrl(url: string, platform: string): Promise<PlatformTransformation> {
    // Simulate API analysis from URL
    const mockAPI = await this.mockAnalyzeFromUrl(url);
    return this.generateMockTransformation(mockAPI, platform);
  }

  async transformFromFile(file: File, platform: string): Promise<PlatformTransformation> {
    // Simulate API analysis from file
    const mockAPI = await this.mockAnalyzeFromFile(file);
    return this.generateMockTransformation(mockAPI, platform);
  }

  async analyzeAPI(source: 'url' | 'file', data: string | File): Promise<ParsedAPI> {
    if (source === 'url') {
      return this.mockAnalyzeFromUrl(data as string);
    } else {
      return this.mockAnalyzeFromFile(data as File);
    }
  }

  private async mockAnalyzeFromUrl(url: string): Promise<ParsedAPI> {
    return {
      name: 'API from URL',
      description: `API specification loaded from ${url}`,
      version: '1.0.0',
      authentication: [
        { type: 'apiKey', name: 'X-API-Key', location: 'header' }
      ],
      endpoints: [
        {
          id: 'get-products',
          name: 'Get Products',
          method: 'GET',
          path: '/products',
          description: 'Retrieve a list of products',
          parameters: [
            {
              name: 'limit',
              type: 'integer',
              required: false,
              location: 'query',
              description: 'Number of products to return',
              example: 10
            }
          ],
          responses: { '200': { description: 'Success' } },
          tags: ['products']
        }
      ],
      schemas: {},
      tags: ['products']
    };
  }

  private async mockAnalyzeFromFile(file: File): Promise<ParsedAPI> {
    return {
      name: file.name.replace(/\.(json|yaml|yml)$/, ''),
      description: `API specification from ${file.name}`,
      version: '1.0.0',
      authentication: [
        { type: 'bearer', scheme: 'bearer' }
      ],
      endpoints: [
        {
          id: 'create-product',
          name: 'Create Product',
          method: 'POST',
          path: '/products',
          description: 'Create a new product',
          parameters: [],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            },
            required: true
          },
          responses: { '201': { description: 'Created' } },
          tags: ['products']
        }
      ],
      schemas: {},
      tags: ['products']
    };
  }

  private generateMockTransformation(api: ParsedAPI, platform: string): PlatformTransformation {
    return {
      platform,
      features: [
        {
          name: 'Product Management',
          description: 'Manage products from your API',
          apiEndpoints: api.endpoints.map(e => e.id),
          implementation: 'admin-ui',
          userInterface: [
            {
              type: 'list',
              name: 'Product List',
              actions: [
                { name: 'View', type: 'edit', endpoint: 'get-products' },
                { name: 'Create', type: 'submit', endpoint: 'create-product' }
              ]
            }
          ]
        }
      ],
      codeFiles: [
        {
          path: `${platform}/components/ProductList.js`,
          content: '// Generated product management component\nexport default function ProductList() {\n  return <div>Product Management Interface</div>;\n}',
          type: 'component',
          language: 'javascript'
        },
        {
          path: `${platform}/config/api.json`,
          content: JSON.stringify({ apiUrl: 'https://api.example.com', apiKey: 'your-api-key' }, null, 2),
          type: 'config',
          language: 'json'
        }
      ],
      configuration: {
        apiUrl: 'https://api.example.com',
        authentication: api.authentication[0]
      },
      documentation: `# ${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration\n\nThis integration provides API connectivity for your ${api.name}.\n\n## Features\n- Product management\n- API authentication\n- Responsive UI components`
    };
  }

  getSupportedPlatforms(): string[] {
    return ['shopify', 'wordpress', 'figma', 'woocommerce', 'magento'];
  }

  hasPlatformSupport(platform: string): boolean {
    return this.getSupportedPlatforms().includes(platform);
  }
}