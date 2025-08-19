import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "🐊 Single Bite",
      price: "One-time",
      period: "",
      description: "Perfect for companies who just want to turn their API into a plugin once",
      features: [
        "1 plugin scaffold (choose platform)",
        "Download as ready-to-install ZIP",
        "Basic email support"
      ],
      buttonText: "Choose Platform",
      popular: false,
      platformPricing: {
        figma: "$99",
        wordpress: "$199", 
        shopify: "$399"
      }
    },
    {
      name: "🐊 Growing Gator",
      price: "$49-$99",
      period: "/month",
      description: "Ideal if you want your plugins to stay fresh and always in sync with your API",
      features: [
        "Everything in Single Bite",
        "Auto-Sync: API changes update plugins automatically",
        "Plugin hosting & versioning",
        "Basic analytics (downloads, last usage)",
        "$49/month → 1 plugin",
        "$99/month → up to 3 plugins"
      ],
      buttonText: "Start Subscription",
      popular: true
    },
    {
      name: "🐊 Enterprise Swamp",
      price: "Custom",
      period: "",
      description: "For SaaS companies running multiple plugins across platforms",
      features: [
        "Everything in Growing Gator",
        "Multi-platform management dashboard",
        "Priority support & SLA",
        "Private hosting & CI/CD integration"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-crocodile-dark mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose what works for you - one-time purchases, subscriptions, or custom solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-border hover:shadow-lg transition-all duration-300 ${
                plan.popular 
                  ? 'border-crocodile-medium shadow-lg scale-105' 
                  : 'hover:border-crocodile-light'
              }`}
              style={{ boxShadow: plan.popular ? 'var(--shadow-crocodile)' : 'var(--shadow-soft)' }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-crocodile-dark text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-crocodile-dark">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-crocodile-dark">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
               <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-crocodile-medium mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Platform-specific pricing for Single Bite */}
                {plan.platformPricing && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Platform-specific pricing:</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Figma</span>
                        <span className="font-semibold text-crocodile-dark">{plan.platformPricing.figma}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">WordPress</span>
                        <span className="font-semibold text-crocodile-dark">{plan.platformPricing.wordpress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Shopify</span>
                        <span className="font-semibold text-crocodile-dark">{plan.platformPricing.shopify}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-crocodile-dark hover:bg-crocodile-medium text-white' 
                      : 'bg-background border border-crocodile-dark text-crocodile-dark hover:bg-crocodile-light'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            One-time purchases • Monthly subscriptions • Custom enterprise solutions
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;