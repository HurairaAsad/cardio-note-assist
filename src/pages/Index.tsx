import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { TemplateSelector } from "@/components/TemplateSelector";
import { SummaryOutput } from "@/components/SummaryOutput";
import { ReviewOfSystems } from "@/components/ReviewOfSystems";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FileText, Brain, Shield, Clock, AlertCircle, CheckCircle, FileSearch, Settings } from "lucide-react";
import { toast } from "sonner";
import { MedicalRecordExtractor } from "@/utils/medicalExtractor";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileValidation, setFileValidation] = useState<any>(null);
  const [processingDetails, setProcessingDetails] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<string>("");
  const [reviewOfSystemsData, setReviewOfSystemsData] = useState<any>(null);

  const CLAUDE_API_KEY = "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";

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    
    // Initialize the extractor and validate the file
    const extractor = new MedicalRecordExtractor(CLAUDE_API_KEY);
    
    try {
      // Get file diagnostics
      const diagnostics = await extractor.diagnoseFile(file);
      setFileValidation(diagnostics);
      
      if (!diagnostics.supportedType || !diagnostics.sizeValid) {
        toast.error("File validation failed. Please check the requirements.");
        return;
      }
      
      toast.success("File validated successfully!");
      setCurrentStep(1);
    } catch (error) {
      console.error("File validation error:", error);
      toast.error("Failed to validate file. Please try again.");
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleReviewOfSystemsComplete = async (rosData: any) => {
    setReviewOfSystemsData(rosData);
    setIsGenerating(true);
    
    try {
      const extractor = new MedicalRecordExtractor(CLAUDE_API_KEY);
      
      // Generate final note with ROS data
      const finalNote = await extractor.generateFinalNoteWithROS(extractedData, selectedTemplate, rosData);
      
      setGeneratedSummary(finalNote);
      setCurrentStep(4);
      
      toast.success("Clinical note generated successfully!");
      
    } catch (error: any) {
      console.error("Final note generation error:", error);
      toast.error("Failed to generate final clinical note. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!uploadedFile || !selectedTemplate) {
      toast.error("Please ensure you have uploaded a file and selected a template");
      return;
    }
    
    setIsGenerating(true);
    setProcessingDetails(null);
    
    try {
      const extractor = new MedicalRecordExtractor(CLAUDE_API_KEY);
      
      // Show processing status
      toast.loading("Processing document...", { id: "processing" });
      
      // Extract medical information using the comprehensive pipeline
      const result = await extractor.extractMedicalInfo(uploadedFile, selectedTemplate);
      
      toast.dismiss("processing");
      
      if (!result.success) {
        toast.error(result.error || "Failed to extract medical information");
        setProcessingDetails({
          error: result.error,
          validation: result.validation,
          metadata: result.sourceMetadata
        });
        return;
      }
      
      setExtractedData(result.extractedNote || "");
      setProcessingDetails({
        success: true,
        validation: result.validation,
        metadata: result.sourceMetadata
      });
      setCurrentStep(3);
      
      toast.success("Analysis complete! Please review systems.");
      
    } catch (error: any) {
      console.error("Medical extraction error:", error);
      toast.error("Failed to generate clinical note. Please try again.");
      setProcessingDetails({
        error: error.message || "Unknown error occurred",
        metadata: { fileName: uploadedFile.name, fileSize: uploadedFile.size }
      });
    } finally {
      setIsGenerating(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Clinical Note Generator</h1>
          <p className="text-gray-600">Intelligent PDF extraction and AI-powered medical documentation</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <div className={`h-1 w-12 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 0.5 && (
          <div className="space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            
            {/* Enhanced file requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5" />
                  Supported Document Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">File Formats:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• PDF documents (text-based)</li>
                      <li>• Text files (.txt, .md)</li>
                      <li>• Rich text format (.rtf)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Maximum size: 50MB</li>
                      <li>• Contains medical information</li>
                      <li>• Readable text content</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 1 && uploadedFile && (
          <div className="space-y-6">
            <TemplateSelector 
              onTemplateSelect={handleTemplateSelect}
              uploadedFile={uploadedFile}
            />
            
            {/* File validation results */}
            {fileValidation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    File Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {fileValidation.supportedType ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        File type: {fileValidation.fileType} ({fileValidation.supportedType ? 'Supported' : 'Not supported'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {fileValidation.sizeValid ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        File size: {fileValidation.fileSize} ({fileValidation.sizeValid ? 'Valid' : 'Too large'})
                      </span>
                    </div>
                    {fileValidation.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {fileValidation.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Generate Clinical Summary
              </CardTitle>
              <CardDescription>
                Advanced AI extraction will analyze your document and generate a comprehensive clinical note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The AI will extract text from your PDF, validate medical content, and generate a comprehensive clinical note using advanced medical terminology and structure.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing Document with AI...
                  </span>
                ) : (
                  "Generate Advanced Clinical Note"
                )}
              </Button>
              
              {/* Processing details */}
              {processingDetails && processingDetails.error && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Processing Error:</strong> {processingDetails.error}
                    {processingDetails.metadata && (
                      <div className="mt-2 text-xs">
                        <p>File: {processingDetails.metadata.fileName}</p>
                        <p>Method: {processingDetails.metadata.extractionMethod}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <ReviewOfSystems 
            onComplete={handleReviewOfSystemsComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <SummaryOutput 
              summary={generatedSummary}
              onStartOver={() => {
                setCurrentStep(0);
                setUploadedFile(null);
                setSelectedTemplate("");
                setGeneratedSummary("");
                setExtractedData("");
                setReviewOfSystemsData(null);
                setFileValidation(null);
                setProcessingDetails(null);
              }}
            />
            
            {/* Processing success details */}
            {processingDetails && processingDetails.success && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Processing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Document Analysis:</h4>
                      {processingDetails.validation && (
                        <div className="space-y-1 text-gray-600">
                          <p>Medical Content: {processingDetails.validation.isMedical ? 'Detected' : 'Not detected'}</p>
                          <p>Confidence: {Math.round(processingDetails.validation.confidence * 100)}%</p>
                          <p>Type: {processingDetails.validation.reason}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Extraction Details:</h4>
                      {processingDetails.metadata && (
                        <div className="space-y-1 text-gray-600">
                          <p>Pages: {processingDetails.metadata.pageCount || 'N/A'}</p>
                          <p>Method: {processingDetails.metadata.extractionMethod}</p>
                          <p>File Size: {processingDetails.metadata.fileSize ? Math.round(processingDetails.metadata.fileSize / 1024) + ' KB' : 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;