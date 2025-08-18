import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  Settings, 
  Globe, 
  BarChart3, 
  RefreshCw, 
  Shield,
  Zap,
  Code,
  Users
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Upload & Generate",
      description: "Simply upload your OpenAPI docs and watch as we instantly generate plugins for Figma, WordPress, and Shopify."
    },
    {
      icon: Globe,
      title: "3 Core Platforms",
      description: "Deploy to Figma, WordPress, and Shopify with perfect optimization and reliability for each platform."
    },
    {
      icon: RefreshCw,
      title: "Live Sync",
      description: "API changes automatically propagate to all your plugins. No manual updates required."
    },
    {
      icon: BarChart3,
      title: "Usage Analytics",
      description: "Track plugin performance, API calls, and user engagement across all platforms."
    },
    {
      icon: Settings,
      title: "Version Control",
      description: "Manage plugin versions, rollback changes, and control deployment across environments."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC2 compliant with API key management, rate limiting, and audit logs."
    },
    {
      icon: Code,
      title: "Custom Branding",
      description: "White-label plugins with your branding, custom UI components, and styling."
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "From upload to live plugin in under 5 minutes. No coding or complex setup required."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members, set permissions, and collaborate on plugin development."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-crocodile-dark mb-4">
            Everything you need to scale your API
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From upload to deployment, we handle the complexity so you can focus on building great APIs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg transition-all duration-300 group hover:border-crocodile-light"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-crocodile-light flex items-center justify-center mb-4 group-hover:bg-tan-primary transition-colors">
                  <feature.icon className="w-6 h-6 text-crocodile-dark" />
                </div>
                <CardTitle className="text-crocodile-dark">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;