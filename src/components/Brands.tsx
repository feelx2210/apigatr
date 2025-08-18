import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Brands = () => {
  const platforms = [
    { 
      name: "Figma", 
      logo: "🎨",
      officialLogo: "https://cdn.worldvectorlogo.com/logos/figma-5.svg",
      description: "Transform your APIs into powerful Figma plugins that designers can use directly in their workflow. Enable seamless integration between your data and the design process.",
      reason: "Figma's plugin ecosystem is growing rapidly, and designers need easy access to external data and APIs within their design tools."
    },
    { 
      name: "WordPress", 
      logo: "📝",
      officialLogo: "https://s.w.org/style/images/about/WordPress-logotype-wmark.png",
      description: "Create WordPress plugins that connect your API to the world's most popular CMS. Reach millions of websites with your data and functionality.",
      reason: "WordPress powers 43% of all websites. A WordPress plugin gives your API massive reach and accessibility to content creators worldwide."
    },
    { 
      name: "Shopify", 
      logo: "🛍️", 
      officialLogo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
      description: "Build Shopify apps that integrate your API with e-commerce stores. Help merchants enhance their stores with your data and services.",
      reason: "Shopify merchants are always looking for ways to optimize their stores. Your API can provide valuable insights, automation, and integrations."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-crocodile-dark mb-4">
            Our 3 Core Platforms
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We've carefully selected these platforms to give your API maximum impact and reach. 
            Quality over quantity - each platform represents a massive opportunity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {platforms.map((platform, index) => (
            <Card 
              key={index}
              className="border-border hover:shadow-lg transition-all duration-300 group hover:border-crocodile-light h-full"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform">
                  <img 
                    src={platform.officialLogo} 
                    alt={`${platform.name} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <span 
                    className="text-2xl" 
                    style={{ display: 'none' }}
                  >
                    {platform.logo}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-crocodile-dark">{platform.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {platform.description}
                </CardDescription>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-crocodile-medium font-medium mb-2">Why this platform?</p>
                  <p className="text-sm text-muted-foreground">
                    {platform.reason}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Quality over quantity - we perfect these 3 platforms for maximum reliability
          </p>
        </div>
      </div>
    </section>
  );
};

export default Brands;