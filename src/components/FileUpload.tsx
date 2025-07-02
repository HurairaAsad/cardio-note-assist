
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
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
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be less than 10MB");
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Patient Document
          </CardTitle>
          <CardDescription>
            Upload a patient report, encounter note, or clinical document (PDF, DOCX, or TXT)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Supports PDF, DOCX, and TXT files up to 10MB
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Select File
                </Button>
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700">
                  Continue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
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
