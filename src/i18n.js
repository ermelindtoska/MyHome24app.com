import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// === DE German
import homeDE from './locales/de/home.json';
import navbarDE from './locales/de/navbar.json';
import dashboardDE from './locales/de/dashboard.json';
import addListingDE from './locales/de/addListing.json';
import authDE from './locales/de/auth.json';
import favoritesDE from './locales/de/favorites.json';
import searchDE from './locales/de/search.json';
import settingsDE from './locales/de/settings.json';
import adminDE from './locales/de/admin.json';
import footerDE from './locales/de/footer.json';
import contactDE from './locales/de/contact.json';
import appDE from './locales/de/app.json';
import breadcrumbsDE from './locales/de/breadcrumbs.json';
import commentsDE from './locales/de/comments.json';
import compareDE from './locales/de/compare.json';
import filterDE from './locales/de/filter.json';
import listingDE from './locales/de/listing.json';
import mapDE from './locales/de/map.json';
import careersDE from './locales/de/careers.json';
import faqDE from './locales/de/faq.json';
import privacyDE from './locales/de/privacy.json';

// === EN English
import homeEN from './locales/en/home.json';
import privacyEN from './locales/en/privacy.json';
import faqEN from './locales/en/faq.json';
import careersEN from './locales/en/careers.json';
import navbarEN from './locales/en/navbar.json';
import dashboardEN from './locales/en/dashboard.json';
import addListingEN from './locales/en/addListing.json';
import authEN from './locales/en/auth.json';
import favoritesEN from './locales/en/favorites.json';
import searchEN from './locales/en/search.json';
import settingsEN from './locales/en/settings.json';
import adminEN from './locales/en/admin.json';
import footerEN from './locales/en/footer.json';
import contactEN from './locales/en/contact.json';
import appEN from './locales/en/app.json';
import breadcrumbsEN from './locales/en/breadcrumbs.json';
import commentsEN from './locales/en/comments.json';
import compareEN from './locales/en/compare.json';
import filterEN from './locales/en/filter.json';
import listingEN from './locales/en/listing.json';
import mapEN from './locales/en/map.json';
import blogPostDE from './locales/de/blogPost.json';
import blogPostEN from './locales/en/blogPost.json';



const requireLocale = require.context('./locales', true, /\.json$/);

const languages = [
  'de', 'en', 
];

const namespaces = [
  'home', 'navbar', 'dashboard', 'addListing', 'auth', 'favorites',
  'search', 'settings', 'admin', 'footer', 'contact', 'app',
  'breadcrumbs', 'comments', 'compare', 'filter', 'listing', 'map',
  'careers', 'faq', 'privacy', 'help' , 'blogPost'
];

const resources = {};

languages.forEach((lang) => {
  resources[lang] = {};
  namespaces.forEach((ns) => {
    const path = `./${lang}/${ns}.json`;
    if (requireLocale.keys().includes(path)) {
      resources[lang][ns] = requireLocale(path);
    } else {
      resources[lang][ns] = {};
      console.warn(`Missing translation for ${lang}/${ns}`);
    }
  });
});

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('i18nextLng') || 'de',
  fallbackLng: 'en',
  ns: namespaces,
  defaultNS: 'home',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
