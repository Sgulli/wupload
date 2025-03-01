import type React from 'react';
import type { Metadata } from 'next';
import { Roboto as FontSans, Young_Serif as FontSerif } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import I18nProvider from '@/components/i18n-provider';
import { getTranslations } from '@/lib/get-translations';
import { cookies } from 'next/headers';

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

// Dynamic metadata generation based on current locale
export async function generateMetadata(): Promise<Metadata> {
  // Read language preference from cookies
  const cookieStore = cookies();
  const langCookie = cookieStore.get('i18nextLng');
  const locale = langCookie?.value || 'it'; // Default to Italian if no cookie
  
  // Get translations for the detected locale
  const translations = getTranslations(locale);
  
  return {
    title: 'WUpload - ' + translations.common.title,
    description: translations.common.description,
    authors: [{ name: 'Sgulli' }],
    creator: 'Sgulli',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
