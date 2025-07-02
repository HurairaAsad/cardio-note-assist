
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Heart, FileText, Stethoscope, Brain } from "lucide-react";

interface TemplateSelectorProps {
  onTemplateSelect: (template: string) => void;
  uploadedFile: File;
}

export const TemplateSelector = ({ onTemplateSelect, uploadedFile }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const templates = [
    {
      id: "cardiology-progress",
      name: "Cardiology Progress Note",
      description: "Structured progress note for cardiology patients with assessment and plan",
      icon: Heart,
      color: "text-red-600 bg-red-100"
    },
    {
      id: "general-progress",
      name: "General Progress Note",
      description: "Standard progress note template for general medical encounters",
      icon: FileText,
      color: "text-blue-600 bg-blue-100"
    },
    {
      id: "consultation",
      name: "Specialist Consultation",
      description: "Comprehensive consultation note for specialty referrals",
      icon: Stethoscope,
      color: "text-green-600 bg-green-100"
    },
    {
      id: "discharge-summary",
      name: "Discharge Summary",
      description: "Hospital discharge summary with care transitions",
      icon: Brain,
      color: "text-purple-600 bg-purple-100"
    }
  ];

  const handleContinue = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      onTemplateSelect(template?.name || selectedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Clinical Template</CardTitle>
          <CardDescription>
            Choose the appropriate template for your clinical note based on the uploaded document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Uploaded file:</strong> {uploadedFile.name}
            </p>
          </div>

          <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <div className="grid gap-4">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={template.id} id={template.id} />
                  <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                    <Card className="border-2 hover:border-blue-300 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}>
                            <template.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedTemplate && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
                Continue with Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
