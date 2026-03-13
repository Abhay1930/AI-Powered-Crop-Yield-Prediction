import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      insights: 'AI Insights',
      history: 'History',
      login: 'Login',
      signup: 'Signup',
      profile: 'Profile',
      logout: 'Logout'
    },
    dashboard: {
      title: 'AI Crop Dashboard',
      weather: 'Environmental Conditions',
      soil: 'Soil Analytics',
      aiStatus: 'AI Status',
      params: 'Parameters',
      predictBtn: 'Generate Prediction',
      analyzing: 'Analyzing...',
      yieldEst: 'Estimated Yield',
      irrigation: 'Irrigation',
      fertilizer: 'Fertilizer',
      pestRisk: 'Pest Risk',
      avgYield: 'Regional Avg'
    }
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      insights: 'एआई अंतर्दृष्टि',
      history: 'इतिहास',
      login: 'लॉगिन',
      signup: 'साइन अप',
      profile: 'प्रोफ़ाइल',
      logout: 'लॉग आउट'
    },
    dashboard: {
      title: 'एआई फसल डैशबोर्ड',
      weather: 'पर्यावरणीय स्थिति',
      soil: 'मिट्टी विश्लेषण',
      aiStatus: 'एआई स्थिति',
      params: 'पैरामीटर',
      predictBtn: 'पूर्वानुमान लगाएं',
      analyzing: 'विश्लेषण हो रहा है...',
      yieldEst: 'अनुमानित उपज',
      irrigation: 'सिंचाई',
      fertilizer: 'उर्वरक',
      pestRisk: 'कीट जोखिम',
      avgYield: 'क्षेत्रीय औसत'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
