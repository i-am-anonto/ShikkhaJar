import React, { createContext, useContext, ReactNode } from "react";
import { translations, TranslationKey, Language } from "@/constants/translations";
import { useAuth } from "./AuthContext";

interface LanguageContextType {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const language = user?.language || "en";

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const setLanguage = (newLanguage: Language) => {
    if (user) {
      updateUser({ language: newLanguage });
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
