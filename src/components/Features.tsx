
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, FileText, Clock, Shield, Download, Zap } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Heart,
      title: "Cardiology Specialized",
      description: "Pre-built templates for cardiology progress notes, echo reports, and cardiac consultations",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: FileText,
      title: "Multi-Format Support",
      description: "Process PDF, DOCX, and plain text patient documents with intelligent parsing",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Generate comprehensive clinical notes in minutes instead of hours of manual documentation",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Secure processing with encrypted data transmission and no permanent storage of PHI",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Download,
      title: "EMR Ready Export",
      description: "Export formatted notes directly to your electronic medical record system",
      color: "text-orange-600 bg-orange-100"
    },
    {
      icon: Zap,
      title: "AI Powered",
      description: "Leverages GPT-4 Turbo for accurate medical terminology and clinical reasoning",
      color: "text-yellow-600 bg-yellow-100"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Healthcare Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Designed specifically for Nurse Practitioners working in cardiology and specialty medicine
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
