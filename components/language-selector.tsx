'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
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
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const router = useRouter();

  // Handle hydration mismatch by only rendering on client
  useEffect(() => {
    setMounted(true);
    // Only set language after component is mounted to prevent hydration errors
    if (mounted) {
      const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];
      setCurrentLanguage(currentLang);
    }
  }, [i18n.language, mounted]);

  const changeLanguage = (langCode: string) => {
    // Change i18next language
    i18n.changeLanguage(langCode);
    
    // Set cookie for server-side detection
    document.cookie = `i18nextLng=${langCode};path=/;max-age=31536000`; // 1 year expiry
    
    // Update state
    const newLang = languages.find((lang) => lang.code === langCode);
    if (newLang) {
      setCurrentLanguage(newLang);
    }
    
    // Refresh the page to update server components
    router.refresh();
  };

  // Don't render anything during SSR or first render
  if (!mounted || !currentLanguage) return null;

  return (
    <div className="relative z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/90 hover:bg-white shadow-sm hover:shadow border-wine-100 hover:border-wine-300 transition-all duration-200 font-medium text-wine-800"
          >
            <Globe className="size-4 text-wine-500" />
            <span className="flex items-center gap-1">
              <span>{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
            </span>
            <ChevronDown className="size-3 text-wine-500 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="animate-slide-down bg-white/90 backdrop-blur-sm border-wine-100"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                currentLanguage.code === language.code
                  ? 'bg-wine-50 text-wine-800'
                  : 'hover:bg-wine-50/50'
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.nativeName}</span>
              {currentLanguage.code === language.code && (
                <Check className="ml-auto size-4 text-wine-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 