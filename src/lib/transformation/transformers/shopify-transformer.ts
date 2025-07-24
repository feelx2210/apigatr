import { ParsedAPI, PlatformTransformation, PlatformFeature, UIComponent, CodeFile } from '../types';

export class ShopifyTransformer {
  transform(api: ParsedAPI): PlatformTransformation {
    const features = this.mapApiToShopifyFeatures(api);
    const codeFiles = this.generateShopifyCode(api, features);
    
    return {
      platform: 'shopify',
      features,
      codeFiles,
      configuration: this.generateShopifyConfig(api),
      documentation: this.generateDocumentation(api, features)
    };
  }

  private mapApiToShopifyFeatures(api: ParsedAPI): PlatformFeature[] {
    const features: PlatformFeature[] = [];
    
    // Group endpoints by category
    const endpointsByCategory = api.endpoints.reduce((acc, endpoint) => {
      const category = endpoint.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(endpoint);
      return acc;
    }, {} as Record<string, typeof api.endpoints>);

    // Map categories to Shopify features
    Object.entries(endpointsByCategory).forEach(([category, endpoints]) => {
      const feature = this.createShopifyFeature(category, endpoints, api);
      if (feature) features.push(feature);
    });

    // Add settings feature for API configuration
    features.unshift({
      name: 'API Settings',
      description: `Configure ${api.name} API credentials and settings`,
      apiEndpoints: [],
      implementation: 'admin-ui',
      userInterface: this.createSettingsUI(api)
    });

    return features;
  }

  private createShopifyFeature(category: string, endpoints: any[], api: ParsedAPI): PlatformFeature | null {
    const categoryMappings: Record<string, { name: string; description: string; implementation: any; ui: string }> = {
      'translation': {
        name: 'Product Translation',
        description: 'Automatically translate product titles, descriptions, and metadata',
        implementation: 'admin-ui',
        ui: 'translation-manager'
      },
      'language-support': {
        name: 'Language Management',
        description: 'Manage supported languages and translation preferences',
        implementation: 'admin-ui',
        ui: 'language-settings'
      },
      'document-processing': {
        name: 'Bulk Translation',
        description: 'Translate multiple products or pages in bulk',
        implementation: 'admin-ui',
        ui: 'bulk-translator'
      },
      'authentication': {
        name: 'API Authentication',
        description: 'Manage API authentication and connection status',
        implementation: 'admin-ui',
        ui: 'auth-settings'
      }
    };

    const mapping = categoryMappings[category];
    if (!mapping) return null;

    return {
      name: mapping.name,
      description: mapping.description,
      apiEndpoints: endpoints.map(e => e.id),
      implementation: mapping.implementation,
      userInterface: this.createFeatureUI(mapping.ui, endpoints, api)
    };
  }

  private createSettingsUI(api: ParsedAPI): UIComponent[] {
    const authFields = api.authentication.map(auth => ({
      name: auth.name || 'apiKey',
      type: 'text' as const,
      label: `${auth.name || 'API Key'}`,
      required: true
    }));

    return [{
      type: 'form' as const,
      name: 'api-settings',
      fields: [
        ...authFields,
        {
          name: 'enabled',
          type: 'checkbox' as const,
          label: 'Enable API Integration',
          required: false
        }
      ],
      actions: [
        { name: 'save', type: 'submit' as const },
        { name: 'test', type: 'submit' as const, endpoint: 'test-connection' }
      ]
    }];
  }

  private createFeatureUI(uiType: string, endpoints: any[], api: ParsedAPI): UIComponent[] {
    switch (uiType) {
      case 'translation-manager':
        return [{
          type: 'form' as const,
          name: 'product-translation',
          fields: [
            { name: 'sourceLanguage', type: 'select' as const, label: 'Source Language', required: true, options: this.getLanguageOptions() },
            { name: 'targetLanguages', type: 'select' as const, label: 'Target Languages', required: true, options: this.getLanguageOptions() },
            { name: 'includeDescriptions', type: 'checkbox' as const, label: 'Include Product Descriptions', required: false },
            { name: 'includeMetafields', type: 'checkbox' as const, label: 'Include Meta Fields', required: false }
          ],
          actions: [
            { name: 'translate', type: 'submit' as const, endpoint: 'translate-products' }
          ]
        }];
      
      case 'bulk-translator':
        return [{
          type: 'form' as const,
          name: 'bulk-translation',
          fields: [
            { name: 'productSelection', type: 'select' as const, label: 'Products to Translate', required: true, options: [
              { label: 'All Products', value: 'all' },
              { label: 'Selected Collection', value: 'collection' },
              { label: 'Tagged Products', value: 'tagged' }
            ]},
            { name: 'targetLanguages', type: 'select' as const, label: 'Target Languages', required: true, options: this.getLanguageOptions() }
          ],
          actions: [
            { name: 'startBulkTranslation', type: 'submit' as const, endpoint: 'bulk-translate' }
          ]
        }];
      
      default:
        return [];
    }
  }

  private getLanguageOptions() {
    return [
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' },
      { label: 'German', value: 'de' },
      { label: 'Italian', value: 'it' },
      { label: 'Portuguese', value: 'pt' },
      { label: 'Dutch', value: 'nl' },
      { label: 'Japanese', value: 'ja' },
      { label: 'Chinese (Simplified)', value: 'zh-CN' },
      { label: 'Chinese (Traditional)', value: 'zh-TW' }
    ];
  }

  private generateShopifyCode(api: ParsedAPI, features: PlatformFeature[]): CodeFile[] {
    const files: CodeFile[] = [];

    // App configuration
    files.push({
      path: 'shopify.app.toml',
      content: this.generateAppConfig(api),
      type: 'config',
      language: 'yaml'
    });

    // Package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(api),
      type: 'config',
      language: 'json'
    });

    // Main app server
    files.push({
      path: 'app/shopify.server.js',
      content: this.generateShopifyServer(api),
      type: 'api',
      language: 'javascript'
    });

    // API integration service
    files.push({
      path: 'app/services/api-service.js',
      content: this.generateApiService(api),
      type: 'api',
      language: 'javascript'
    });

    // Admin UI components
    features.forEach(feature => {
      if (feature.implementation === 'admin-ui') {
        files.push({
          path: `app/routes/app.${feature.name.toLowerCase().replace(/\s+/g, '-')}.jsx`,
          content: this.generateAdminPage(feature, api),
          type: 'component',
          language: 'javascript'
        });
      }
    });

    // Database models
    files.push({
      path: 'prisma/schema.prisma',
      content: this.generateDatabaseSchema(api),
      type: 'schema',
      language: 'typescript'
    });

    return files;
  }

  private generateAppConfig(api: ParsedAPI): string {
    return `# Shopify App Configuration for ${api.name}
name = "${api.name.toLowerCase().replace(/\s+/g, '-')}-integration"
client_id = "your-client-id"
application_url = "https://your-app-url.com"
embedded = true

[access_scopes]
scopes = "write_products,read_products,write_translations,read_translations"

[auth]
redirect_urls = [
  "https://your-app-url.com/auth/callback"
]

[webhooks]
api_version = "2024-01"

[pos]
embedded = false

[build]
automatically_update_urls_on_dev = true
dev_store_url = "your-dev-store.myshopify.com"
`;
  }

  private generatePackageJson(api: ParsedAPI): string {
    return JSON.stringify({
      name: `${api.name.toLowerCase().replace(/\s+/g, '-')}-shopify-app`,
      version: "1.0.0",
      description: `${api.description} - Shopify App Integration`,
      scripts: {
        dev: "shopify app dev",
        build: "remix build",
        start: "remix-serve build",
        deploy: "shopify app deploy"
      },
      dependencies: {
        "@remix-run/node": "^2.0.0",
        "@remix-run/react": "^2.0.0",
        "@remix-run/serve": "^2.0.0",
        "@shopify/shopify-app-remix": "^2.0.0",
        "@shopify/polaris": "^12.0.0",
        "isbot": "^3.6.8",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@shopify/app": "^3.0.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "typescript": "^5.0.0"
      }
    }, null, 2);
  }

  private generateShopifyServer(api: ParsedAPI): string {
    return `import { AppDistribution, shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ["read_products", "write_products", "read_translations", "write_translations"],
  appUrl: process.env.SHOPIFY_APP_URL!,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
`;
  }

  private generateApiService(api: ParsedAPI): string {
    const authMethod = api.authentication[0];
    const baseUrl = this.extractBaseUrl(api);

    return `class ${api.name.replace(/\s+/g, '')}Service {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = '${baseUrl}';
  }

  async makeRequest(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      'Content-Type': 'application/json',
      ${authMethod?.type === 'apiKey' ? `'Authorization': 'DeepL-Auth-Key \${this.apiKey}',` : ''}
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(\`API request failed: \${response.status} \${response.statusText}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Service Error:', error);
      throw error;
    }
  }

${api.endpoints.map(endpoint => this.generateEndpointMethod(endpoint)).join('\n\n')}

  // Translation-specific methods for Shopify integration
  async translateProduct(productId, sourceLanguage, targetLanguages, session) {
    const product = await this.getShopifyProduct(productId, session);
    const translations = {};

    for (const targetLang of targetLanguages) {
      const translatedTitle = await this.translateText(product.title, sourceLanguage, targetLang);
      const translatedDescription = await this.translateText(product.body_html, sourceLanguage, targetLang);
      
      translations[targetLang] = {
        title: translatedTitle,
        description: translatedDescription
      };
    }

    return translations;
  }

  async getShopifyProduct(productId, session) {
    const client = new shopify.clients.Rest({ session });
    const response = await client.get({ path: \`products/\${productId}\` });
    return response.body.product;
  }
}

export default ${api.name.replace(/\s+/g, '')}Service;
`;
  }

  private generateEndpointMethod(endpoint: any): string {
    const methodName = endpoint.id.replace(/[^a-zA-Z0-9]/g, '');
    const params = endpoint.parameters.filter((p: any) => p.location === 'query' || p.location === 'path');
    const paramNames = params.map((p: any) => p.name).join(', ');

    return `  async ${methodName}(${paramNames ? paramNames + ', ' : ''}options = {}) {
    const endpoint = '${endpoint.path}'${params.length > 0 ? `.replace(/\\{(\\w+)\\}/g, (match, key) => arguments[0][key] || match)` : ''};
    ${endpoint.parameters.filter((p: any) => p.location === 'query').length > 0 ? `
    const queryParams = new URLSearchParams();
    ${endpoint.parameters.filter((p: any) => p.location === 'query').map((p: any) => 
      `if (${p.name}) queryParams.append('${p.name}', ${p.name});`
    ).join('\n    ')}
    const queryString = queryParams.toString();
    const finalEndpoint = queryString ? \`\${endpoint}?\${queryString}\` : endpoint;
    ` : 'const finalEndpoint = endpoint;'}
    
    return this.makeRequest(finalEndpoint, {
      method: '${endpoint.method}',
      ...options
    });
  }`;
  }

  private generateAdminPage(feature: PlatformFeature, api: ParsedAPI): string {
    return `import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Select,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import ${api.name.replace(/\s+/g, '')}Service from "../services/api-service";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  
  // Load any existing settings or data
  return json({
    shop: session.shop,
    feature: ${JSON.stringify(feature, null, 2)}
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  try {
    const apiService = new ${api.name.replace(/\s+/g, '')}Service(
      process.env.${api.name.toUpperCase().replace(/\s+/g, '_')}_API_KEY
    );
    
    // Handle form submission based on feature type
    const result = await handleFeatureAction(formData, apiService, session);
    
    return json({ success: true, result });
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }
}

async function handleFeatureAction(formData, apiService, session) {
  // Implementation specific to ${feature.name}
  // This would contain the actual logic for the feature
  return { message: "Action completed successfully" };
}

export default function ${feature.name.replace(/\s+/g, '')}Page() {
  const { shop, feature } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  return (
    <Page title="${feature.name}">
      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <Banner status="critical" title="Error">
              {actionData.error}
            </Banner>
          )}
          {actionData?.success && (
            <Banner status="success" title="Success">
              ${feature.name} completed successfully!
            </Banner>
          )}
          
          <Card>
            <p>{feature.description}</p>
            
            <Form method="post">
              {/* Render form fields based on feature.userInterface */}
              ${feature.userInterface?.map(ui => 
                ui.fields?.map(field => this.generateFormField(field)).join('\n              ') || ''
              ).join('\n              ')}
              
              <Button submit loading={isLoading}>
                Execute ${feature.name}
              </Button>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
`;
  }

  private generateFormField(field: any): string {
    switch (field.type) {
      case 'text':
        return `<TextField label="${field.label}" name="${field.name}" required={${field.required}} />`;
      case 'select':
        return `<Select 
          label="${field.label}" 
          name="${field.name}" 
          options={${JSON.stringify(field.options || [])}}
          required={${field.required}}
        />`;
      case 'checkbox':
        return `<Checkbox label="${field.label}" name="${field.name}" />`;
      default:
        return `<TextField label="${field.label}" name="${field.name}" required={${field.required}} />`;
    }
  }

  private generateDatabaseSchema(api: ParsedAPI): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:dev.db"
}

model Session {
  id          String    @id
  shop        String
  state       String
  isOnline    Boolean   @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
  firstName   String?
  lastName    String?
  email       String?
  accountOwner Boolean  @default(false)
  locale      String?
  collaborator Boolean? @default(false)
  emailVerified Boolean? @default(false)
}

model ${api.name.replace(/\s+/g, '')}Settings {
  id        Int      @id @default(autoincrement())
  shop      String   @unique
  apiKey    String?
  enabled   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TranslationJob {
  id            Int      @id @default(autoincrement())
  shop          String
  productId     String?
  status        String   @default("pending")
  sourceLanguage String
  targetLanguages String
  results       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
`;
  }

  private generateShopifyConfig(api: ParsedAPI): Record<string, any> {
    return {
      appName: `${api.name} Integration`,
      requiredScopes: ['read_products', 'write_products', 'read_translations', 'write_translations'],
      webhooks: ['app/uninstalled'],
      extensionPoints: ['admin_navigation'],
      apiVersion: '2024-01'
    };
  }

  private generateDocumentation(api: ParsedAPI, features: PlatformFeature[]): string {
    return `# ${api.name} Shopify App

${api.description}

## Features

${features.map(feature => `### ${feature.name}
${feature.description}

**Implementation:** ${feature.implementation}
**API Endpoints Used:** ${feature.apiEndpoints.join(', ')}
`).join('\n')}

## Installation

1. Install dependencies: \`npm install\`
2. Set up environment variables in \`.env\`:
   - \`SHOPIFY_API_KEY\`
   - \`SHOPIFY_API_SECRET\`
   - \`${api.name.toUpperCase().replace(/\s+/g, '_')}_API_KEY\`
3. Run database migrations: \`npx prisma db push\`
4. Start development server: \`npm run dev\`

## Configuration

Configure your ${api.name} API credentials in the app settings page.

## Usage

${features.map(feature => `### ${feature.name}
Navigate to the ${feature.name} section in your Shopify admin to use this feature.
`).join('\n')}
`;
  }

  private extractBaseUrl(api: ParsedAPI): string {
    // Try to extract base URL from the first endpoint
    const firstEndpoint = api.endpoints[0];
    if (firstEndpoint) {
      // For DeepL API, we know the base URL
      if (api.name.toLowerCase().includes('deepl')) {
        return 'https://api-free.deepl.com/v2';
      }
    }
    return 'https://api.example.com';
  }
}