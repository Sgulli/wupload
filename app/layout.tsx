import type React from 'react';
import type { Metadata } from 'next';
import { Roboto as FontSans, Young_Serif as FontSerif } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import I18nProvider from '@/components/i18n-provider';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

const fontSerif = FontSerif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'WUpload - Wine Data Enrichment Tool',
  description:
    'Upload your wine CSV data and let our AI sommelier fill in the missing information',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontSerif.variable
        )}
      >
        <I18nProvider>
          <div className="relative min-h-screen">
            <main>
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
