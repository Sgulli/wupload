'use client';

import { useTranslation, Trans } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadForm } from '@/components/upload-form';

export function ProcessingSummary() {
  const { t } = useTranslation();
  const { summary, resetForm } = useUploadForm();

  if (!summary) return null;

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <div className="size-8 rounded-full bg-green-100 flex items-center justify-center animate-bounce-subtle">
            <CheckCircle className="size-5 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-green-800">{t('uploadForm.processingComplete')}</h3>
          <div className="text-sm text-green-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>
                <Trans
                  i18nKey="uploadForm.processedRows"
                  values={{ 
                    processedRows: summary.processedRows, 
                    totalRows: summary.totalRows 
                  }}
                  components={{
                    strong: <strong />
                  }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>
                <Trans
                  i18nKey="uploadForm.filledEmptyFields"
                  values={{ 
                    filledFields: summary.filledFields 
                  }}
                  components={{
                    strong: <strong />
                  }}
                />
              </span>
            </div>
          </div>
          <div className="pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 transition-colors duration-200"
              onClick={resetForm}
            >
              {t('uploadForm.processAnotherFile')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 