
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { TemplateSelector } from "@/components/TemplateSelector";
import { SummaryOutput } from "@/components/SummaryOutput";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FileText, Brain, Shield, Clock } from "lucide-react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep(1);
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setGeneratedSummary(`
CARDIOLOGY PROGRESS NOTE

PATIENT: [Patient Name]
DATE: ${new Date().toLocaleDateString()}
MRN: [Medical Record Number]

CHIEF COMPLAINT:
Patient presents for routine cardiology follow-up.

HISTORY OF PRESENT ILLNESS:
Based on uploaded documentation, patient continues to manage cardiovascular conditions with current medication regimen. No acute complaints reported.

ASSESSMENT AND PLAN:
1. Hypertension - Continue current antihypertensive therapy
2. Coronary artery disease - Stable, continue dual antiplatelet therapy
3. Follow-up in 3 months or sooner if symptoms develop

MEDICATIONS REVIEWED:
- Current medications as documented
- No changes recommended at this time

RECOMMENDATIONS:
- Continue current cardiac medications
- Lifestyle modifications reinforced
- Return to clinic in 3 months

Electronically generated summary - Please review and modify as clinically appropriate.
      `);
      setIsGenerating(false);
      setCurrentStep(3);
    }, 3000);
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <Hero onGetStarted={() => setCurrentStep(0.5)} />
        <Features />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Note Generator</h1>
          <p className="text-gray-600">AI-powered summarization for healthcare professionals</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 0.5 && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}

        {currentStep === 1 && uploadedFile && (
          <TemplateSelector 
            onTemplateSelect={handleTemplateSelect}
            uploadedFile={uploadedFile}
          />
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Generate Clinical Summary
              </CardTitle>
              <CardDescription>
                Review your selections and generate the AI-powered clinical note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Summary:</h3>
                <p className="text-blue-800">File: {uploadedFile?.name}</p>
                <p className="text-blue-800">Template: {selectedTemplate}</p>
              </div>
              <Button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Generating..." : "Generate Clinical Note"}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <SummaryOutput 
            summary={generatedSummary}
            onStartOver={() => {
              setCurrentStep(0);
              setUploadedFile(null);
              setSelectedTemplate("");
              setGeneratedSummary("");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
