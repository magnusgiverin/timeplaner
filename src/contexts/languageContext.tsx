import React, { FC, ReactNode, createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: string;
  toggleLanguage: () => void;
}

const defaultValue: LanguageContextType = {
  language: "no",
  toggleLanguage: () => {
    console.log("Toggling language");
  },
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('no');

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === 'en' ? 'no' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
