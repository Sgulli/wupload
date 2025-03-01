'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Handle client-side i18n initialization and sync with server
  useEffect(() => {
    // Ensure we're only running this on the client side
    if (typeof window !== 'undefined') {
      // Try to get stored language preference
      const detectedLang = localStorage.getItem('i18nextLng') || getCookieValue('i18nextLng');
      const defaultLang = 'it';
      
      // Use detected language or default
      if (detectedLang && detectedLang !== i18n.language) {
        i18n.changeLanguage(detectedLang);
        // Set cookie to ensure server and client are in sync
        document.cookie = `i18nextLng=${detectedLang};path=/;max-age=31536000`;
      } else if (i18n.language !== defaultLang) {
        // If no stored preference, use default
        i18n.changeLanguage(defaultLang);
        document.cookie = `i18nextLng=${defaultLang};path=/;max-age=31536000`;
      }
      
      setInitialized(true);
    }
  }, []);

  // Helper function to get cookie value
  function getCookieValue(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // If i18n changes, refresh the page to update server components
  useEffect(() => {
    if (initialized) {
      const handleLanguageChanged = (lng: string) => {
        document.cookie = `i18nextLng=${lng};path=/;max-age=31536000`;
        router.refresh();
      };

      i18n.on('languageChanged', handleLanguageChanged);
      
      return () => {
        i18n.off('languageChanged', handleLanguageChanged);
      };
    }
  }, [initialized, router]);

  return (
    <div>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </div>
  );
} 