export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
  security?: Array<Record<string, any>>;
}

export interface OpenAPIOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Array<{
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    required?: boolean;
    schema: any;
    description?: string;
  }>;
  requestBody?: {
    content: Record<string, any>;
    required?: boolean;
  };
  responses: Record<string, any>;
  tags?: string[];
}

export interface ParsedAPI {
  name: string;
  description: string;
  version: string;
  authentication: AuthenticationMethod[];
  endpoints: APIEndpoint[];
  schemas: Record<string, any>;
  tags: string[];
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: EndpointParameter[];
  requestBody?: any;
  responses: Record<string, any>;
  tags: string[];
  category?: string;
}

export interface EndpointParameter {
  name: string;
  type: string;
  required: boolean;
  location: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  example?: any;
}

export interface AuthenticationMethod {
  type: 'apiKey' | 'oauth2' | 'http' | 'bearer';
  name?: string;
  location?: 'header' | 'query' | 'cookie';
  scheme?: string;
  flows?: any;
}

export interface PlatformTransformation {
  platform: string;
  features: PlatformFeature[];
  codeFiles: CodeFile[];
  configuration: Record<string, any>;
  documentation: string;
}

export interface PlatformFeature {
  name: string;
  description: string;
  apiEndpoints: string[];
  implementation: 'admin-ui' | 'webhook' | 'api-integration' | 'theme-extension' | 'block';
  userInterface?: UIComponent[];
}

export interface UIComponent {
  type: 'form' | 'list' | 'card' | 'modal' | 'settings';
  name: string;
  fields?: FormField[];
  actions?: ComponentAction[];
}

export interface FormField {
  name: string;
  type: 'text' | 'select' | 'checkbox' | 'textarea' | 'number';
  label: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface ComponentAction {
  name: string;
  type: 'submit' | 'cancel' | 'delete' | 'edit';
  endpoint?: string;
  confirmationMessage?: string;
}

export interface CodeFile {
  path: string;
  content: string;
  type: 'component' | 'config' | 'api' | 'schema' | 'documentation';
  language: 'javascript' | 'typescript' | 'json' | 'yaml' | 'liquid' | 'php';
}