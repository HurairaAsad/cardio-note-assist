import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText, User } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ReviewOfSystemsData {
  general: { [key: string]: boolean };
  head: { [key: string]: boolean };
  eyes: { [key: string]: boolean };
  ears: { [key: string]: boolean };
  nose: { [key: string]: boolean };
  mouth: { [key: string]: boolean };
  neck: { [key: string]: boolean };
  chest: { [key: string]: boolean };
  heart: { [key: string]: boolean };
  abdomen: { [key: string]: boolean };
  gu: { [key: string]: boolean };
  musculoskeletal: { [key: string]: boolean };
  neurologic: { [key: string]: boolean };
  psychiatric: { [key: string]: boolean };
}

interface ReviewOfSystemsProps {
  onComplete: (data: ReviewOfSystemsData) => void;
  onBack: () => void;
}

const systemsConfig = {
  general: {
    title: "General",
    items: [
      "weight change",
      "generally healthy", 
      "change in strength or exercise tolerance"
    ]
  },
  head: {
    title: "Head",
    items: ["headaches", "vertigo", "injury"]
  },
  eyes: {
    title: "Eyes", 
    items: ["Normal vision", "diplopia", "tearing", "scotomata", "pain"]
  },
  ears: {
    title: "Ears",
    items: ["change in hearing", "tinnitus", "bleeding", "vertigo"]
  },
  nose: {
    title: "Nose",
    items: ["epistaxis", "coryza", "obstruction", "discharge"]
  },
  mouth: {
    title: "Mouth",
    items: ["dental difficulties", "gingival bleeding", "use of dentures"]
  },
  neck: {
    title: "Neck",
    items: ["stiffness", "pain", "tenderness", "noted masses"]
  },
  chest: {
    title: "Chest",
    items: ["dyspnea", "wheezing", "hemoptysis", "cough"]
  },
  heart: {
    title: "Heart",
    items: ["chest discomfort", "palpitations", "syncope", "orthopnea"]
  },
  abdomen: {
    title: "Abdomen",
    items: ["change in appetite", "dysphagia", "abdominal pains", "bowel habit changes", "emesis", "melena"]
  },
  gu: {
    title: "GU",
    items: ["urinary urgency", "dysuria", "change in nature of urine"]
  },
  musculoskeletal: {
    title: "Musculoskeletal",
    items: ["pain in muscles or joints", "limitation of range of motion", "paresthesias or numbness"]
  },
  neurologic: {
    title: "Neurologic",
    items: ["weakness", "tremor", "seizures", "changes in mentation", "ataxia"]
  },
  psychiatric: {
    title: "Psychiatric",
    items: ["depressive symptoms", "changes in sleep habits", "changes in thought content"]
  }
};

export const ReviewOfSystems = ({ onComplete, onBack }: ReviewOfSystemsProps) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    general: true,
    heart: true,
    chest: true
  });
  
  const [rosData, setRosData] = useState<ReviewOfSystemsData>(() => {
    const initialData: ReviewOfSystemsData = {} as ReviewOfSystemsData;
    Object.keys(systemsConfig).forEach(system => {
      initialData[system as keyof ReviewOfSystemsData] = {};
      systemsConfig[system as keyof typeof systemsConfig].items.forEach(item => {
        initialData[system as keyof ReviewOfSystemsData][item] = false;
      });
    });
    return initialData;
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleItemToggle = (system: keyof ReviewOfSystemsData, item: string, checked: boolean) => {
    setRosData(prev => ({
      ...prev,
      [system]: {
        ...prev[system],
        [item]: checked
      }
    }));
  };

  const getPositiveCount = () => {
    let count = 0;
    Object.values(rosData).forEach(system => {
      Object.values(system).forEach(value => {
        if (value) count++;
      });
    });
    return count;
  };

  const handleComplete = () => {
    onComplete(rosData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            Review of Systems Assessment
          </CardTitle>
          <CardDescription className="text-base">
            Please complete the Review of Systems by marking Yes/No for each symptom based on your clinical assessment.
            This will be included in the final clinical note.
          </CardDescription>
          <div className="flex items-center gap-4 pt-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {getPositiveCount()} symptoms marked positive
            </Badge>
            <Badge variant="outline">
              {Object.keys(systemsConfig).length} systems
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {Object.entries(systemsConfig).map(([systemKey, config]) => {
          const isOpen = openSections[systemKey];
          const systemData = rosData[systemKey as keyof ReviewOfSystemsData];
          const positiveItems = Object.values(systemData).filter(Boolean).length;
          
          return (
            <Card key={systemKey} className="transition-all duration-200 hover:shadow-md">
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(systemKey)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{config.title}</h3>
                        {positiveItems > 0 && (
                          <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                            {positiveItems} positive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {config.items.length} items
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      {config.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                          <Label 
                            htmlFor={`${systemKey}-${index}`}
                            className="text-sm font-medium cursor-pointer flex-1 capitalize"
                          >
                            {item}
                          </Label>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs text-muted-foreground font-medium">
                              {systemData[item] ? 'Yes' : 'No'}
                            </span>
                            <Switch
                              id={`${systemKey}-${index}`}
                              checked={systemData[item]}
                              onCheckedChange={(checked) => handleItemToggle(systemKey as keyof ReviewOfSystemsData, item, checked)}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Ready to generate final note</p>
                <p className="text-sm text-muted-foreground">
                  Review of Systems data will be integrated into your clinical note
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Back to Analysis
              </Button>
              <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
                Generate Final Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};