import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon    from '../locales/en/common.json'
import enHome      from '../locales/en/home.json'
import enUpload    from '../locales/en/upload.json'
import enHistory   from '../locales/en/history.json'
import enDashboard from '../locales/en/dashboard.json'
import enAuth      from '../locales/en/auth.json'
import enAbout     from '../locales/en/about.json'

import bnCommon    from '../locales/bn/common.json'
import bnHome      from '../locales/bn/home.json'
import bnUpload    from '../locales/bn/upload.json'
import bnHistory   from '../locales/bn/history.json'
import bnDashboard from '../locales/bn/dashboard.json'
import bnAuth      from '../locales/bn/auth.json'
import bnAbout     from '../locales/bn/about.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          common:    enCommon,
          home:      enHome,
          upload:    enUpload,
          history:   enHistory,
          dashboard: enDashboard,
          auth:      enAuth,
          about:     enAbout,
        },
        bn: {
          common:    bnCommon,
          home:      bnHome,
          upload:    bnUpload,
          history:   bnHistory,
          dashboard: bnDashboard,
          auth:      bnAuth,
          about:     bnAbout,
        },
      },
      // Default to Bangla — target user base is rural Bangladesh farmers
      fallbackLng: 'bn',
      defaultNS: 'common',
      detection: {
        // Only check localStorage — browser language is ignored so Bangla is always the default
        order: ['localStorage'],
        lookupLocalStorage: 'leaflineLang',
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false, // avoids Suspense issues in App Router
      },
    })
}

export default i18n
