import { useState, useEffect } from 'react';

// Available languages
export type Language = 'english' | 'hindi' | 'tamil' | 'telugu' | 'kannada';

// Translation record type
export type TranslationRecord = Record<string, string>;

// Simplified translations
const translations: Record<Language, TranslationRecord> = {
  english: {
    "Dashboard": "Dashboard",
    "Crop Management": "Crop Management",
    "Irrigation": "Irrigation",
    "Loans & Subsidies": "Loans & Subsidies",
    "Market Connect": "Market Connect",
    "AI Assistant": "AI Assistant",
    "Farmer Dashboard": "Farmer Dashboard",
    "Welcome back!": "Welcome back!"
  },
  hindi: {
    "Dashboard": "डैशबोर्ड",
    "Crop Management": "फसल प्रबंधन",
    "Irrigation": "सिंचाई",
    "Loans & Subsidies": "ऋण और सब्सिडी",
    "Market Connect": "बाजार कनेक्ट",
    "AI Assistant": "AI सहायक",
    "Farmer Dashboard": "किसान डैशबोर्ड",
    "Welcome back!": "वापस स्वागत है!"
  },
  tamil: {
    "Dashboard": "டாஷ்போர்டு",
    "Crop Management": "பயிர் மேலாண்மை",
    "Irrigation": "பாசனம்",
    "Loans & Subsidies": "கடன்கள் & மானியங்கள்",
    "Market Connect": "சந்தை இணைப்பு",
    "AI Assistant": "AI உதவியாளர்",
    "Farmer Dashboard": "விவசாயி டாஷ்போர்டு",
    "Welcome back!": "மீண்டும் வரவேற்கிறோம்!"
  },
  telugu: {
    "Dashboard": "డాష్‌బోర్డ్",
    "Crop Management": "పంట నిర్వహణ",
    "Irrigation": "నీటి పారుదల",
    "Loans & Subsidies": "రుణాలు & సబ్సిడీలు",
    "Market Connect": "మార్కెట్ కనెక్ట్",
    "AI Assistant": "AI సహాయకుడు",
    "Farmer Dashboard": "రైతు డాష్‌బోర్డ్",
    "Welcome back!": "తిరిగి స్వాగతం!"
  },
  kannada: {
    "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Crop Management": "ಬೆಳೆ ನಿರ್ವಹಣೆ",
    "Irrigation": "ನೀರಾವರಿ",
    "Loans & Subsidies": "ಸಾಲಗಳು & ಸಬ್ಸಿಡಿಗಳು",
    "Market Connect": "ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ",
    "AI Assistant": "AI ಸಹಾಯಕ",
    "Farmer Dashboard": "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Welcome back!": "ಮರಳಿ ಸ್ವಾಗತ!"
  }
};

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('english');

  // Load language from localStorage if available on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    
    // Fallback to English if translation not found
    if (translations.english[key]) {
      return translations.english[key];
    }
    
    // Return the key itself if no translation exists
    return key;
  };

  return {
    language,
    setLanguage,
    t
  };
}

export default useLanguage;