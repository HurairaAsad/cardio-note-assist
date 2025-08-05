import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, FileText, Zap, Brain } from "lucide-react";

interface ProcessingStatusProps {
  isProcessing: boolean;
  processingStage: string;
  progress: number;
  extractionMethod?: string;
  documentType?: string;
  ocrProgress?: number;
  ocrPage?: number;
  totalPages?: number;
}

export const ProcessingStatus = ({
  isProcessing,
  processingStage,
  progress,
  extractionMethod,
  documentType,
  ocrProgress,
  ocrPage,
  totalPages
}: ProcessingStatusProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    setAnimatedProgress(progress);
  }, [progress]);

  if (!isProcessing && progress === 0) return null;

  const getStageIcon = () => {
    switch (processingStage) {
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'ocr':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'ai-analysis':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStageDescription = () => {
    switch (processingStage) {
      case 'reading':
        return 'Reading document...';
      case 'ocr':
        return ocrPage && totalPages 
          ? `OCR processing page ${ocrPage} of ${totalPages}...`
          : 'OCR processing...';
      case 'ai-analysis':
        return 'AI analyzing medical content...';
      case 'complete':
        return 'Processing complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <Card className="w-full glass-effect soft-shadow rounded-2xl animate-scale-in">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStageIcon()}
              <span className="text-sm font-medium">{getStageDescription()}</span>
            </div>
            {processingStage === 'complete' && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Complete
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Progress value={animatedProgress} className="h-3 rounded-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(animatedProgress)}% complete</span>
              {extractionMethod && (
                <Badge variant="outline" className="text-xs">
                  {extractionMethod}
                </Badge>
              )}
            </div>
          </div>

          {processingStage === 'ocr' && ocrProgress !== undefined && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                OCR Progress: {Math.round(ocrProgress)}%
              </div>
              <Progress value={ocrProgress} className="h-2 rounded-full" />
            </div>
          )}

          {documentType && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Document Type:</span>
              <Badge variant="secondary" className="text-xs">
                {documentType.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};