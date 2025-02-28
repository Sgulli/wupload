'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileUp,
  Loader2,
  X,
  FileCheck,
  AlertCircle,
  Globe,
  Eye,
  EyeOff,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { processCSV } from '@/app/actions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseCSV } from '@/lib/csv-utils';

interface ProcessingSummary {
  totalRows: number;
  processedRows: number;
  totalFields: number;
  filledFields: number;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('Italian');
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [protectedColumns, setProtectedColumns] = useState<string[]>([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [summary, setSummary] = useState<ProcessingSummary | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset preview when file changes
    if (file) {
      loadPreview();
    } else {
      setPreviewData(null);
      setShowPreview(false);
    }
  }, [file]);

  const loadPreview = async () => {
    if (!file) return;
    
    try {
      const fileContent = await file.text();
      const { headers, rows } = parseCSV(fileContent);
      
      // Identify protected columns (same logic as in actions.ts)
      const protectedCols = headers.filter(
        (header) =>
          header.toLowerCase().includes('product thumbnail') ||
          header.toLowerCase().includes('product hs code') ||
          header.toLowerCase().includes('product prizes') ||
          header.toLowerCase().includes('handle') ||
          header.toLowerCase().includes('sku') ||
          header.toLowerCase().includes('barcode') ||
          header.toLowerCase().includes('inventory') ||
          header.toLowerCase().includes('price') ||
          header.toLowerCase().includes('sales channel') ||
          header.toLowerCase().includes('status') ||
          header.toLowerCase().includes('category') ||
          header.toLowerCase().includes('backorder') ||
          header.toLowerCase().includes('manage') ||
          header.toLowerCase().includes('weight') ||
          header.toLowerCase().includes('length') ||
          header.toLowerCase().includes('width') ||
          header.toLowerCase().includes('height') ||
          header.toLowerCase().includes('external') ||
          header.toLowerCase().includes('profile') ||
          header.toLowerCase().includes('discountable') ||
          header.toLowerCase().includes('seller') ||
          header.toLowerCase().includes('variant is') ||
          header.toLowerCase().includes('option') ||
          header.toLowerCase().includes('variant') ||
          header.toLowerCase().includes('id') ||
          header.toLowerCase().includes('url')
      );
      
      setProtectedColumns(protectedCols);
      
      // Only show first 5 rows for preview
      setPreviewData({
        headers,
        rows: rows.slice(0, 5)
      });
    } catch (err) {
      console.error('Error parsing CSV for preview:', err);
      setError('Could not preview the CSV file. Please check the file format.');
    }
  };

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
    setPreviewData(null);
    setShowPreview(false);
    setProtectedColumns([]);
    setProcessingComplete(false);
    setSummary(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const togglePreview = () => {
    setShowPreview(prev => !prev);
  };

  // Check if a cell is empty and can be filled by AI
  const isFillableCell = (header: string, value: string): boolean => {
    return !value && !protectedColumns.includes(header);
  };

  // Calculate how many fields would be filled by AI
  const calculatePotentialFills = async () => {
    if (!file) return { totalRows: 0, processedRows: 0, totalFields: 0, filledFields: 0 };
    
    try {
      const fileContent = await file.text();
      const { headers, rows } = await parseCSV(fileContent);
      
      let processedRows = 0;
      let filledFields = 0;
      const totalFields = rows.length * (headers.length - protectedColumns.length);
      
      rows.forEach(row => {
        let rowNeedsFilling = false;
        headers.forEach(header => {
          if (isFillableCell(header, row[header])) {
            filledFields++;
            rowNeedsFilling = true;
          }
        });
        
        if (rowNeedsFilling) {
          processedRows++;
        }
      });
      
      return {
        totalRows: rows.length,
        processedRows,
        totalFields,
        filledFields
      };
    } catch (err) {
      console.error('Error calculating potential fills:', err);
      return { totalRows: 0, processedRows: 0, totalFields: 0, filledFields: 0 };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setProcessingComplete(false);
      setSummary(null);

      // Calculate potential fills before processing
      const potentialSummary = await calculatePotentialFills();

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
      formData.append('language', language);

      const result = await processCSV(formData);

      // Set progress to 100% and show completion
      setProgress(100);
      setProcessingComplete(true);
      setSummary(potentialSummary);

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

      // Don't reset the form immediately so user can see the summary
        setIsUploading(false);
    } catch (err) {
      setError(
        'An error occurred while processing your file. Please try again.'
      );
      setIsUploading(false);
      setProgress(0);
      setProcessingComplete(false);
      setSummary(null);
      console.error(err);
    }
  };

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-wine-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 animate-pulse-slow"></div>
        <CardContent className="pt-6">
          <div className="mb-6 animate-slide-down">
            <h2 className="text-xl font-medium">Upload Wine CSV</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your CSV file to enrich it with AI-generated wine data
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out ${
                error
                  ? 'border-red-400/50 bg-red-50/50'
                  : file 
                    ? 'border-wine-200 bg-wine-50/50 animate-border-pulse' 
                    : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/5 hover:scale-[1.01] hover:shadow-sm'
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
                  className="flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="size-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-wine-50/50">
                    <Upload className="size-8 text-wine-600 transition-transform duration-300 group-hover:translate-y-[-2px]" />
                  </div>
                  <div className="mb-2 text-lg font-medium">
                    Choose a CSV file
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    or drag and drop it here
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-full transition-colors duration-300 group-hover:bg-muted/30">
                    <AlertCircle className="size-3" />
                    <span>Maximum file size: 10MB</span>
                  </div>
                </label>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-16 rounded-full bg-wine-100 flex items-center justify-center animate-bounce-subtle">
                      <FileCheck className="size-8 text-wine-600" />
                    </div>
                    <div className="flex items-center gap-2">
                    <span className="font-medium">{file.name}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                            className="size-6 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors duration-200"
                          onClick={resetForm}
                          aria-label="Remove file"
                          tabIndex={0}
                        >
                            <X className="size-4 transition-transform duration-200 hover:scale-110" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Remove file</TooltipContent>
                    </Tooltip>
                      {previewData && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="size-6 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors duration-200"
                              onClick={togglePreview}
                              aria-label={showPreview ? "Hide preview" : "Show preview"}
                              tabIndex={0}
                            >
                              {showPreview ? (
                                <EyeOff className="size-4 transition-transform duration-200 hover:scale-110" />
                              ) : (
                                <Eye className="size-4 transition-transform duration-200 hover:scale-110" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {showPreview ? "Hide preview" : "Show preview"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                    <span>{(file.size / 1024).toFixed(2)} KB</span>
                    <span>•</span>
                    <span>CSV</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm animate-shake">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="size-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {showPreview && previewData && (
              <div className="space-y-2 animate-slide-up">
                <div className="overflow-auto max-h-64 rounded-md border shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm p-2 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium">CSV Preview</h3>
                    <div className="text-xs text-muted-foreground">
                      Showing {previewData.rows.length} of {file ? "many" : "0"} rows
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 sticky top-10 z-10">
                      <tr>
                        {previewData.headers.slice(0, 10).map((header, index) => (
                          <th 
                            key={index} 
                            className={`p-2 text-left font-medium text-xs border-b ${
                              protectedColumns.includes(header) ? 'text-muted-foreground' : ''
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="truncate max-w-[150px]">{header}</span>
                              {!protectedColumns.includes(header) && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="size-3 text-wine-600 flex-shrink-0 animate-pulse-subtle" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">AI will fill empty cells in this column</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </th>
                        ))}
                        {previewData.headers.length > 10 && (
                          <th className="p-2 text-left font-medium text-xs border-b">
                            ...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b last:border-0 hover:bg-muted/10 transition-colors duration-150">
                          {previewData.headers.slice(0, 10).map((header, colIndex) => (
                            <td 
                              key={`${rowIndex}-${colIndex}`} 
                              className={`p-2 truncate max-w-[200px] transition-colors duration-200 ${
                                isFillableCell(header, row[header]) 
                                  ? 'bg-wine-50 text-wine-800 italic' 
                                  : ''
                              }`}
                            >
                              {row[header] || (isFillableCell(header, row[header]) ? 
                                <span className="flex items-center gap-1 text-wine-600">
                                  <span className="size-1.5 bg-wine-400 rounded-full animate-pulse"></span>
                                  <span>AI will fill</span>
                                </span> : "-")}
                            </td>
                          ))}
                          {previewData.headers.length > 10 && (
                            <td className="p-2">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                  <div className="w-3 h-3 bg-wine-50 rounded-sm border border-wine-200"></div>
                  <span>Cells highlighted in pink will be filled by AI</span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 animate-fade-in-delay">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Language</span>
              </div>
              <Select
                value={language}
                onValueChange={handleLanguageChange}
                disabled={isUploading}
              >
                <SelectTrigger className="w-full transition-all duration-200 hover:border-wine-200 focus:border-wine-300">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Italian" className="transition-colors duration-150 hover:bg-wine-50">
                    <div className="flex items-center gap-2">
                      <span>🇮🇹</span>
                      <span>Italian</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="English" className="transition-colors duration-150 hover:bg-wine-50">
                    <div className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="French" className="transition-colors duration-150 hover:bg-wine-50">
                    <div className="flex items-center gap-2">
                      <span>🇫🇷</span>
                      <span>French</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="German" className="transition-colors duration-150 hover:bg-wine-50">
                    <div className="flex items-center gap-2">
                      <span>🇩🇪</span>
                      <span>German</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Spanish" className="transition-colors duration-150 hover:bg-wine-50">
                    <div className="flex items-center gap-2">
                      <span>🇪🇸</span>
                      <span>Spanish</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the language for wine descriptions and data
              </p>
            </div>

            {isUploading && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/10 animate-fade-in shadow-sm">
              <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Processing wine data</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 transition-all duration-300" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <p>
                  {progress < 100
                      ? 'AI sommelier is analyzing your wine data...'
                      : 'Processing complete!'}
                  </p>
                </div>
              </div>
            )}

            {processingComplete && summary && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="size-8 rounded-full bg-green-100 flex items-center justify-center animate-bounce-subtle">
                      <CheckCircle className="size-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-green-800">Processing complete!</h3>
                    <div className="text-sm text-green-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Processed <strong>{summary.processedRows}</strong> of <strong>{summary.totalRows}</strong> rows</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Filled <strong>{summary.filledFields}</strong> empty fields with AI-generated data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Download has started automatically</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200"
                        onClick={resetForm}
                      >
                        Process another file
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!file || isUploading}
              className="w-full bg-wine-600 text-white hover:bg-wine-700 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{progress < 100 ? 'Processing...' : 'Done!'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileUp className="size-4" />
                  <span>Process Wine Data</span>
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground flex items-center justify-between animate-fade-in-delay">
            <div className="flex items-center gap-1">
              <Info className="size-3" />
              <span>Powered by Google Gemini AI</span>
            </div>
            <div>
              Supports CSV files up to 10MB
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
