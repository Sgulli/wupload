import { enTranslations, itTranslations } from '@/lib/translations';

// Type definition for our translations 
export interface Translations {
  common: {
    title: string;
    description: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
    howItWorksStep1Title: string;
    howItWorksStep1Description: string;
    howItWorksStep2Title: string;
    howItWorksStep2Description: string;
    howItWorksStep3Title: string;
    howItWorksStep3Description: string;
    howItWorksStep4Title: string;
    howItWorksStep4Description: string;
    howItWorksWarning: string;
    madeBy: string;
  };
}

export function getTranslations(locale: string = 'it'): Translations {
  // Return translations based on locale
  const translations = locale === 'en' ? enTranslations : itTranslations;
  
  // Return the translations directly from our data file
  return {
    common: {
      title: translations.common.title,
      description: translations.common.uploadDescription,
      howItWorksTitle: translations.common.howItWorksTitle,
      howItWorksDescription: translations.common.howItWorksDescription,
      howItWorksStep1Title: translations.common.howItWorksStep1Title,
      howItWorksStep1Description: translations.common.howItWorksStep1Description,
      howItWorksStep2Title: translations.common.howItWorksStep2Title, 
      howItWorksStep2Description: translations.common.howItWorksStep2Description,
      howItWorksStep3Title: translations.common.howItWorksStep3Title,
      howItWorksStep3Description: translations.common.howItWorksStep3Description,
      howItWorksStep4Title: translations.common.howItWorksStep4Title,
      howItWorksStep4Description: translations.common.howItWorksStep4Description,
      howItWorksWarning: translations.common.howItWorksWarning,
      madeBy: translations.common.madeBy,
    }
  };
} 