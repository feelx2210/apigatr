import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apigatorLogo from "@/assets/apigator-logo.png";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-crocodile-dark text-white py-16">
      <div className="container mx-auto px-4">
        {/* CTA Section */}
        <div className="text-center mb-16 py-12 rounded-2xl" style={{ background: 'var(--gradient-secondary)' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-crocodile-dark mb-4">
            Ready to scale your API?
          </h2>
          <p className="text-xl text-crocodile-medium mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already using APIGATOR to deploy their APIs everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-white border-white text-crocodile-dark placeholder:text-muted-foreground"
            />
            <Button className="bg-crocodile-dark hover:bg-crocodile-medium text-white">
              Get Started
            </Button>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={apigatorLogo} 
                alt="APIGATOR" 
                className="h-8 w-8 filter brightness-0 invert"
              />
              <span className="text-2xl font-bold">APIGATOR</span>
            </div>
            <p className="text-gray-300 max-w-sm">
              Transform your APIs into plugins for 100+ platforms with live sync, versioning, and enterprise security.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-crocodile-medium">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-crocodile-medium">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-crocodile-medium">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-crocodile-medium">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-crocodile-medium pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 APIGATOR. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;