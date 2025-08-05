import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { TemplateSelector } from "@/components/TemplateSelector";
import { SummaryOutput } from "@/components/SummaryOutput";
import { ReviewOfSystems } from "@/components/ReviewOfSystems";
import { PhysicalExam } from "@/components/PhysicalExam";
import { Visits } from "@/components/Visits";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { FileText, Brain, Shield, Clock, AlertCircle, CheckCircle, FileSearch, Settings } from "lucide-react";
import { MedicalRecordExtractor } from "@/utils/medicalExtractor";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [liveNotePreview, setLiveNotePreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileValidation, setFileValidation] = useState<any>(null);
  const [processingDetails, setProcessingDetails] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<string>("");
  const [reviewOfSystemsData, setReviewOfSystemsData] = useState<any>(null);
  const [physicalExamData, setPhysicalExamData] = useState<any>(null);
  const [visitsData, setVisitsData] = useState<any>(null);
  const [forceOCR, setForceOCR] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractionMethod, setExtractionMethod] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate live note preview whenever form data changes
  const generateLiveNotePreview = () => {
    if (!extractedData) return extractedData;
    
    let liveNote = extractedData;
    
    // Add vitals if available
    if (physicalExamData?.vitals) {
      const vitalsLine = `\nVitals: Weight: ${physicalExamData.vitals.weight || '___'}lbs, BP ${physicalExamData.vitals.bp || '___/___'}, Pulse ${physicalExamData.vitals.pulse || '___'}bpm, RR ${physicalExamData.vitals.rr || '___'}, O2 sats ${physicalExamData.vitals.o2sats || '___'}%`;
      
      // Try to insert vitals in a logical place
      if (liveNote.includes('PHYSICAL EXAMINATION') || liveNote.includes('Physical Examination')) {
        liveNote = liveNote.replace(
          /(PHYSICAL EXAMINATION|Physical Examination)[^\n]*/i, 
          `$&${vitalsLine}`
        );
      } else {
        liveNote += `\n\nPHYSICAL EXAMINATION${vitalsLine}`;
      }
    }
    
    // Add ROS data if available
    if (reviewOfSystemsData) {
      const rosSection = formatRosForPreview(reviewOfSystemsData);
      if (rosSection) {
        liveNote += `\n\nREVIEW OF SYSTEMS:\n${rosSection}`;
      }
    }
    
    // Add physical exam findings if available
    if (physicalExamData) {
      const examSection = formatPhysicalExamForPreview(physicalExamData);
      if (examSection) {
        liveNote += `\n\nPHYSICAL EXAMINATION FINDINGS:\n${examSection}`;
      }
    }
    
    // Add visits if available
    if (visitsData?.visits) {
      const visitsSection = formatVisitsForPreview(visitsData.visits);
      if (visitsSection) {
        liveNote += `\n\nVISITS:\n${visitsSection}`;
      }
    }
    
    return liveNote;
  };

  const formatRosForPreview = (rosData: any): string => {
    if (!rosData) return '';
    
    const sections = [
      { key: 'general', title: 'General' },
      { key: 'head', title: 'Head' },
      { key: 'eyes', title: 'Eyes' },
      { key: 'ears', title: 'Ears' },
      { key: 'nose', title: 'Nose' },
      { key: 'mouth', title: 'Mouth' },
      { key: 'neck', title: 'Neck' },
      { key: 'chest', title: 'Chest' },
      { key: 'cardiovascular', title: 'Cardiovascular' },
      { key: 'gastrointestinal', title: 'Gastrointestinal' },
      { key: 'genitourinary', title: 'Genitourinary' },
      { key: 'musculoskeletal', title: 'Musculoskeletal' },
      { key: 'neurological', title: 'Neurological' },
      { key: 'psychiatric', title: 'Psychiatric' },
      { key: 'endocrine', title: 'Endocrine' },
      { key: 'hematologic', title: 'Hematologic' },
      { key: 'allergic', title: 'Allergic' }
    ];

    let formatted = '';
    sections.forEach(section => {
      if (rosData[section.key] && typeof rosData[section.key] === 'object') {
        const items = Object.entries(rosData[section.key])
          .map(([item, value]) => `(${value ? 'Y' : 'N'}) ${item}`)
          .join(', ');
        if (items) {
          formatted += `${section.title}: ${items}\n`;
        }
      }
    });

    return formatted;
  };

  const formatPhysicalExamForPreview = (examData: any): string => {
    if (!examData) return '';

    const sections = [
      { key: 'general', title: 'General' },
      { key: 'head', title: 'Head' },
      { key: 'eyes', title: 'Eyes' },
      { key: 'ears', title: 'Ears' },
      { key: 'nose', title: 'Nose' },
      { key: 'throat', title: 'Throat' },
      { key: 'neck', title: 'Neck' },
      { key: 'chest', title: 'Chest' },
      { key: 'heart', title: 'Heart' },
      { key: 'abdomen', title: 'Abdomen' },
      { key: 'back', title: 'Back' },
      { key: 'extremities', title: 'Extremities' },
      { key: 'neuro', title: 'Neuro' },
      { key: 'skin', title: 'Skin' }
    ];

    let formatted = '';
    sections.forEach(section => {
      if (examData[section.key] && typeof examData[section.key] === 'object') {
        const items = Object.entries(examData[section.key])
          .map(([item, value]) => `(${value ? 'Y' : 'N'}) ${item}`)
          .join(', ');
        if (items) {
          formatted += `${section.title}: ${items}\n`;
        }
      }
    });

    return formatted;
  };

  const formatVisitsForPreview = (visits: any[]): string => {
    if (!visits || visits.length === 0) return '';
    
    return visits
      .filter(visit => visit.note.trim().length > 0)
      .map(visit => `(DOS - ${visit.date}): ${visit.note}`)
      .join('\n');
  };

  // Update live preview whenever form data changes
  useEffect(() => {
    if (extractedData) {
      const preview = generateLiveNotePreview();
      setLiveNotePreview(preview);
    }
  }, [extractedData, reviewOfSystemsData, physicalExamData, visitsData]);

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
        toast({
          title: "File validation failed",
          description: "Please check the requirements.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "File validated successfully",
        description: "File is ready for processing.",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("File validation error:", error);
      toast({
        title: "Validation failed",
        description: "Failed to validate file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleProceedToAssessments = () => {
    setExtractedData(generatedSummary); // Store the analysis for later combination
    setCurrentStep(4);
    toast({
      title: "Proceeding to assessments",
      description: "Now record current patient assessments.",
    });
  };

  const handleReviewOfSystemsComplete = (rosData: any) => {
    setReviewOfSystemsData(rosData);
    setCurrentStep(5);
    toast({
      title: "Review of Systems complete",
      description: "Moving to Physical Exam.",
    });
  };

  const handlePhysicalExamComplete = (examData: any) => {
    setPhysicalExamData(examData);
    setCurrentStep(6);
    toast({
      title: "Physical Exam complete",
      description: "Moving to Visit notes.",
    });
  };

  const handleVisitsComplete = async (visits: any) => {
    console.log('🚀 handleVisitsComplete called with visits:', visits);
    console.log('📋 Current state:', { 
      user: user?.id, 
      extractedData: extractedData.length, 
      selectedTemplate,
      reviewOfSystemsData: !!reviewOfSystemsData,
      physicalExamData: !!physicalExamData 
    });
    
    setVisitsData(visits);
    setIsGenerating(true);
    
    try {
      console.log('⏳ Starting final note generation...');
      const extractor = new MedicalRecordExtractor(CLAUDE_API_KEY);
      
      // Generate final note combining analysis with current assessments
      console.log('🔄 Calling generateFinalNoteWithAllData...');
      const finalNote = await extractor.generateFinalNoteWithAllData(
        extractedData, // This is the original analysis
        selectedTemplate, 
        reviewOfSystemsData,
        physicalExamData,
        visits
      );
      
      console.log('✅ Final note generated successfully, length:', finalNote.length);
      console.log('📝 Final note preview:', finalNote.substring(0, 200));
      
      // Replace the summary with the combined final note and advance step
      setGeneratedSummary(finalNote);
      setCurrentStep(7);
      setIsGenerating(false);
      
      toast({
        title: "Final clinical note generated",
        description: "Your comprehensive note is ready.",
      });
      
      // Save report to database if user is logged in
      if (user) {
        try {
          console.log('Saving report for user:', user.id);
          console.log('User object:', user);
          
          const reportData = {
            user_id: user.id,
            title: `Clinical Note - ${new Date().toLocaleDateString()}`,
            original_document_name: uploadedFile?.name,
            template_type: selectedTemplate,
            initial_analysis: extractedData,
            review_of_systems: reviewOfSystemsData,
            physical_exam: physicalExamData,
            visit_notes: visitsData, // Fixed: was using 'visits' instead of 'visitsData'
            final_report: finalNote
          };
          
          console.log('Report data to save:', reportData);
          
          const { data: insertedData, error } = await supabase
            .from('reports')
            .insert(reportData)
            .select();
          
          console.log('Insert result:', { insertedData, error });
          
          if (error) {
            console.error('Database insert error:', error);
            throw error;
          }
          
          // Refresh dashboard data if user navigates there
          toast({
            title: "Report saved successfully",
            description: "Your clinical note has been saved to your dashboard.",
          });
          
          console.log('Report saved successfully with ID:', insertedData?.[0]?.id);
        } catch (error) {
          console.error('Error saving report:', error);
          toast({
            title: "Failed to save report",
            description: `The report was generated but could not be saved. Error: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        console.log('No user logged in, skipping report save');
        toast({
          title: "Sign in required",
          description: "Please sign in to save your reports to the dashboard.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Final clinical note generated",
        description: "Your comprehensive note is ready.",
      });
      
    } catch (error: any) {
      console.error("❌ Final note generation error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      toast({
        title: "Generation failed",
        description: `Failed to generate final clinical note: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      console.log('✅ Generation process complete');
    }
  };

  const handleGenerateSummary = async () => {
    if (!uploadedFile || !selectedTemplate) {
      toast({
        title: "Missing requirements",
        description: "Please ensure you have uploaded a file and selected a template.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setProcessingDetails(null);
    setProcessingStage('reading');
    setProcessingProgress(0);
    
    try {
      const extractor = new MedicalRecordExtractor(CLAUDE_API_KEY);
      
      // Update progress stages
      setProcessingStage('reading');
      setProcessingProgress(20);
      
      // Extract medical information using the comprehensive pipeline
      const result = await extractor.extractMedicalInfo(uploadedFile, selectedTemplate);
      
      setProcessingStage('ai-analysis');
      setProcessingProgress(60);
      
      // Set extraction method and document type from metadata
      if (result.sourceMetadata) {
        setExtractionMethod(result.sourceMetadata.extractionMethod || 'Unknown');
        if (result.sourceMetadata.extractionMethod?.includes('OCR')) {
          setProcessingStage('ocr');
          setProcessingProgress(40);
        }
      }
      
      if (!result.success) {
        toast({
          title: "Extraction failed",
          description: result.error || "Failed to extract medical information.",
          variant: "destructive",
        });
        setProcessingDetails({
          error: result.error,
          validation: result.validation,
          metadata: result.sourceMetadata
        });
        return;
      }
      
      setProcessingStage('complete');
      setProcessingProgress(100);
      
      setGeneratedSummary(result.extractedNote || "");
      setProcessingDetails({
        success: true,
        validation: result.validation,
        metadata: result.sourceMetadata
      });
      setCurrentStep(3);
      
      toast({
        title: "Analysis complete",
        description: "Review the generated report, then proceed to current assessments.",
      });
      
    } catch (error: any) {
      console.error("Medical extraction error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate clinical note. Please try again.",
        variant: "destructive",
      });
      setProcessingDetails({
        error: error.message || "Unknown error occurred",
        metadata: { fileName: uploadedFile.name, fileSize: uploadedFile.size }
      });
    } finally {
      setIsGenerating(false);
      setProcessingStage('');
      setProcessingProgress(0);
    }
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Header />
        <Hero onGetStarted={() => setCurrentStep(0.5)} />
        <Features />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
            <div className={`h-1 w-8 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className={`h-1 w-8 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <div className={`h-1 w-8 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <div className={`h-1 w-8 ${currentStep >= 5 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              5
            </div>
            <div className={`h-1 w-8 ${currentStep >= 6 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 6 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              6
            </div>
            <div className={`h-1 w-8 ${currentStep >= 7 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 7 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              7
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 0.5 && (
          <div className="space-y-6">
            <FileUpload 
              onFileUpload={handleFileUpload}
              forceOCR={forceOCR}
              onForceOCRChange={setForceOCR}
            />
            
            {/* Processing Status */}
            <ProcessingStatus 
              isProcessing={isGenerating}
              processingStage={processingStage}
              progress={processingProgress}
              extractionMethod={extractionMethod}
              documentType={documentType}
            />
            
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
                setPhysicalExamData(null);
                setVisitsData(null);
                setFileValidation(null);
                setProcessingDetails(null);
              }}
              showProceedButton={true}
              onProceed={handleProceedToAssessments}
            />
            
            {/* Processing success details */}
            {processingDetails && processingDetails.success && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Analysis Summary - Historical Data Synthesized
                  </CardTitle>
                  <CardDescription>
                    The analysis above synthesizes historical medical data. Next, record current Y/N assessments.
                  </CardDescription>
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

        {currentStep === 4 && (
          <div className="space-y-6">
            <ReviewOfSystems 
              onComplete={handleReviewOfSystemsComplete}
              onBack={() => setCurrentStep(3)}
            />
            
            {/* Live note preview during editing */}
            {liveNotePreview && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Live Note Preview</CardTitle>
                  <CardDescription>Real-time preview showing your edits as you make them</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{liveNotePreview}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <PhysicalExam 
              onComplete={handlePhysicalExamComplete}
              onBack={() => setCurrentStep(4)}
              extractedVitals={processingDetails?.metadata?.vitals}
            />
            
            {/* Live note preview during editing */}
            {liveNotePreview && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Live Note Preview</CardTitle>
                  <CardDescription>Real-time preview showing your edits as you make them</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{liveNotePreview}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <Visits 
              onComplete={handleVisitsComplete}
              onBack={() => setCurrentStep(5)}
              isGenerating={isGenerating}
            />
            
            {/* Live note preview during editing */}
            {liveNotePreview && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800">Live Note Preview</CardTitle>
                  <CardDescription>Real-time preview showing your edits as you make them</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{liveNotePreview}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 7 && (
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
                setPhysicalExamData(null);
                setVisitsData(null);
                setFileValidation(null);
                setProcessingDetails(null);
              }}
            />
            
            {/* Final note completion notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-2">✓ Final Clinical Note Generated</p>
                  <p>This note combines:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Historical data analysis from uploaded documents</li>
                    <li>Current Review of Systems assessments (Y/N)</li>
                    <li>Current Physical Examination findings (Y/N)</li>
                    <li>Current visit documentation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;