
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Globe, Shield, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-hero)' }}
      />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-crocodile-dark mb-4 leading-tight">
            Turn your API into
            <span className="block text-primary">plugins</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            Upload your API docs and instantly generate ready-to-publish plugins for 
            <span className="font-semibold text-crocodile-medium"> Shopify, Webflow, WordPress, and more</span> – 
            with live sync, versioning, and usage insights built in.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-crocodile-dark hover:bg-crocodile-medium text-white px-8 py-4 text-lg h-auto group"
            >
              Start Building Plugins
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-crocodile-dark text-crocodile-dark hover:bg-crocodile-light px-8 py-4 text-lg h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2 text-crocodile-medium" />
              100+ Platforms
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-crocodile-medium" />
              Enterprise Security
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-crocodile-medium" />
              5-min Setup
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
