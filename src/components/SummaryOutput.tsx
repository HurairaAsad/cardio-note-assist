
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

interface SummaryOutputProps {
  summary: string;
  onStartOver: () => void;
}

export const SummaryOutput = ({ summary, onStartOver }: SummaryOutputProps) => {
  const [editedSummary, setEditedSummary] = useState(summary);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      toast.success("Clinical note copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-note-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Clinical note downloaded");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated Clinical Note
          </CardTitle>
          <CardDescription>
            Review and edit the AI-generated clinical note. Make any necessary adjustments before using.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Generated clinical note will appear here..."
          />
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </Button>
            
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download as TXT
            </Button>
            
            <Button onClick={onStartOver} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-2">⚠️ Important Clinical Notice</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>This AI-generated note is a draft and requires clinical review</li>
              <li>Verify all medical information against source documents</li>
              <li>Ensure compliance with your institution's documentation standards</li>
              <li>Modify as needed to reflect accurate clinical assessment</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
