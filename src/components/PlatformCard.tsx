
import { Platform } from "@/types/platform";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlatformCardProps {
  platform: Platform;
  selected: boolean;
  onSelect: () => void;
}

const PlatformCard = ({ platform, selected, onSelect }: PlatformCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-crocodile-medium bg-crocodile-light/10' : 'hover:border-crocodile-medium'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{platform.logo}</span>
            <div>
              <CardTitle className="text-lg">{platform.name}</CardTitle>
            </div>
          </div>
          {selected && (
            <div className="w-6 h-6 bg-crocodile-medium rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <CardDescription className="text-sm">
          {platform.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Key Features</h4>
            <div className="flex flex-wrap gap-1">
              {platform.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {platform.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{platform.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformCard;
