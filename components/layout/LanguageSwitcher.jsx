import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function LanguageSwitcher() {
  const { lang, setLang, LANGUAGES, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground hover:text-foreground">
          <Globe className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">{current.flag} {current.label}</span>
          <span className="text-sm sm:hidden">{current.flag}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">
          {t('select_language')}
        </p>
        <div className="space-y-0.5">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left
                ${lang === l.code ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'}`}
            >
              <span className="text-base w-5">{l.flag}</span>
              <span className="flex-1">{l.label}</span>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
