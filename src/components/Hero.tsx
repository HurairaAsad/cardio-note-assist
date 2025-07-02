
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Shield, Clock, Brain } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Clinical Notes
            <span className="block text-blue-600">For Nurse Practitioners</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform patient reports and encounter notes into structured, professional clinical documentation. 
            Specialized for cardiology and medical specialties with HIPAA-compliant AI processing.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Summarizing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload & Process</h3>
            <p className="text-gray-600">Support for PDF, DOCX, and text files with intelligent parsing</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">GPT-4 powered analysis with medical specialty templates</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Export</h3>
            <p className="text-gray-600">HIPAA-compliant processing with EMR-ready output formats</p>
          </div>
        </div>
      </div>
    </section>
  );
};
