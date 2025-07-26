import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Activity, User } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PhysicalExamData {
  vitals: {
    weight: string;
    bp: string;
    pulse: string;
    rr: string;
    o2sats: string;
  };
  general: { [key: string]: boolean };
  head: { [key: string]: boolean };
  eyes: { [key: string]: boolean };
  ears: { [key: string]: boolean };
  nose: { [key: string]: boolean };
  throat: { [key: string]: boolean };
  neck: { [key: string]: boolean };
  chest: { [key: string]: boolean };
  heart: { [key: string]: boolean };
  abdomen: { [key: string]: boolean };
  back: { [key: string]: boolean };
  extremities: { [key: string]: boolean };
  neuro: { [key: string]: boolean };
  skin: { [key: string]: boolean };
}

interface PhysicalExamProps {
  onComplete: (data: PhysicalExamData) => void;
  onBack: () => void;
  extractedVitals?: any;
}

const physicalExamConfig = {
  general: {
    title: "General",
    items: ["Alert & Oriented x3", "Not in any acute distress", "well appearing"]
  },
  head: {
    title: "Head",
    items: ["Normocephalic", "atraumatic", "no lesions"]
  },
  eyes: {
    title: "Eyes",
    items: ["PERRLA", "EOM intact", "conjunctivae clear"]
  },
  ears: {
    title: "Ears",
    items: ["drainage", "lesions", "Hearing intact"]
  },
  nose: {
    title: "Nose",
    items: ["Mucosa normal", "obstruction", "epistaxis"]
  },
  throat: {
    title: "Throat",
    items: ["Clear", "exudates", "lesions"]
  },
  neck: {
    title: "Neck",
    items: ["Supple", "lymphadenopathy", "JVD", "masses"]
  },
  chest: {
    title: "Chest",
    items: ["Lungs clear to auscultation bilaterally", "rales", "rhonchi", "wheezes"]
  },
  heart: {
    title: "Heart",
    items: ["RR", "murmurs", "rubs", "gallops"]
  },
  abdomen: {
    title: "Abdomen",
    items: ["Soft", "Nontender", "masses", "BS normal"]
  },
  back: {
    title: "Back",
    items: ["Normal curvature", "tenderness"]
  },
  extremities: {
    title: "Extremities",
    items: ["full range of motion", "deformities", "edema", "erythema"]
  },
  neuro: {
    title: "Neuro",
    items: ["focal deficits", "Equal strength in all extremities"]
  },
  skin: {
    title: "Skin",
    items: ["Normal", "rashes", "lesions noted"]
  }
};

export const PhysicalExam = ({ onComplete, onBack, extractedVitals }: PhysicalExamProps) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    general: true,
    heart: true,
    chest: true
  });
  
  const [examData, setExamData] = useState<PhysicalExamData>(() => {
    const initialData: PhysicalExamData = {
      vitals: {
        weight: extractedVitals?.weight || "",
        bp: extractedVitals?.bp || "",
        pulse: extractedVitals?.pulse || "",
        rr: extractedVitals?.rr || "",
        o2sats: extractedVitals?.o2sats || ""
      },
      general: {},
      head: {},
      eyes: {},
      ears: {},
      nose: {},
      throat: {},
      neck: {},
      chest: {},
      heart: {},
      abdomen: {},
      back: {},
      extremities: {},
      neuro: {},
      skin: {}
    };
    
    Object.keys(physicalExamConfig).forEach(system => {
      physicalExamConfig[system as keyof typeof physicalExamConfig].items.forEach(item => {
        (initialData[system as keyof PhysicalExamData] as any)[item] = false;
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

  const handleVitalChange = (vital: keyof PhysicalExamData['vitals'], value: string) => {
    setExamData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [vital]: value
      }
    }));
  };

  const handleItemToggle = (system: keyof PhysicalExamData, item: string, checked: boolean) => {
    if (system === 'vitals') return;
    
    setExamData(prev => ({
      ...prev,
      [system]: {
        ...prev[system],
        [item]: checked
      }
    }));
  };

  const getPositiveCount = () => {
    let count = 0;
    Object.entries(examData).forEach(([key, systemData]) => {
      if (key !== 'vitals') {
        Object.values(systemData).forEach(value => {
          if (value) count++;
        });
      }
    });
    return count;
  };

  const handleComplete = () => {
    onComplete(examData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            Physical Examination Assessment
          </CardTitle>
          <CardDescription className="text-base">
            Complete the physical examination by entering vitals and marking Yes/No for each finding.
            Vitals are pre-populated from the latest values in the patient record.
          </CardDescription>
          <div className="flex items-center gap-4 pt-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {getPositiveCount()} positive findings
            </Badge>
            <Badge variant="outline">
              {Object.keys(physicalExamConfig).length + 1} sections
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Vitals Section */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg">Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium">Weight (lbs)</Label>
              <Input
                id="weight"
                value={examData.vitals.weight}
                onChange={(e) => handleVitalChange('weight', e.target.value)}
                placeholder="___"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bp" className="text-sm font-medium">BP</Label>
              <Input
                id="bp"
                value={examData.vitals.bp}
                onChange={(e) => handleVitalChange('bp', e.target.value)}
                placeholder="___/___"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pulse" className="text-sm font-medium">Pulse (bpm)</Label>
              <Input
                id="pulse"
                value={examData.vitals.pulse}
                onChange={(e) => handleVitalChange('pulse', e.target.value)}
                placeholder="___"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rr" className="text-sm font-medium">RR</Label>
              <Input
                id="rr"
                value={examData.vitals.rr}
                onChange={(e) => handleVitalChange('rr', e.target.value)}
                placeholder="___"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="o2sats" className="text-sm font-medium">O2 Sats</Label>
              <Input
                id="o2sats"
                value={examData.vitals.o2sats}
                onChange={(e) => handleVitalChange('o2sats', e.target.value)}
                placeholder="___"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Exam Systems */}
      <div className="grid gap-4">
        {Object.entries(physicalExamConfig).map(([systemKey, config]) => {
          const isOpen = openSections[systemKey];
          const systemData = examData[systemKey as keyof PhysicalExamData];
          const positiveItems = systemData && typeof systemData === 'object' ? Object.values(systemData).filter(Boolean).length : 0;
          
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
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {item}
                          </Label>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs text-muted-foreground font-medium">
                              {systemData && systemData[item] ? 'Yes' : 'No'}
                            </span>
                            <Switch
                              id={`${systemKey}-${index}`}
                              checked={systemData ? systemData[item] || false : false}
                              onCheckedChange={(checked) => handleItemToggle(systemKey as keyof PhysicalExamData, item, checked)}
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
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Physical exam complete</p>
                <p className="text-sm text-muted-foreground">
                  Physical examination data will be integrated into your clinical note
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Back to ROS
              </Button>
              <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
                Continue to Visits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};