import { useState } from "react";
import { Upload, File as FileIcon, X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string;
  maxSize?: number;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFormats = ".pdf,.docx,.pptx",
  maxSize = 10,
  label = "Файл оруулах",
  description = "Файлаа чирж тавих эсвэл дарж сонгоно уу",
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const removeFile = () => setSelectedFile(null);

  return (
    <div className="space-y-3">
      <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed rounded-md p-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-soft"
            : "border-border-strong hover:border-ink-900"
        }`}
      >
        {!selectedFile ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="h-10 w-10 text-ink-400" strokeWidth={1.4} />
            </div>
            <div>
              <p className="text-sm text-ink-700">{description}</p>
              <p className="text-xs text-ink-400 mt-1">
                Формат: {acceptedFormats} (дээд тал нь {maxSize}MB)
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
                Файл сонгох
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-surface-muted rounded-md border border-border text-left">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-dot-positive)] shrink-0" strokeWidth={1.6} />
              <FileIcon className="h-5 w-5 text-ink-500 shrink-0" strokeWidth={1.6} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900 tracking-tight truncate">{selectedFile.name}</p>
                <p className="text-xs text-ink-500 tabular-nums">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-4 w-4" strokeWidth={1.6} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
