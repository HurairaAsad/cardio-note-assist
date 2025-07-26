import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileText, Plus } from "lucide-react";

interface VisitData {
  visits: Array<{
    date: string;
    note: string;
  }>;
}

interface VisitsProps {
  onComplete: (data: VisitData) => void;
  onBack: () => void;
}

export const Visits = ({ onComplete, onBack }: VisitsProps) => {
  const [visits, setVisits] = useState<Array<{ date: string; note: string }>>([
    {
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      note: ""
    }
  ]);

  const handleVisitNoteChange = (index: number, note: string) => {
    setVisits(prev => prev.map((visit, i) => 
      i === index ? { ...visit, note } : visit
    ));
  };

  const addNewVisit = () => {
    setVisits(prev => [...prev, {
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
      }),
      note: ""
    }]);
  };

  const removeVisit = (index: number) => {
    if (visits.length > 1) {
      setVisits(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleComplete = () => {
    onComplete({ visits });
  };

  const getCompletedVisits = () => {
    return visits.filter(visit => visit.note.trim().length > 0).length;
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            Visits Documentation
          </CardTitle>
          <CardDescription className="text-base">
            Document visit notes for each encounter. These will be stored and a new visit write-up will be added for each follow-up visit.
          </CardDescription>
          <div className="flex items-center gap-4 pt-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {getCompletedVisits()} of {visits.length} visits documented
            </Badge>
            <Badge variant="outline">
              Free text documentation
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {visits.map((visit, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Visit {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    Date of Service: {visit.date}
                  </span>
                </div>
                {visits.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVisit(index)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor={`visit-${index}`} className="text-sm font-medium">
                  Visit Note (free text documentation)
                </Label>
                <Textarea
                  id={`visit-${index}`}
                  value={visit.note}
                  onChange={(e) => handleVisitNoteChange(index, e.target.value)}
                  placeholder="Enter a couple of sentences documenting this visit encounter..."
                  className="min-h-[120px] resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {visit.note.trim().length > 0 ? 'Visit documented' : 'Documentation pending'}
                  </span>
                  <span>
                    {visit.note.length} characters
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <Button 
              variant="ghost" 
              onClick={addNewVisit}
              className="w-full h-20 flex flex-col gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="w-6 h-6" />
              <span>Add Another Visit</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Ready to generate final note</p>
                <p className="text-sm text-muted-foreground">
                  Visit documentation will be included in your clinical note
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Back to Physical Exam
              </Button>
              <Button 
                onClick={handleComplete} 
                className="bg-primary hover:bg-primary/90"
                disabled={getCompletedVisits() === 0}
              >
                Generate Final Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};