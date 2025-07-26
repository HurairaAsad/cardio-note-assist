
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  forceOCR?: boolean;
  onForceOCRChange?: (force: boolean) => void;
}

export const FileUpload = ({ onFileUpload, forceOCR = false, onForceOCRChange }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files[0]);
  }, []);

  const handleFileSelection = (file: File) => {
    if (!file) return;
    
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("File size must be less than 50MB");
      return;
    }
    
    setSelectedFile(file);
    toast.success("File uploaded successfully");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleContinue = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-effect soft-shadow rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Upload className="w-5 h-5 text-primary" />
            Upload Patient Document
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload a patient report, encounter note, or clinical document (PDF, DOCX, or TXT)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-out ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02] soft-shadow' 
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PDF, DOCX, and TXT files up to 50MB
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="cursor-pointer soft-hover rounded-xl"
                  onClick={triggerFileInput}
                  type="button"
                >
                  Select File
                </Button>
                {onForceOCRChange && (
                  <Button
                    variant={forceOCR ? "default" : "outline"}
                    size="sm"
                    onClick={() => onForceOCRChange(!forceOCR)}
                    className="flex items-center gap-1 soft-hover rounded-xl transition-all duration-300"
                  >
                    <Zap className="w-3 h-3" />
                    Force OCR
                  </Button>
                )}
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 p-4 bg-accent/10 rounded-2xl border border-accent/20 animate-scale-in soft-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {forceOCR && (
                    <Badge variant="secondary" className="flex items-center gap-1 rounded-xl">
                      <Zap className="w-3 h-3" />
                      OCR Mode
                    </Badge>
                  )}
                  <Button onClick={handleContinue} className="soft-hover rounded-xl">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-accent/5 glass-effect rounded-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-accent-foreground mt-0.5" />
            <div className="text-sm text-accent-foreground">
              <p className="font-medium mb-1">HIPAA Compliance Notice</p>
              <p>
                This tool processes patient information securely. Files are temporarily processed and not permanently stored. 
                Ensure you have proper authorization before uploading patient documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
