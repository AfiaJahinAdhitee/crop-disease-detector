'use client'

// Side-effect import: ensures i18n is initialized before any useTranslation call
import '../i18n/config'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n/config'

export function LanguageProvider({ children }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
