import { useState } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFormats = ".pdf,.docx,.pptx",
  maxSize = 10,
  label = "Upload File",
  description = "Drag and drop your file here, or click to browse"
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-softer"
            : "border-border hover:border-accent"
        }`}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-ink-400" />
            </div>
            <div>
              <p className="text-ink-600">{description}</p>
              <p className="text-sm text-ink-400 mt-1">
                Accepted formats: {acceptedFormats} (Max {maxSize}MB)
              </p>
            </div>
            <div>
              <input
                type="file"
                id="file-upload"
                accept={acceptedFormats}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-surface-muted rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex items-center gap-2">
                <File className="h-5 w-5 text-ink-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-ink-900">{selectedFile.name}</p>
                  <p className="text-xs text-ink-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
