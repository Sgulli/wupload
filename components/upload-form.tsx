'use client';

import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { parseCSV } from '@/lib/csv-utils';
import { processCSV, cancelProcess, getCSVPreview } from '@/app/actions';
import { identifyProtectedColumns } from '@/app/utils/protected-columns';
import { Globe, Info } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/components/ui/language-selector';

// Import our new components
import { FileUploader } from '@/components/upload/file-uploader';
import { FilePreview } from '@/components/upload/file-preview';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ProcessingProgress } from '@/components/upload/processing-progress';
import { ProcessingSummary } from '@/components/upload/processing-summary';
import { FormActions } from '@/components/upload/form-actions';
import { FormFooter } from '@/components/upload/form-footer';
import { FormHeader } from '@/components/upload/form-header';

// Types
export interface ProcessingSummary {
  totalRows: number;
  processedRows: number;
  totalFields: number;
  filledFields: number;
}

// Create context for form state
interface UploadFormContextType {
  // File state
  file: File | null;
  setFile: (file: File | null) => void;
  
  // Processing state
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  isCancelling: boolean;
  setIsCancelling: (isCancelling: boolean) => void;
  processingComplete: boolean;
  setProcessingComplete: (complete: boolean) => void;
  processId: string | null;
  setProcessId: (id: string | null) => void;
  
  // CSV data state
  csvLanguage: string;
  setCSVLanguage: (language: string) => void;
  previewData: { headers: string[]; rows: Record<string, string>[] } | null;
  setPreviewData: (data: { headers: string[]; rows: Record<string, string>[] } | null) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  protectedColumns: string[];
  setProtectedColumns: (columns: string[]) => void;
  totalRowCount: number;
  setTotalRowCount: (count: number) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // Summary state
  summary: ProcessingSummary | null;
  setSummary: (summary: ProcessingSummary | null) => void;
  
  // Refs
  inputFileRef: React.RefObject<HTMLInputElement>;
  progressIntervalRef: React.RefObject<NodeJS.Timeout | null>;
  
  // Actions
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  cancelProcessing: () => Promise<void>;
  togglePreview: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  loadPreview: () => Promise<void>;
  calculatePotentialFills: () => Promise<ProcessingSummary>;
  isFillableCell: (header: string, value: string) => boolean;
}

const UploadFormContext = createContext<UploadFormContextType | undefined>(undefined);

export const useUploadForm = () => {
  const context = useContext(UploadFormContext);
  if (!context) {
    throw new Error('useUploadForm must be used within an UploadFormProvider');
  }
  return context;
};

// Helper function to map language code to full language name
const mapLanguageCodeToName = (code: string): string => {
  const defaultLanguage = 'Italian';
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name ?? defaultLanguage;
};

export default function UploadForm() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [csvLanguage, setCSVLanguage] = useState<string>('Italian');
  const [previewData, setPreviewData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [protectedColumns, setProtectedColumns] = useState<string[]>([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [summary, setSummary] = useState<ProcessingSummary | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [totalRowCount, setTotalRowCount] = useState<number>(0);
  
  const inputFileRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset preview when file changes
    if (file) {
      loadPreview();
    } else {
      setPreviewData(null);
      setShowPreview(false);
    }
  }, [file]);

  // Load CSV preview data using server action
  const loadPreview = async () => {
    if (!file) return;
    
    try {
      setError(null);
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('csv', file);
      
      // Use our new server action to get preview data
      const result = await getCSVPreview(formData);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      // Update state with the preview data
      setPreviewData({
        headers: result.headers || [],
        rows: result.rows || []
      });
      
      // Set total row count
      setTotalRowCount(result.totalRows || 0);
      
      // Identify protected columns (since the API doesn't return them)
      setProtectedColumns(identifyProtectedColumns(result.headers || []));
      
    } catch (err) {
      console.error('Error loading CSV preview:', err);
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
    // Clear any progress intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Reset all state variables
    setFile(null);
    setError(null);
    setProgress(0);
    setPreviewData(null);
    setShowPreview(false);
    setProtectedColumns([]);
    setProcessingComplete(false);
    setSummary(null);
    setIsUploading(false);
    setIsCancelling(false);
    setProcessId(null);
    
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const togglePreview = () => {
    // Make sure we don't show the processing UI when toggling preview
    if (!isUploading) {
      setShowPreview(prev => !prev);
      
      // When showing preview, ensure we're not showing any processing indicators
      setProcessingComplete(false);
      setSummary(null);
      setProgress(0);
      
      // Don't trigger any API calls, just toggle the preview
    }
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
      const { headers, rows } = parseCSV(fileContent);
      
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
    
    // If we're in preview mode, don't process the CSV - just keep showing the preview
    if (showPreview) {
      return;
    }
    
    setError('');
    setProcessingComplete(false);
    setIsCancelling(false);
    setProcessId(null);
    setSummary(null);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // Calculate potential fills before processing
      const potentialSummary = await calculatePotentialFills();

      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('csv', file);
      formData.append('language', csvLanguage);

      const response = await processCSV(formData);
      setProcessId(response.processId ?? null);

      // Handle error or cancellation
      if (response.error) {
        if (response.error === 'cancelled') {
          setError(t('uploadForm.processingCancelled'));
          setIsCancelling(false);
        } else {
          setError(response.error);
        }
        setIsUploading(false);
        setProgress(0);
        return;
      }

      // Set progress to 100% and show completion
      setProgress(100);
      setProcessingComplete(true);
      setSummary(potentialSummary);

      // Only trigger download if not in preview mode
      if (response.csv && !showPreview) {
        const blob = new Blob([response.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enriched-${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Don't reset the form immediately so user can see the summary
      setIsUploading(false);
    } catch (err) {
      setError(t('uploadForm.processingError'));
      console.error(err);
      setIsUploading(false);
      setProgress(0);
    }
  };

  const cancelProcessing = async () => {
    if (processId) {
      setIsCancelling(true);
      try {
        await cancelProcess(processId);
      } catch (error) {
        console.error('Error cancelling process:', error);
      }
    } else {
      resetForm();
    }
  };

  // Handler for language change
  const handleLanguageChange = (langCode: string) => {
    setCSVLanguage(mapLanguageCodeToName(langCode));
  };

  // Create context value
  const contextValue: UploadFormContextType = {
    file,
    setFile,
    isUploading,
    setIsUploading,
    progress,
    setProgress,
    isCancelling,
    setIsCancelling,
    processingComplete,
    setProcessingComplete,
    processId,
    setProcessId,
    csvLanguage,
    setCSVLanguage,
    previewData,
    setPreviewData,
    showPreview,
    setShowPreview,
    protectedColumns,
    setProtectedColumns,
    totalRowCount,
    setTotalRowCount,
    error,
    setError,
    summary,
    setSummary,
    inputFileRef,
    progressIntervalRef,
    resetForm,
    handleSubmit,
    cancelProcessing,
    togglePreview,
    handleFileChange,
    handleDrop,
    handleDragOver,
    loadPreview,
    calculatePotentialFills,
    isFillableCell,
  };

  return (
    <UploadFormContext.Provider value={contextValue}>
      <TooltipProvider>
        <Card className="relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wine-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 animate-pulse-slow"></div>
          <CardContent className="pt-6">
            {/* Form header */}
            <FormHeader />
            
            {/* Form content */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* File uploader component */}
              <FileUploader />
              
              {/* File preview component (conditional) */}
              {showPreview && previewData && <FilePreview />}
              
              {/* Language selector section */}
              <div className="flex flex-col space-y-2 animate-fade-in-delay">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t('uploadForm.language')}</span>
                </div>
                <LanguageSelector 
                  defaultLang="it"
                  disabled={isUploading}
                  onChange={handleLanguageChange}
                  className="w-full"
                  triggerClassName="w-full"
                  affectsI18n={false}
                />
                <p className={`text-xs ${isUploading ? 'text-slate-400' : 'text-muted-foreground'} flex items-center gap-1.5`}>
                  <Info className="size-3" />
                  <span>{t('uploadForm.chooseLanguageDescription')}</span>
                </p>
              </div>
              
              {/* Processing progress (conditional) - Only show when actually uploading and not just previewing */}
              {isUploading && !showPreview && <ProcessingProgress />}
              
              {/* Processing summary (conditional) - Only show if processing is complete AND not just showing preview */}
              {processingComplete && summary && !showPreview && <ProcessingSummary />}
              
              {/* Form actions */}
              <FormActions />
            </form>
            
            {/* Form footer */}
            <FormFooter />
          </CardContent>
        </Card>
      </TooltipProvider>
    </UploadFormContext.Provider>
  );
}
