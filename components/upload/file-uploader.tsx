'use client';

import { Upload, FileCheck, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUploadForm } from '@/components/upload-form';

export function FileUploader() {
  const { t } = useTranslation();
  const {
    file,
    error,
    previewData,
    showPreview,
    isUploading,
    isCancelling,
    inputFileRef,
    handleFileChange,
    handleDrop,
    handleDragOver,
    togglePreview,
    cancelProcessing,
    resetForm,
  } = useUploadForm();

  return (
    <>
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
              {t('uploadForm.chooseFile')}
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {t('uploadForm.orDragDrop')}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded-full transition-colors duration-300 group-hover:bg-muted/30">
              <AlertCircle className="size-3" />
              <span>{t('uploadForm.maxFileSize')}</span>
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
                      onClick={isUploading ? cancelProcessing : resetForm}
                      aria-label={isUploading ? t('uploadForm.cancelProcessing') : t('uploadForm.removeFile')}
                      tabIndex={0}
                    >
                      <X className={`size-4 transition-transform duration-200 hover:scale-110 ${isCancelling ? 'text-red-500 animate-pulse' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isUploading ? t('uploadForm.cancelProcessing') : t('uploadForm.removeFile')}
                  </TooltipContent>
                </Tooltip>
                {previewData && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="size-6 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors duration-200"
                        onClick={togglePreview}
                        aria-label={showPreview ? t('uploadForm.hidePreview') : t('uploadForm.showPreview')}
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
                      {showPreview ? t('uploadForm.hidePreview') : t('uploadForm.showPreview')}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
              <span>{(file.size / 1024).toFixed(2)} KB</span>
              <span>•</span>
              <span>{t('uploadForm.csv')}</span>
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
              <h3 className="font-medium text-red-800">{t('uploadForm.error')}</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 