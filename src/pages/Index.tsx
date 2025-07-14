
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

  const generateCardiologyConsult = () => {
    return `CARDIOLOGY CONSULT

Patient Name: [Patient Name]
DOB: [Date of Birth]
Date of Service: ${new Date().toLocaleDateString()}
Chief Complaint: [Chief Complaint]
On consult for: Cardiac management
Code status: [Code Status]

History of Present Illness:
[Patient] is a [age] y/o [M/F], resident of [Facility/Location], with PMHx of [relevant medical history] presenting with [current symptoms/condition].

Visits:
${new Date().toLocaleDateString()} - The patient is seen resting in their room. [Clinical observations and assessment]

Review of Systems:
General: No weight change, generally healthy, no change in strength or exercise tolerance
Head: No headaches, no vertigo, no injury
Eyes: Normal vision, no diplopia, no tearing, no scotomata, no pain
Ears: No change in hearing, no tinnitus, no bleeding, no vertigo
Nose: No epistaxis, no coryza, no obstruction, no discharge
Mouth: No dental difficulties, no gingival bleeding, no use of dentures
Neck: No stiffness, no pain, no tenderness, no noted masses
Chest: No dyspnea, no wheezing, no hemoptysis, no cough
Heart: No chest discomfort, no palpitations, no syncope, no orthopnea
Abdomen: No change in appetite, no dysphagia, no abdominal pains, no bowel habit changes, no emesis, no melena
GU: No urinary urgency, no dysuria, no change in nature of urine
Musculoskeletal: No pain in muscles or joints, no limitation of range of motion, no paresthesias or numbness
Neurologic: No weakness, no tremor, no seizures, no changes in mentation, no ataxia
Psychiatric: No depressive symptoms, no changes in sleep habits, no changes in thought content

Past Surgical History: [Previous surgeries]

Family Hx: [Family medical history]

Social Hx: [Social history including smoking, alcohol, etc.]

Physical Exam:
Vitals: Weight: [weight] lbs, BP [BP], Pulse [HR] bpm, RR [RR], O2 sats [O2]% on room air
General: Alert & Oriented x3. Not in any acute distress, well appearing.
Head: Normocephalic, atraumatic, no lesions
Eyes: PERRLA, EOM intact, conjunctivae clear
Ears: No drainage, no lesions. Hearing intact.
Nose: Mucosa normal, no obstruction, no epistaxis
Throat: Clear, no exudates, no lesions
Neck: Supple, No lymphadenopathy. No JVD. no masses
Chest: Lungs clear to auscultation bilaterally. no rales, no rhonchi, no wheezes
Heart: RR, no murmurs, no rubs, no gallops
Abdomen: Soft, Nontender, no masses, BS normal.
Back: Normal curvature, no tenderness.
Extremities: full range of motion. no deformities, no edema, no erythema
Neuro: No focal deficits. Equal strength in all extremities.
Skin: Normal, no rashes, no lesions noted

Medications:
[Current medications list]

Labs & Imaging Results:
[Laboratory and imaging findings]

Assessment/Plan:
[Clinical assessment and treatment plan]

Discussed plan with collaborating physician, Dr. [Physician Name], he agrees with the plan.

[Provider Name] MSN, APRN, AGNP-BC
General Cardiology
[Practice Name]
[Phone Number]

Total time spent: [X] minutes, > 50% time spent in counseling the patient on treatment options, medications and plan of care.

Electronically generated summary - Please review and modify as clinically appropriate.`;
  };

  const generateProgressNote = () => {
    return `CARDIOLOGY PROGRESS NOTE

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

Electronically generated summary - Please review and modify as clinically appropriate.`;
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      let generatedNote = "";
      
      if (selectedTemplate === "Cardiology Consultation") {
        generatedNote = generateCardiologyConsult();
      } else if (selectedTemplate === "Cardiology Progress Note") {
        generatedNote = generateProgressNote();
      } else {
        // Default template for other types
        generatedNote = `${selectedTemplate.toUpperCase()}

PATIENT: [Patient Name]
DATE: ${new Date().toLocaleDateString()}
MRN: [Medical Record Number]

CLINICAL SUMMARY:
Based on uploaded documentation and selected template: ${selectedTemplate}

[Clinical findings and recommendations based on uploaded file: ${uploadedFile?.name}]

PLAN:
[Treatment plan and follow-up recommendations]

Electronically generated summary - Please review and modify as clinically appropriate.`;
      }
      
      setGeneratedSummary(generatedNote);
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
