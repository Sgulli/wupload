'use client';

import { useTranslation } from 'react-i18next';

export function FormHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-6 animate-slide-down">
      <h2 className="text-xl font-medium">{t('uploadForm.title')}</h2>
      <p className="text-sm text-muted-foreground mt-1">
        {t('uploadForm.description')}
      </p>
    </div>
  );
} 