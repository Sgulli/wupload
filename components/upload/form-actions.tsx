'use client';

import { useTranslation } from 'react-i18next';
import { FileUp, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadForm } from '@/components/upload-form';

export function FormActions() {
  const { t } = useTranslation();
  const { 
    file, 
    isUploading, 
    progress, 
    processingComplete, 
    cancelProcessing, 
    isCancelling,
    showPreview
  } = useUploadForm();
  
  const showProcessingControls = isUploading && !showPreview;

  return (
    <div className="flex flex-col gap-2">
      {showProcessingControls && !processingComplete && (
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
          onClick={cancelProcessing}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t('uploadForm.cancelling')}</span>
            </>
          ) : (
            <>
              <XCircle className="size-4" />
              <span>{t('uploadForm.cancelProcessing')}</span>
            </>
          )}
        </Button>
      )}
      
      <Button
        type="submit"
        disabled={!file || showProcessingControls}
        className="w-full bg-wine-600 text-white hover:bg-wine-700 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:!cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-400 disabled:hover:bg-slate-300 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:hover:border-slate-400 relative after:content-none disabled:after:content-[''] disabled:after:absolute disabled:after:inset-0 disabled:after:bg-slate-300/30 disabled:after:backdrop-blur-[1px] disabled:after:rounded-md"
        aria-disabled={!file || showProcessingControls}
        aria-describedby={!file ? "submit-button-help" : undefined}
        style={{
          cursor: (!file || showProcessingControls) ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewport=\'0 0 100 100\' style=\'fill:black;font-size:24px;\'><text y=\'50%\'>🚫</text></svg>") 16 16, not-allowed' : 'pointer'
        }}
      >
        {showProcessingControls ? (
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>{progress < 100 ? t('uploadForm.processing') : t('uploadForm.done')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FileUp className={`size-4 ${!file ? 'opacity-60' : ''}`} />
            <span>{t('uploadForm.processWineData')}</span>
          </div>
        )}
      </Button>
      
      {/* Help text for disabled button */}
      {!file && (
        <div id="submit-button-help" className="mt-2 text-sm text-slate-500 flex items-center gap-2 p-2 bg-slate-100 rounded-md border border-slate-300">
          <AlertCircle className="size-4 text-slate-500" />
          <span>{t('uploadForm.selectFileToProcess')}</span>
        </div>
      )}
    </div>
  );
} 