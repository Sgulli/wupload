'use client';

import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export function FormFooter() {
  const { t } = useTranslation();

  return (
    <div className="mt-6 pt-4 border-t text-xs text-muted-foreground flex items-center justify-between animate-fade-in-delay">
      <div className="flex items-center gap-1">
        <Info className="size-3" />
        <span>{t('uploadForm.poweredByGoogleGeminiAI')}</span>
      </div>
      <div>
        {t('uploadForm.supportsCSVFilesUpTo')}
      </div>
    </div>
  );
} 