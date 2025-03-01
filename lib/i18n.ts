'use client';  // Mark this file as client-only

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enTranslations, itTranslations } from './translations';

// Initialize i18next with imported translations
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      it: {
        translation: itTranslations
      }
    },
    fallbackLng: 'it',
    lng: 'it',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already does escaping
    },
    detection: {
      order: typeof window === 'undefined' ? [] : ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n; 