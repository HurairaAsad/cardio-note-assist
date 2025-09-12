
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Shield, Brain } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/10 animate-fade-in">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
            AI-Powered Clinical Notes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Transform patient reports and encounter notes into structured, professional clinical documentation. 
            Specialized for cardiology and medical specialties with HIPAA-compliant AI processing.
          </p>
          <div className="flex items-center justify-center space-x-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-8 py-3 soft-hover rounded-xl"
            >
              Start Summarizing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 soft-hover rounded-xl border-2">
              View Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-card rounded-2xl soft-shadow soft-hover animate-scale-in" style={{animationDelay: '0.6s'}}>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Upload & Process</h3>
            <p className="text-muted-foreground">Support for PDF, DOCX, and text files with intelligent parsing</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-2xl soft-shadow soft-hover animate-scale-in" style={{animationDelay: '0.8s'}}>
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">AI Analysis</h3>
            <p className="text-muted-foreground">Advanced Claude AI powered analysis with medical specialty templates</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-2xl soft-shadow soft-hover animate-scale-in" style={{animationDelay: '1s'}}>
            <div className="w-16 h-16 bg-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:scale-110">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Secure Export</h3>
            <p className="text-muted-foreground">HIPAA-compliant processing with EMR-ready output formats</p>
          </div>
        </div>
      </div>
    </section>
  );
};
