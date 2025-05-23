import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    },
    resources: {
      de: {
        translation: {
          welcome: "Willkommen bei MyHome24.de",
          description: "Finden Sie Immobilien zum Kauf oder zur Miete in ganz Deutschland.",
          formTitle: "Neue Anzeige erstellen",
          title: "Titel",
          descriptionField: "Beschreibung",
          type: "Typ",
          rent: "Zur Miete",
          sale: "Zum Verkauf",
          location: "Ort",
          price: "Preis (€)",
          submit: "Einreichen",
          listings: "Anzeigen",
          logout: "Abmelden",
          loggedInAs: "Angemeldet als",
          loginTitle: "Anmelden oder Registrieren",
          username: "Benutzername",
          continue: "Weiter",
          delete: "Löschen",
          time: "Erstellt",
          owner: "Besitzer",
          keyword: "Suchbegriff",
          city: "Stadt",
          search: "Suchen",
          category: "Kategorie",
          apartment: "Wohnung",
          house: "Haus",
          office: "Büro"
        }
      },
      en: {
        translation: {
          welcome: "Welcome to MyHome24.de",
          description: "Find houses for sale and rent in Germany.",
          formTitle: "Create a new listing",
          title: "Title",
          descriptionField: "Description",
          type: "Type",
          rent: "For Rent",
          sale: "For Sale",
          location: "Location",
          price: "Price (€)",
          submit: "Submit",
          listings: "Listings",
          logout: "Logout",
          loggedInAs: "Logged in as",
          loginTitle: "Login or Register",
          username: "Username",
          continue: "Continue",
          delete: "Delete",
          time: "Posted",
          owner: "Owner",
          keyword: "Search keyword",
          city: "City",
          search: "Search",
          category: "Category",
          apartment: "Apartment",
          house: "House",
          office: "Office"
        }
      }
    }
  });

export default i18n;
