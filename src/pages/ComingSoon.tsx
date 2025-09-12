import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [secretClicks, setSecretClicks] = useState(0);
  const navigate = useNavigate();

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you! We'll notify you when we launch.");
      setEmail("");
    }
  };

  const handleSecretClick = () => {
    setSecretClicks(prev => prev + 1);
    if (secretClicks === 4) {
      toast.success("Demo access unlocked!");
      navigate("/demo");
    }
  };

  // Reset secret clicks after 5 seconds of inactivity
  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 5000);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cursor-pointer"
                onClick={handleSecretClick}
              >
                <Stethoscope className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MedSummarize</h1>
                <p className="text-sm text-muted-foreground">AI Clinical Notes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Revolutionary AI-powered clinical documentation is almost here
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're putting the finishing touches on a platform that will transform how healthcare professionals create and manage clinical notes. Get ready for faster, more accurate documentation.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI extracts key information from medical documents automatically
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security ensures your patient data stays protected
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">
                Works with your existing EHR systems and clinical workflows
              </p>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" className="sm:w-auto">
                <Mail className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-3">
              Be the first to know when we launch
            </p>
          </div>

          {/* Secret Hint */}
          {secretClicks > 0 && secretClicks < 5 && (
            <div className="mt-8 text-sm text-muted-foreground">
              {secretClicks === 1 && "🤔 That's interesting..."}
              {secretClicks === 2 && "🧐 You're onto something..."}
              {secretClicks === 3 && "😏 Almost there..."}
              {secretClicks === 4 && "🎯 One more click!"}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MedSummarize. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}