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
import listingFormDE from './locales/de/listingForm.json';
import mapDE from './locales/de/map.json';
import careersDE from './locales/de/careers.json';
import faqDE from './locales/de/faq.json';
import privacyDE from './locales/de/privacy.json';

import agentDE from './locales/de/agent.json';
import agentRatingDE from './locales/de/agentRating.json';
import apartmentDE from './locales/de/apartment.json';
import houseDE from './locales/de/house.json';
import officeDE from './locales/de/office.json';
import mortgageDE from './locales/de/mortgage.json';
import newConstructionDE from './locales/de/newConstruction.json';
import foreclosureDE from './locales/de/foreclosure.json';
import ownerDE from './locales/de/owner.json';
import bankPartnersDE from './locales/de/bankPartners.json';
import manageRentalsDE from './locales/de/manageRentals.json';
import newListingDE from './locales/de/newListing.json';
import bannerAdsDE from './locales/de/bannerAds.json';
import premiumListingDE from './locales/de/premiumListing.json';
import supportDE from './locales/de/support.json';
import howItWorksDE from './locales/de/howItWorks.json';
import userDashboardDE from './locales/de/userDashboard.json';
import listingDE from './locales/de/listing.json';
import listingDetailsDE from './locales/de/listingDetails.json';
import filterBarDE from './locales/de/filterBar.json';




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
import listingFormEN from './locales/en/listingForm.json';
import mapEN from './locales/en/map.json';
import careersEN from './locales/en/careers.json';
import faqEN from './locales/en/faq.json';
import privacyEN from './locales/en/privacy.json';

import agentEN from './locales/en/agent.json';
import agentRatingEN from './locales/en/agentRating.json';
import apartmentEN from './locales/en/apartment.json';
import houseEN from './locales/en/house.json';
import officeEN from './locales/en/office.json';
import mortgageEN from './locales/en/mortgage.json';
import newConstructionEN from './locales/en/newConstruction.json';
import foreclosureEN from './locales/en/foreclosure.json';
import ownerEN from './locales/en/owner.json';
import bankPartnersEN from './locales/en/bankPartners.json';
import manageRentalsEN from './locales/en/manageRentals.json';
import newListingEN from './locales/en/newListing.json';
import bannerAdsEN from './locales/en/bannerAds.json';
import premiumListingEN from './locales/en/premiumListing.json';
import supportEN from './locales/en/support.json';
import howItWorksEN from './locales/en/howItWorks.json';
import userDashboardEN from './locales/en/userDashboard.json';
import listingEN from './locales/en/listing.json';
import listingDetailsEN from './locales/en/listingDetails.json';
import filterBarEN from './locales/en/filterBar.json';






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
    privacy: privacyDE,
    
    agent: agentDE,
    agentRating: agentRatingDE,
    apartment: apartmentDE,
    house: houseDE,
    office: officeDE,
     mortgage: mortgageDE,
     newConstruction: newConstructionDE,
     foreclosure: foreclosureDE,
     owner: ownerDE,
     bankPartners: bankPartnersDE,
     manageRentals: manageRentalsDE,
     newListing: newListingDE,
     bannerAds: bannerAdsDE,
     premiumListing: premiumListingDE,
     support: supportDE,
     howItWorks: howItWorksDE,
     userDashboard: userDashboardDE,
      listingDetails: listingDetailsDE,
     filterBar: filterBarDE,
     listingForm: listingFormDE,
     
    
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
    privacy: privacyEN,
    
    agent: agentEN,
    agentRating: agentRatingEN,
    apartment: apartmentEN,
    house: houseEN,
    office: officeEN,
    mortgage: mortgageEN,
    newConstruction: newConstructionEN,
    foreclosure: foreclosureEN,
    owner: ownerEN,
    bankPartners: bankPartnersEN,
    manageRentals: manageRentalsEN,
    newListing: newListingEN,
    bannerAds: bannerAdsEN,
    premiumListing: premiumListingEN,
    support: supportEN,
    howItWorks: howItWorksEN,
    userDashboard: userDashboardEN,
    listingDetails: listingDetailsEN,
    filterBar: filterBarEN,
    listingForm: listingFormEN,
   
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'de',
    fallbackLng: 'en',
    ns: [
      'home', 'navbar', 'addListing', 'auth', 'favorites',
      'search', 'settings', 'admin', 'footer', 'contact', 'app',
      'breadcrumbs', 'comments', 'compare', 'filter', 'listing', 'map',
      'careers', 'faq', 'privacy','agent','agentRating','apartment','house','office','mortgage','newConstruction',
      'foreclosure','owner','bankPartners','manageRentals','newListing','bannerAds','premiumListing','dashboard','support', 'howItWorks','userDashboard',
      'listingDetails','filterBar','listingForm'
      

    ],
    defaultNS: 'home',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
