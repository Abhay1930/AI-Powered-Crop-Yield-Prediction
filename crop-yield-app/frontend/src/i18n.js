import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { "Dashboard": "Dashboard", "Predicted Yield": "Predicted Yield" } },
  hi: { translation: { "Dashboard": "डैशबोर्ड", "Predicted Yield": "अनुमानित उत्पादन" } },
  or: { translation: { "Dashboard": "ଡ୍ୟାଶବୋର୍ଡ", "Predicted Yield": "ଅନୁମାନିତ ଉତ୍ପାଦନ" } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
