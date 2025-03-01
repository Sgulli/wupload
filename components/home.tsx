'use client';

import { Grape } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import UploadForm from '@/components/upload-form';
import LanguageSelector from '@/components/language-selector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-wine-950/50">
      <header className="sticky top-0 z-50 border-b bg-background/50 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Grape className="size-6 text-wine-600" />
            <span className="font-serif text-xl">WUpload</span>
          </Link>
          
          <LanguageSelector />
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="font-serif text-3xl font-medium text-foreground md:text-4xl">
              {t('common.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('common.uploadDescription')}
            </p>
          </div>

          <UploadForm />

          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="font-serif">
                {t('common.howItWorksTitle')}
              </CardTitle>
              <CardDescription>
                {t('common.howItWorksDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {t('common.howItWorksStep1Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('common.howItWorksStep1Description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {t('common.howItWorksStep2Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('common.howItWorksStep2Description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {t('common.howItWorksStep3Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('common.howItWorksStep3Description')}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {t('common.howItWorksStep4Title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('common.howItWorksStep4Description')}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {t('common.howItWorksWarning')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-auto py-6">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            {t('common.madeBy')}
            <Link
              href="https://github.com/Sgulli"
              className="font-serif text-wine-600 transition-colors hover:text-wine-500"
              target='_blank'
            >
              Sgulli
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 