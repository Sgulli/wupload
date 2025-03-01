import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Default supported languages - can be extended
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export interface LanguageSelectorProps {
  languages?: Language[];
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  compact?: boolean;
  defaultLang?: string;
  onChange?: (language: string) => void;
  affectsI18n?: boolean;
}

export function LanguageSelector(props: LanguageSelectorProps) {
  return <LanguageSelectorComponent {...props} />;
}

export default function LanguageSelectorComponent({
  languages = SUPPORTED_LANGUAGES,
  className = '',
  triggerClassName = '',
  contentClassName = '',
  disabled = false,
  compact = false,
  defaultLang = 'it',
  onChange,
  affectsI18n = true,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  // Always start with the defaultLang to match server rendering
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLang);

  // Handle client-side initialization after mount
  useEffect(() => {
    setMounted(true);
    // Only update from i18n after mounting to prevent hydration errors
    if (affectsI18n && i18n.language && i18n.language !== currentLanguage) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language, currentLanguage, affectsI18n]);

  // Handle language change events
  const handleLanguageChange = (value: string) => {
    if (mounted) {
      setCurrentLanguage(value);
      
      // Only update i18n if this selector should affect global i18n state
      if (affectsI18n) {
        i18n.changeLanguage(value);
      }
      
      if (onChange) {
        onChange(value);
      }
    }
  };

  // Get current language object safely
  const getCurrentLanguage = (): Language => {
    return languages.find(lang => lang.code === currentLanguage) || 
           languages.find(lang => lang.code === defaultLang) || 
           languages[0];
  };

  // Always render a consistent structure for both server and client
  // but use a placeholder during server rendering
  const currentLang = getCurrentLanguage();

  return (
    <div className={`relative ${className}`}>
      <Select
        value={currentLanguage}
        onValueChange={handleLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`transition-all duration-200 hover:border-wine-200 focus:border-wine-300 disabled:opacity-50 disabled:!cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-300 disabled:hover:bg-slate-200 disabled:hover:border-slate-300 disabled:after:content-[''] disabled:after:absolute disabled:after:inset-0 disabled:after:bg-slate-200/30 disabled:after:backdrop-blur-[1px] disabled:after:rounded-md ${triggerClassName}`}
          aria-label={`Select language. Current language: ${currentLang.name}`}
          aria-disabled={disabled}
          style={disabled ? {
            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewport=\'0 0 100 100\' style=\'fill:black;font-size:24px;\'><text y=\'50%\'>🚫</text></svg>") 16 16, not-allowed'
          } : undefined}
        >
          <SelectValue>
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <Globe className={`${compact ? 'size-3' : 'size-4'} ${disabled ? 'text-slate-400' : 'text-wine-500'}`} />
              <span className={`flex items-center gap-1 ${disabled ? 'text-slate-500' : ''}`}>
                <span>{currentLang.flag}</span>
                {!compact && <span className="hidden sm:inline">{currentLang.nativeName}</span>}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className={`bg-white/90 backdrop-blur-sm border-wine-100 ${contentClassName}`}>
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="transition-colors duration-150 hover:bg-wine-50"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.nativeName}</span>
                {currentLanguage === language.code && (
                  <Check className="ml-auto size-4 text-wine-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 