import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Info, Star, Zap, Settings, Shield, Workflow } from 'lucide-react';
import { PluginFeature } from '@/lib/transformation/api-intelligence';

interface FeatureCustomizationProps {
  features: PluginFeature[];
  selectedFeatures: string[];
  onUpdateSelection: (selectedFeatures: string[], customizations?: Record<string, any>) => void;
}

const FeatureCustomization: React.FC<FeatureCustomizationProps> = ({
  features,
  selectedFeatures,
  onUpdateSelection
}) => {
  const [expandedFeatures, setExpandedFeatures] = React.useState<Set<string>>(new Set());
  const [customizations, setCustomizations] = React.useState<Record<string, any>>({});

  const toggleFeature = (featureId: string) => {
    const newSelected = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
    
    onUpdateSelection(newSelected, customizations);
  };

  const toggleExpanded = (featureId: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureId)) {
      newExpanded.delete(featureId);
    } else {
      newExpanded.add(featureId);
    }
    setExpandedFeatures(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'core features':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'productivity':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'configuration':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'setup':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'smart features':
        return <Workflow className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFigmaIntegrationBadge = (type: string) => {
    const badgeMap = {
      'selection': { text: 'Selection Based', variant: 'default' as const },
      'canvas': { text: 'Canvas Integration', variant: 'secondary' as const },
      'ui': { text: 'UI Panel', variant: 'outline' as const },
      'batch': { text: 'Batch Processing', variant: 'destructive' as const },
      'workflow': { text: 'Workflow', variant: 'default' as const }
    };
    
    return badgeMap[type] || { text: type, variant: 'outline' as const };
  };

  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PluginFeature[]>);

  const categoryOrder = ['Core Features', 'Smart Features', 'Productivity', 'Configuration', 'Setup'];
  const sortedCategories = Object.keys(featuresByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const getSelectedCount = () => selectedFeatures.length;
  const getRequiredCount = () => features.filter(f => f.required).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Feature Selection</span>
            <Badge variant="outline">
              {getSelectedCount()} of {features.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose which features to include in your Figma plugin. Required features cannot be disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{getRequiredCount()} Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{getSelectedCount() - getRequiredCount()} Optional Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>{features.length - getSelectedCount()} Not Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features by Category */}
      <div className="space-y-4">
        {sortedCategories.map(category => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getCategoryIcon(category)}
                {category}
                <Badge variant="secondary" className="ml-auto">
                  {featuresByCategory[category].length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuresByCategory[category].map(feature => (
                <div key={feature.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={selectedFeatures.includes(feature.id)}
                          onCheckedChange={() => !feature.required && toggleFeature(feature.id)}
                          disabled={feature.required}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{feature.name}</h4>
                            {feature.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-8">
                        <Badge 
                          variant={getFigmaIntegrationBadge(feature.figmaIntegration.type).variant}
                        >
                          {getFigmaIntegrationBadge(feature.figmaIntegration.type).text}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {feature.figmaIntegration.description}
                        </span>
                      </div>

                      {feature.endpoints.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-8 h-auto p-1 text-xs"
                              onClick={() => toggleExpanded(feature.id)}
                            >
                              {expandedFeatures.has(feature.id) ? (
                                <ChevronDown className="h-3 w-3 mr-1" />
                              ) : (
                                <ChevronRight className="h-3 w-3 mr-1" />
                              )}
                              {feature.endpoints.length} endpoint{feature.endpoints.length !== 1 ? 's' : ''}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-8 mt-2">
                            <div className="text-xs text-muted-foreground space-y-1">
                              {feature.endpoints.slice(0, 3).map(endpointId => (
                                <div key={endpointId} className="font-mono">
                                  {endpointId}
                                </div>
                              ))}
                              {feature.endpoints.length > 3 && (
                                <div className="text-muted-foreground">
                                  ... and {feature.endpoints.length - 3} more
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allOptional = features.filter(f => !f.required).map(f => f.id);
              const newSelected = [...selectedFeatures, ...allOptional];
              onUpdateSelection(Array.from(new Set(newSelected)), customizations);
            }}
          >
            Select All Optional
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const requiredOnly = features.filter(f => f.required).map(f => f.id);
              onUpdateSelection(requiredOnly, customizations);
            }}
          >
            Required Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const recommended = features.filter(f => f.enabled).map(f => f.id);
              onUpdateSelection(recommended, customizations);
            }}
          >
            Use Recommended
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureCustomization;