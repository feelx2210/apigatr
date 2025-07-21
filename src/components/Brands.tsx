const Brands = () => {
  const brands = [
    { name: "Shopify", logo: "🛍️" },
    { name: "WordPress", logo: "📝" },
    { name: "Webflow", logo: "🌊" },
    { name: "Bubble", logo: "🫧" },
    { name: "Zapier", logo: "⚡" },
    { name: "Make", logo: "🔧" },
    { name: "Airtable", logo: "📊" },
    { name: "Notion", logo: "📋" },
    { name: "Slack", logo: "💬" },
    { name: "Discord", logo: "🎮" },
    { name: "HubSpot", logo: "📈" },
    { name: "Salesforce", logo: "☁️" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-lg mb-8">
            Deploy your plugins to 100+ platforms instantly
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand, index) => (
            <div 
              key={index}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {brand.logo}
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            And many more platforms being added weekly
          </p>
        </div>
      </div>
    </section>
  );
};

export default Brands;