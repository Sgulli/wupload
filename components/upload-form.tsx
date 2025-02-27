'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import {
  Upload,
  FileUp,
  Loader2,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processCSV } from '@/app/actions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid CSV file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setProgress(0);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('csv', file);

      const result = await processCSV(formData);

      // Create and trigger download
      const blob = new Blob([result], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enriched-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        resetForm();
        setIsUploading(false);
      }, 1500);
    } catch (err) {
      setError(
        'An error occurred while processing your file. Please try again.'
      );
      setIsUploading(false);
      setProgress(0);
      console.error(err);
    }
  };

  return (
    <TooltipProvider>
      <Card className="relative">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                error
                  ? 'border-red-400/50'
                  : 'border-muted hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                ref={inputFileRef}
              />

              {!file ? (
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="mb-4 size-10 text-muted-foreground" />
                  <div className="mb-1 text-lg font-medium">
                    Choose a CSV file
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    or drag and drop it here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 10MB
                  </p>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <FileCheck className="size-6 text-wine-600" />
                    <span className="font-medium">{file.name}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="size-6"
                          onClick={resetForm}
                          aria-label="Remove file"
                          tabIndex={0}
                        >
                          <X className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Remove file</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {progress < 100
                    ? 'Processing your wine data...'
                    : 'Complete!'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-wine-600 text-white hover:bg-wine-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {progress < 100 ? 'Processing...' : 'Done!'}
                </>
              ) : (
                <>
                  <FileUp className="mr-2 size-4" />
                  Process Wine Data
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
