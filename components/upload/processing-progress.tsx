'use client';

import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadForm } from '@/components/upload-form';

export function ProcessingProgress() {
  const { t } = useTranslation();
  const { progress, isCancelling } = useUploadForm();

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/10 animate-fade-in shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('uploadForm.processingWineData')}</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{progress}%</span>
            {isCancelling && (
              <span className="text-xs text-red-500 animate-pulse">{t('uploadForm.cancelling')}</span>
            )}
          </div>
        </div>
        <Progress value={progress} className={`h-2 transition-all duration-300 ${isCancelling ? 'bg-red-100' : ''}`} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className={`size-4 animate-spin ${isCancelling ? 'text-red-500' : ''}`} />
        <p>
          {isCancelling 
            ? t('uploadForm.cancellingProcessing') 
            : progress < 100
              ? t('uploadForm.aisommelierAnalyzing')
              : t('uploadForm.processingComplete')}
        </p>
      </div>
    </div>
  );
} 