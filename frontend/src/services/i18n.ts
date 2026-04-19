import i18n from "i18next"
import ptBRTranslations from "../locales/pt-br.json"

import { initReactI18next } from "react-i18next"

const resources = {
  "pt-BR": {
    translation: ptBRTranslations
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt-BR",
    fallbackLng: "pt-BR",
    interpolation: {
      escapeValue: false
    }
  })

export default i18n