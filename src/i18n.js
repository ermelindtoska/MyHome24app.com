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
import careersEN from './locales/en/careers.json';
import faqEN from './locales/en/faq.json';
import privacyEN from './locales/en/privacy.json';

const resources = {
  de: {
    home: homeDE,
    navbar: navbarDE,
    dashboard: dashboardDE,
    addListing: addListingDE,
    auth: authDE,
    favorites: favoritesDE,
    search: searchDE,
    settings: settingsDE,
    admin: adminDE,
    footer: footerDE,
    contact: contactDE,
    app: appDE,
    breadcrumbs: breadcrumbsDE,
    comments: commentsDE,
    compare: compareDE,
    filter: filterDE,
    listing: listingDE,
    map: mapDE,
    careers: careersDE,
    faq: faqDE,
    privacy: privacyDE
  },
  en: {
    home: homeEN,
    navbar: navbarEN,
    dashboard: dashboardEN,
    addListing: addListingEN,
    auth: authEN,
    favorites: favoritesEN,
    search: searchEN,
    settings: settingsEN,
    admin: adminEN,
    footer: footerEN,
    contact: contactEN,
    app: appEN,
    breadcrumbs: breadcrumbsEN,
    comments: commentsEN,
    compare: compareEN,
    filter: filterEN,
    listing: listingEN,
    map: mapEN,
    careers: careersEN,
    faq: faqEN,
    privacy: privacyEN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'de',
    fallbackLng: 'en',
    ns: [
      'home', 'navbar', 'dashboard', 'addListing', 'auth', 'favorites',
      'search', 'settings', 'admin', 'footer', 'contact', 'app',
      'breadcrumbs', 'comments', 'compare', 'filter', 'listing', 'map',
      'careers', 'faq', 'privacy'
    ],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
