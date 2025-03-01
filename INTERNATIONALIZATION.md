# Internationalization Implementation

## Overview

This project now supports internationalization (i18n) using the `i18next` library. The implementation includes:

- Support for English and Italian languages
- Language detection based on browser settings
- Language selection through a UI component
- Translation of all UI elements

## Components Created/Modified

1. **i18n Configuration**: `lib/i18n.ts`
   - Core configuration for i18next
   - English and Italian translations
   - Browser language detection

2. **I18nProvider**: `components/i18n-provider.tsx`
   - Client-side provider for i18next
   - Handles hydration issues with Next.js

3. **LanguageSelector**: `components/language-selector.tsx`
   - UI component for changing languages
   - Shows current language with flag
   - Fixed position in the top-right of the screen

4. **UI Components**: `components/ui/dropdown-menu.tsx`
   - Dropdown menu component used by the language selector

5. **Layout**: `app/layout.tsx`
   - Updated to include the I18nProvider and LanguageSelector

6. **UploadForm**: `components/upload-form.tsx`
   - All text content now uses the translation system

## Usage

### Adding New Translations

To add a new translation key:

1. Add the key to the `enTranslations` and `itTranslations` objects in `lib/i18n.ts`
2. Use the key in your components with the `t()` function: `t('section.key')`

Example:
```tsx
// In lib/i18n.ts
const enTranslations = {
  common: {
    newKey: 'New text in English',
  },
};

const itTranslations = {
  common: {
    newKey: 'Nuovo testo in Italiano',
  },
};

// In your component
const { t } = useTranslation();
return <div>{t('common.newKey')}</div>;
```

### Adding a New Language

To add support for a new language:

1. Add a new language object to the `languages` array in `components/language-selector.tsx`
2. Add translations in `lib/i18n.ts`
3. Update the resources in the i18n initialization

## Next Steps

1. **Testing**: Test the language switching functionality
2. **Review**: Review all translations for accuracy
3. **Maintenance**: Keep translations updated as new features are added
4. **Dynamic Content**: Consider implementing dynamic content loading for larger translation files

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/) 