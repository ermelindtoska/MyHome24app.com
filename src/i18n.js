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

// === SQ Albanian
import homeSQ from './locales/sq/home.json';
import navbarSQ from './locales/sq/navbar.json';
import dashboardSQ from './locales/sq/dashboard.json';
import addListingSQ from './locales/sq/addListing.json';
import authSQ from './locales/sq/auth.json';
import favoritesSQ from './locales/sq/favorites.json';
import searchSQ from './locales/sq/search.json';
import settingsSQ from './locales/sq/settings.json';
import adminSQ from './locales/sq/admin.json';
import footerSQ from './locales/sq/footer.json';
import contactSQ from './locales/sq/contact.json';
import appSQ from './locales/sq/app.json';
import breadcrumbsSQ from './locales/sq/breadcrumbs.json';
import commentsSQ from './locales/sq/comments.json';
import compareSQ from './locales/sq/compare.json';
import filterSQ from './locales/sq/filter.json';
import listingSQ from './locales/sq/listing.json';
import mapSQ from './locales/sq/map.json';

// === RU Russian
import homeRU from './locales/ru/home.json';
import navbarRU from './locales/ru/navbar.json';
import dashboardRU from './locales/ru/dashboard.json';
import addListingRU from './locales/ru/addListing.json';
import authRU from './locales/ru/auth.json';
import favoritesRU from './locales/ru/favorites.json';
import searchRU from './locales/ru/search.json';
import settingsRU from './locales/ru/settings.json';
import adminRU from './locales/ru/admin.json';
import footerRU from './locales/ru/footer.json';
import contactRU from './locales/ru/contact.json';
import appRU from './locales/ru/app.json';
import breadcrumbsRU from './locales/ru/breadcrumbs.json';
import commentsRU from './locales/ru/comments.json';
import compareRU from './locales/ru/compare.json';
import filterRU from './locales/ru/filter.json';
import listingRU from './locales/ru/listing.json';
import mapRU from './locales/ru/map.json';

// === PL Polish
import homePL from './locales/pl/home.json';
import navbarPL from './locales/pl/navbar.json';
import dashboardPL from './locales/pl/dashboard.json';
import addListingPL from './locales/pl/addListing.json';
import authPL from './locales/pl/auth.json';
import favoritesPL from './locales/pl/favorites.json';
import searchPL from './locales/pl/search.json';
import settingsPL from './locales/pl/settings.json';
import adminPL from './locales/pl/admin.json';
import footerPL from './locales/pl/footer.json';
import contactPL from './locales/pl/contact.json';
import appPL from './locales/pl/app.json';
import breadcrumbsPL from './locales/pl/breadcrumbs.json';
import commentsPL from './locales/pl/comments.json';
import comparePL from './locales/pl/compare.json';
import filterPL from './locales/pl/filter.json';
import listingPL from './locales/pl/listing.json';
import mapPL from './locales/pl/map.json';

// === TR Turkish
import homeTR from './locales/tr/home.json';
import navbarTR from './locales/tr/navbar.json';
import dashboardTR from './locales/tr/dashboard.json';
import addListingTR from './locales/tr/addListing.json';
import authTR from './locales/tr/auth.json';
import favoritesTR from './locales/tr/favorites.json';
import searchTR from './locales/tr/search.json';
import settingsTR from './locales/tr/settings.json';
import adminTR from './locales/tr/admin.json';
import footerTR from './locales/tr/footer.json';
import contactTR from './locales/tr/contact.json';
import appTR from './locales/tr/app.json';
import breadcrumbsTR from './locales/tr/breadcrumbs.json';
import commentsTR from './locales/tr/comments.json';
import compareTR from './locales/tr/compare.json';
import filterTR from './locales/tr/filter.json';
import listingTR from './locales/tr/listing.json';
import mapTR from './locales/tr/map.json';

// === IT Italian
import homeIT from './locales/it/home.json';
import navbarIT from './locales/it/navbar.json';
import dashboardIT from './locales/it/dashboard.json';
import addListingIT from './locales/it/addListing.json';
import authIT from './locales/it/auth.json';
import favoritesIT from './locales/it/favorites.json';
import searchIT from './locales/it/search.json';
import settingsIT from './locales/it/settings.json';
import adminIT from './locales/it/admin.json';
import footerIT from './locales/it/footer.json';
import contactIT from './locales/it/contact.json';
import appIT from './locales/it/app.json';
import breadcrumbsIT from './locales/it/breadcrumbs.json';
import commentsIT from './locales/it/comments.json';
import compareIT from './locales/it/compare.json';
import filterIT from './locales/it/filter.json';
import listingIT from './locales/it/listing.json';
import mapIT from './locales/it/map.json';

// === ES Spanish
import homeES from './locales/es/home.json';
import navbarES from './locales/es/navbar.json';
import dashboardES from './locales/es/dashboard.json';
import addListingES from './locales/es/addListing.json';
import authES from './locales/es/auth.json';
import favoritesES from './locales/es/favorites.json';
import searchES from './locales/es/search.json';
import settingsES from './locales/es/settings.json';
import adminES from './locales/es/admin.json';
import footerES from './locales/es/footer.json';
import contactES from './locales/es/contact.json';
import appES from './locales/es/app.json';
import breadcrumbsES from './locales/es/breadcrumbs.json';
import commentsES from './locales/es/comments.json';
import compareES from './locales/es/compare.json';
import filterES from './locales/es/filter.json';
import listingES from './locales/es/listing.json';
import mapES from './locales/es/map.json';

// === FR French
import homeFR from './locales/fr/home.json';
import navbarFR from './locales/fr/navbar.json';
import dashboardFR from './locales/fr/dashboard.json';
import addListingFR from './locales/fr/addListing.json';
import authFR from './locales/fr/auth.json';
import favoritesFR from './locales/fr/favorites.json';
import searchFR from './locales/fr/search.json';
import settingsFR from './locales/fr/settings.json';
import adminFR from './locales/fr/admin.json';
import footerFR from './locales/fr/footer.json';
import contactFR from './locales/fr/contact.json';
import appFR from './locales/fr/app.json';
import breadcrumbsFR from './locales/fr/breadcrumbs.json';
import commentsFR from './locales/fr/comments.json';
import compareFR from './locales/fr/compare.json';
import filterFR from './locales/fr/filter.json';
import listingFR from './locales/fr/listing.json';
import mapFR from './locales/fr/map.json';

// === GR Greek
import homeGR from './locales/gr/home.json';
import navbarGR from './locales/gr/navbar.json';
import dashboardGR from './locales/gr/dashboard.json';
import addListingGR from './locales/gr/addListing.json';
import authGR from './locales/gr/auth.json';
import favoritesGR from './locales/gr/favorites.json';
import searchGR from './locales/gr/search.json';
import settingsGR from './locales/gr/settings.json';
import adminGR from './locales/gr/admin.json';
import footerGR from './locales/gr/footer.json';
import contactGR from './locales/gr/contact.json';
import appGR from './locales/gr/app.json';
import breadcrumbsGR from './locales/gr/breadcrumbs.json';
import commentsGR from './locales/gr/comments.json';
import compareGR from './locales/gr/compare.json';
import filterGR from './locales/gr/filter.json';
import listingGR from './locales/gr/listing.json';
import mapGR from './locales/gr/map.json';

// === NL Dutch
import homeNL from './locales/nl/home.json';
import navbarNL from './locales/nl/navbar.json';
import dashboardNL from './locales/nl/dashboard.json';
import addListingNL from './locales/nl/addListing.json';
import authNL from './locales/nl/auth.json';
import favoritesNL from './locales/nl/favorites.json';
import searchNL from './locales/nl/search.json';
import settingsNL from './locales/nl/settings.json';
import adminNL from './locales/nl/admin.json';
import footerNL from './locales/nl/footer.json';
import contactNL from './locales/nl/contact.json';
import appNL from './locales/nl/app.json';
import breadcrumbsNL from './locales/nl/breadcrumbs.json';
import commentsNL from './locales/nl/comments.json';
import compareNL from './locales/nl/compare.json';
import filterNL from './locales/nl/filter.json';
import listingNL from './locales/nl/listing.json';
import mapNL from './locales/nl/map.json';


const requireLocale = require.context('./locales', true, /\.json$/);

const languages = [
  'de', 'en', 'sq', 'ru', 'pl', 'tr', 'it', 'es', 'fr', 'gr', 'nl'
];

const namespaces = [
  'home', 'navbar', 'dashboard', 'addListing', 'auth', 'favorites',
  'search', 'settings', 'admin', 'footer', 'contact', 'app',
  'breadcrumbs', 'comments', 'compare', 'filter', 'listing', 'map'
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
  lng: 'de',
  fallbackLng: 'en',
  ns: namespaces,
  defaultNS: 'home',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
