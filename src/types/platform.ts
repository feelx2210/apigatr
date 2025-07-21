
export interface Platform {
  id: string;
  name: string;
  description: string;
  logo: string;
  features: string[];
  requirements: string[];
}

export interface ApiAnalysis {
  name: string;
  description: string;
  endpoints: {
    name: string;
    method: string;
    path: string;
    description: string;
  }[];
  features: string[];
}

export interface PluginGenerationData {
  platform: Platform;
  apiSource: 'url' | 'file';
  apiUrl?: string;
  apiFile?: File;
  analysis?: ApiAnalysis;
}
