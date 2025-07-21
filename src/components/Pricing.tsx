import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 3 APIs",
        "5 platforms",
        "10K API calls/month",
        "Basic analytics",
        "Email support",
        "Standard templates"
      ],
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing businesses with multiple APIs",
      features: [
        "Up to 15 APIs",
        "All 100+ platforms",
        "100K API calls/month",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Version control",
        "Team collaboration"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited APIs",
        "All platforms + custom",
        "Unlimited API calls",
        "Enterprise analytics",
        "Dedicated support",
        "White-label solution",
        "SSO & advanced security",
        "Custom integrations",
        "SLA guarantee"
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
            Choose the plan that fits your needs. All plans include a 14-day free trial.
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
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;