
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at DataFlow",
      company: "DataFlow Analytics",
      image: "👩‍💼",
      rating: 5,
      content: "APIGATR transformed how we distribute our API. We went from months of custom plugin development to having our API available on 50+ platforms in just one week. The ROI has been incredible."
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Developer",
      company: "E-commerce Solutions Inc",
      image: "👨‍💻",
      rating: 5,
      content: "The live sync feature is a game-changer. When we update our API, all plugins across every platform update automatically. No more manual deployments or version conflicts."
    },
    {
      name: "Jessica Thompson",
      role: "Product Manager",
      company: "CloudAPI Services",
      image: "👩‍🔬",
      rating: 5,
      content: "We've scaled from 3 integrations to 80+ in just 3 months using APIGATR. The analytics dashboard gives us insights we never had before about how our API is being used."
    },
    {
      name: "David Kumar",
      role: "Founder & CEO",
      company: "StartupTech",
      image: "👨‍🚀",
      rating: 5,
      content: "As a startup, we needed to integrate everywhere fast. APIGATR made it possible to compete with enterprise solutions from day one. Our API is now available on more platforms than our competitors."
    },
    {
      name: "Emily Watson",
      role: "VP of Engineering",
      company: "TechCorp",
      image: "👩‍🎓",
      rating: 5,
      content: "The white-label capabilities are fantastic. We can offer our clients branded plugins that look and feel like they built them in-house. It's become a major differentiator for us."
    },
    {
      name: "Michael Brown",
      role: "Integration Specialist",
      company: "API First Solutions",
      image: "👨‍🔧",
      rating: 5,
      content: "APIGATR's enterprise security features gave us the confidence to deploy across all major platforms. SOC2 compliance and detailed audit logs were exactly what we needed."
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-crocodile-dark mb-4">
            Loved by developers and businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how teams are scaling their APIs faster than ever before.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-lg transition-all duration-300 hover:border-crocodile-light"
              style={{ boxShadow: 'var(--shadow-soft)' }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <h4 className="font-semibold text-crocodile-dark">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm font-medium text-crocodile-medium">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-crocodile-medium text-crocodile-medium" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-tan-light">
            <Star className="w-5 h-5 fill-crocodile-medium text-crocodile-medium mr-2" />
            <span className="font-semibold text-crocodile-dark">4.9/5 average rating</span>
            <span className="text-muted-foreground ml-2">from 500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
