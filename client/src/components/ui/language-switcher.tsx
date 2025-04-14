import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Language = {
  code: string;
  name: string;
  flag: string;
};

interface LanguageSwitcherProps {
  className?: string;
}

// Available languages
const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

/**
 * Language Switcher component with hreflang support for SEO
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [location] = useLocation();
  const [currentLang, setCurrentLang] = useState<Language>(LANGUAGES[0]);
  
  // Detect language from URL or browser settings on mount
  useEffect(() => {
    // Check for language code in URL path (e.g., /es/services)
    const pathLangMatch = location.match(/^\/([a-z]{2})(\/|$)/);
    if (pathLangMatch) {
      const langCode = pathLangMatch[1];
      const matchedLang = LANGUAGES.find(lang => lang.code === langCode);
      if (matchedLang) {
        setCurrentLang(matchedLang);
        return;
      }
    }
    
    // Use browser's preferred language as fallback
    const browserLang = navigator.language.split('-')[0];
    const matchedLang = LANGUAGES.find(lang => lang.code === browserLang);
    if (matchedLang) {
      setCurrentLang(matchedLang);
    }
  }, [location]);
  
  // Set hreflang links in the document head
  useEffect(() => {
    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    // Add new hreflang tags
    LANGUAGES.forEach(lang => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang.code;
      
      // If current page already has a language prefix, replace it
      // Otherwise, add the language prefix
      const currentPath = location.match(/^\/[a-z]{2}(\/.*|$)/)
        ? location.replace(/^\/[a-z]{2}/, `/${lang.code}`)
        : `/${lang.code}${location === '/' ? '' : location}`;
        
      link.href = `https://tsgfulfillment.com${currentPath}`;
      document.head.appendChild(link);
    });
    
    // Add x-default hreflang
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `https://tsgfulfillment.com${location.replace(/^\/[a-z]{2}/, '')}`;
    document.head.appendChild(defaultLink);
  }, [location, currentLang]);
  
  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    
    // Update URL to include language code
    // If we're already on a language path (/es/, /fr/), replace it
    // Otherwise, add the language code prefix
    const newPath = location.match(/^\/[a-z]{2}(\/.*|$)/)
      ? location.replace(/^\/[a-z]{2}/, `/${lang.code}`)
      : `/${lang.code}${location === '/' ? '' : location}`;
    
    window.location.href = newPath;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center text-sm font-medium ${className || ''}`}>
        <Globe className="h-4 w-4 mr-1" />
        <span className="mr-1">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {currentLang.code === lang.code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;