import i18n from "i18next"
import ptBRTranslations from "../locales/pt-br.json"
import enUSTranslations from "../locales/en-us.json"

import { initReactI18next } from "react-i18next"

const resources = {
  "pt-BR": {
    translation: ptBRTranslations
  },
  "en-US": {
    translation: enUSTranslations
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt-BR",
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false
    }
  })

export default i18n