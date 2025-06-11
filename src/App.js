// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddListingPage from './pages/AddListingPage';
import LoginRegister from './components/LoginRegister';

import RegisterForm from './pages/RegisterForm';
import ForgotPassword from './pages/ForgotPassword';
import RegisterSuccess from './pages/RegisterSuccess';
import PublicListings from './pages/PublicListings';

import FavoritesPage from './pages/FavoritesPage';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerDashboard from './pages/OwnerDashboard';
import AboutPage from './pages/AboutPage';
import EditListingForm from './components/EditListingForm';
import { useTranslation } from 'react-i18next';

import OfficePage from './pages/OfficePage';

import LoginPage from './pages/LoginPage';
import LoginForm from './pages/LoginForm';
import ManageRentalsPage from './pages/ManageRentalsPage';
import RegisterPage from './pages/RegisterPage';

import Footer from './components/Footer'; // ✅ Footer importuar
import CareersPage from './pages/CareersPage';

import ContactPage from './pages/ContactPage';


import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';


import ForeclosurePage from './pages/ForeclosurePage';


import MortgageCalculatorPage from './pages/MortgageCalculatorPage';


import BankPartnersPage from './pages/BankPartnersPage';


import AgentSearchPage from './pages/AgentSearchPage';
import RateAgentPage from './pages/RateAgentPage'; // ✅ saktë


import HousePage from './pages/HousePage';

import NewListing from './pages/NewListing';
import BannerAdsPage from './pages/BannerAdsPage';

import NewConstructionPage from './pages/NewConstructionPage';

import PremiumListingPage from './pages/PremiumListingPage';



import ListingCreatePage from './pages/ListingCreatePage';
import OwnerPage from './pages/OwnerPage';
import ApartmentPage from './pages/ApartmentPage';

import SupportPage from './pages/SupportPage';
import HowItWorksPage from './pages/HowItWorksPage';
import UserDashboard from './pages/UserDashboard';
import ListingsPage from './pages/ListingsPage';
import ListingDetails from './pages/ListingDetails';
import FilterControls from './components/FilterControls';
import BuyPage from './pages/BuyPage';
import RentPage from './pages/RentPage';
import MortgagePage from './pages/MortgagePage';
import FindAgentPage from './pages/FindAgentPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ImpressumPage from './pages/ImpressumPage';















function App() {
  const { t } = useTranslation('app');

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<PublicListings />} />
        <Route path="/listing/:id" element={<ListingDetails />} />

        <Route path="/edit/:id" element={<EditListingForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="/about" element={<AboutPage />} />
        
        <Route path="/rent/house" element={<HousePage />} />

        <Route path="/mortgage/calculator" element={<MortgageCalculatorPage />} />
        <Route path="/advertise/banner" element={<BannerAdsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />

        <Route path="/mortgage/partners" element={<BankPartnersPage />} />
        <Route path="/manage/properties" element={<ManageRentalsPage />} />

        <Route path="/rent/office" element={<OfficePage />} />

        
        <Route path="/careers" element={<CareersPage />} />

        <Route path="/contact" element={<ContactPage />} />
        
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        


        <Route path="/buy/foreclosures" element={<ForeclosurePage />} />
        <Route path="/create" element={<ListingCreatePage />} />

       <Route path="/new-construction" element={<NewConstructionPage />} />

        <Route path="/agent/search" element={<AgentSearchPage />} />
        <Route path="/agent/rate" element={<RateAgentPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/manage/add" element={<NewListing />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/rent/apartment" element={<ApartmentPage />} />

        <Route path="/advertise/premium" element={<PremiumListingPage />} />
        
        
        
        <Route path="/buy/owner" element={<OwnerPage />} />
        
        <Route path="/support" element={<SupportPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/rent" element={<RentPage />} />
        <Route path="/mortgage" element={<MortgagePage />} />
        <Route path="/agents" element={<FindAgentPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />








<Route path="/test-filterbar" element={
  <FilterControls
    filterCity=""
    setFilterCity={() => {}}
    filterType=""
    setFilterType={() => {}}
    filterPurpose=""
    setFilterPurpose={() => {}}
  />
} />


        
        





        {/* Protected routes */}
        <Route path="/owner-dashboard" element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AddListingPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
      </Routes>

      <Footer /> {/* ✅ Shtuar këtu, pas Routes por brenda Router */}
    </Router>
  );
}

export default App;
