const Brands = () => {
  const brands = [
    { name: "Figma", logo: "🐊" },
    { name: "WordPress", logo: "📝" },
    { name: "Shopify", logo: "🛍️" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-lg mb-8">
            Deploy your plugins to our 3 core platforms instantly
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-2xl mx-auto">
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
            Quality over quantity - we perfect these 3 platforms for maximum reliability
          </p>
        </div>
      </div>
    </section>
  );
};

export default Brands;