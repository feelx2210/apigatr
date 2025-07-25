
import { Button } from "@/components/ui/button";
import { usePasswordAuth } from "@/hooks/use-password-auth";
import { LogOut } from "lucide-react";
import apigatrLogo from "@/assets/apigatr-logo.png";

const Header = () => {
  const { logout } = usePasswordAuth();

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={apigatrLogo} 
            alt="APIGATR" 
            className="h-8 w-8"
          />
          <span className="text-2xl font-bold text-crocodile-dark">APIGATR</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">
            Testimonials
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Log In
          </Button>
          <Button className="bg-crocodile-dark hover:bg-crocodile-medium text-white">
            Sign Up
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
