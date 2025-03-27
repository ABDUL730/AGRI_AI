import { useLanguage, Language } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languageNames: Record<Language, string> = {
    english: "English",
    hindi: "हिन्दी (Hindi)",
    tamil: "தமிழ் (Tamil)",
    telugu: "తెలుగు (Telugu)",
    kannada: "ಕನ್ನಡ (Kannada)"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languageNames).map(([langCode, langName]) => (
          <DropdownMenuItem 
            key={langCode}
            onClick={() => setLanguage(langCode as Language)}
            className={language === langCode ? "bg-muted font-semibold" : ""}
          >
            {langName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}