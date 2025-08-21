import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { WordPressFeature, WordPressIntelligence, IntegrationStrategy } from '@/lib/transformation/wordpress-intelligence';
import { Settings, Zap, Shield, Database, Code2, Layers } from 'lucide-react';

interface WordPressFeatureCustomizationProps {
  intelligence: WordPressIntelligence;
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string, enabled: boolean) => void;
  onIntegrationStrategyChange: (strategy: Partial<IntegrationStrategy>) => void;
  onCustomizationChange: (customizations: Record<string, any>) => void;
}

export function WordPressFeatureCustomization({
  intelligence,
  selectedFeatures,
  onFeatureToggle,
  onIntegrationStrategyChange,
  onCustomizationChange
}: WordPressFeatureCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'features' | 'integration' | 'security'>('features');
  const [customizations, setCustomizations] = useState<Record<string, any>>({});

  const handleCustomizationUpdate = (key: string, value: any) => {
    const updated = { ...customizations, [key]: value };
    setCustomizations(updated);
    onCustomizationChange(updated);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'admin-page': return <Settings className="h-4 w-4" />;
      case 'gutenberg-block': return <Layers className="h-4 w-4" />;
      case 'media-library': return <Database className="h-4 w-4" />;
      case 'cron-job': return <Zap className="h-4 w-4" />;
      case 'rest-endpoint': return <Code2 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* WordPress Context Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 WordPress Integration Context
          </CardTitle>
          <CardDescription>
            Detected use case and recommended plugin architecture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Primary Use Case</h4>
              <p className="font-semibold capitalize">{intelligence.wordpressContext.primaryUseCase.replace('-', ' ')}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Plugin Type</h4>
              <p className="font-semibold capitalize">{intelligence.wordpressContext.suggestedPluginType.replace('-', ' ')}</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {intelligence.wordpressContext.wooCommerceCompatible && (
              <Badge variant="outline">WooCommerce Compatible</Badge>
            )}
            {intelligence.wordpressContext.multisiteCompatible && (
              <Badge variant="outline">Multisite Ready</Badge>
            )}
            <Badge variant={intelligence.wordpressContext.performanceImpact === 'high' ? 'destructive' : 'secondary'}>
              {intelligence.wordpressContext.performanceImpact.charAt(0).toUpperCase() + intelligence.wordpressContext.performanceImpact.slice(1)} Performance Impact
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'features' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('features')}
        >
          Features
        </Button>
        <Button
          variant={activeTab === 'integration' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('integration')}
        >
          Integration
        </Button>
        <Button
          variant={activeTab === 'security' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('security')}
        >
          Security
        </Button>
      </div>

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">WordPress Plugin Features</h3>
          <div className="grid gap-4">
            {intelligence.wordpressFeatures.map((feature) => (
              <Card key={feature.id} className={selectedFeatures.includes(feature.id) ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={(checked) => onFeatureToggle(feature.id, checked as boolean)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getIntegrationIcon(feature.wordpressIntegration.type)}
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                        </div>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={getPriorityColor(feature.priority)}>{feature.priority}</Badge>
                      <Badge variant={getComplexityColor(feature.estimatedComplexity)}>
                        {feature.estimatedComplexity} complexity
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                {selectedFeatures.includes(feature.id) && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2">WordPress Integration Details</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{feature.wordpressIntegration.type.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Min WP:</span>
                            <span className="ml-2">{feature.wpCompatibility.minVersion}+</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Required Capabilities</h5>
                        <div className="flex gap-1 flex-wrap">
                          {feature.wordpressIntegration.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">User Benefit</h5>
                        <p className="text-sm text-muted-foreground">{feature.userBenefit}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Integration Tab */}
      {activeTab === 'integration' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Integration Strategy</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Primary Integration Method</CardTitle>
              <CardDescription>Choose the main way users will interact with your plugin</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={intelligence.integrationStrategy.primary}
                onValueChange={(value) => onIntegrationStrategyChange({ primary: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin-page">Admin Dashboard Page</SelectItem>
                  <SelectItem value="gutenberg-block">Gutenberg Block/Editor</SelectItem>
                  <SelectItem value="media-library">Media Library Integration</SelectItem>
                  <SelectItem value="shortcode">Shortcode System</SelectItem>
                  <SelectItem value="widget">WordPress Widget</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>Configure background processing and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="background-processing"
                  checked={intelligence.integrationStrategy.backgroundProcessing}
                  onCheckedChange={(checked) => onIntegrationStrategyChange({ backgroundProcessing: checked as boolean })}
                />
                <label htmlFor="background-processing" className="text-sm font-medium">
                  Enable background processing (WP-Cron)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caching"
                  checked={intelligence.integrationStrategy.caching}
                  onCheckedChange={(checked) => onIntegrationStrategyChange({ caching: checked as boolean })}
                />
                <label htmlFor="caching" className="text-sm font-medium">
                  Enable API response caching
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rate-limit"
                  checked={intelligence.integrationStrategy.apiRateLimit}
                  onCheckedChange={(checked) => onIntegrationStrategyChange({ apiRateLimit: checked as boolean })}
                />
                <label htmlFor="rate-limit" className="text-sm font-medium">
                  Implement API rate limiting
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plugin Settings</CardTitle>
              <CardDescription>Customize plugin behavior and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Plugin Menu Position</label>
                <Select
                  value={customizations.menuPosition || 'main'}
                  onValueChange={(value) => handleCustomizationUpdate('menuPosition', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Menu</SelectItem>
                    <SelectItem value="tools">Tools Submenu</SelectItem>
                    <SelectItem value="settings">Settings Submenu</SelectItem>
                    <SelectItem value="media">Media Submenu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Default User Role Access</label>
                <Select
                  value={customizations.defaultRole || 'editor'}
                  onValueChange={(value) => handleCustomizationUpdate('defaultRole', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator Only</SelectItem>
                    <SelectItem value="editor">Editor and Above</SelectItem>
                    <SelectItem value="author">Author and Above</SelectItem>
                    <SelectItem value="contributor">Contributor and Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Security Considerations</h3>
          <div className="grid gap-4">
            {intelligence.securityConsiderations.map((consideration, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <CardTitle className="text-base capitalize">
                          {consideration.type.replace('-', ' ')}
                        </CardTitle>
                        <CardDescription>{consideration.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(consideration.priority)}>
                      {consideration.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <h5 className="font-medium text-sm mb-1">Implementation</h5>
                    <p className="text-sm text-muted-foreground">{consideration.implementation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}