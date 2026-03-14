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
      satellite: 'Satellite',
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
      satellite: 'सैटेलाइट',
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
  },
  or: {
    nav: {
      dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
      insights: 'AI ଅନ୍ତର୍ଦୃଷ୍ଟି',
      history: 'ଇତିହାସ',
      login: 'ଲଗଇନ୍',
      signup: 'ସାଇନ୍ ଅପ୍',
      profile: 'ପ୍ରୋଫାଇଲ୍',
      satellite: 'ସାଟେଲାଇଟ୍',
      logout: 'ଲଗଆଉଟ୍'
    },
    dashboard: {
      title: 'AI ଫସଲ ଡ୍ୟାସବୋର୍ଡ',
      weather: 'ପରିବେଶ ପରିସ୍ଥିତି',
      soil: 'ମାଟି ବିଶ୍ଳେଷଣ',
      aiStatus: 'AI ସ୍ଥିତି',
      params: 'ପାରାମିଟରଗୁଡିକ',
      predictBtn: 'ପୂର୍ବାନୁମାନ କରନ୍ତୁ',
      analyzing: 'ବିଶ୍ଳେଷଣ ଚାଲିଛି...',
      yieldEst: 'ଆନୁମାନିକ ଅମଳ',
      irrigation: 'ଜଳସେଚନ',
      fertilizer: 'ସାର',
      pestRisk: 'କୀଟ ବିପଦ',
      avgYield: 'ଆଞ୍ଚଳିକ ହାରାହାରି'
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
