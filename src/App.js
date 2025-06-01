// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddListingPage from './pages/AddListingPage';
import LoginRegister from './components/LoginRegister';
import UserDashboard from './pages/UserDashboard';
import RegisterForm from './pages/RegisterForm';
import LoginForm from './pages/LoginForm';
import RegisterSuccess from './pages/RegisterSuccess';
import PublicListings from './pages/PublicListings';
import ListingDetails from './pages/ListingDetails';
import FavoritesPage from './pages/FavoritesPage';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerDashboard from './pages/OwnerDashboard';
import AboutPage from './pages/AboutPage';
import EditListingForm from './components/EditListingForm';
import { useTranslation } from 'react-i18next';
import ApartmentPage from './pages/ApartmentPage';
import OfficePage from './pages/OfficePage';


import Footer from './components/Footer'; // ✅ Footer importuar
import CareerPage from './pages/CareerPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NewConstructionPage from './pages/NewConstructionPage';
import ForeclosurePage from './pages/ForeclosurePage';
import HousePage from './pages/HousePage';

import MortgageCalculatorPage from './pages/MortgageCalculatorPage';


import BankPartnersPage from './pages/BankPartnersPage';


import AgentSearchPage from './pages/AgentSearchPage';
import RateAgentPage from './pages/RateAgentPage';

import MyPropertiesPage from './pages/MyPropertiesPage';
import NewListingPage from './pages/NewListingPage';
import BannerAdvertisingPage from './pages/BannerAdvertisingPage';
import PremiumListingPage from './pages/PremiumListingPage';
import HelpFaqPage from './pages/HelpFaqPage';
import HelpSupportPage from './pages/HelpSupportPage';
import HelpHowItWorksPage from './pages/HelpHowItWorksPage';
import OwnerPage from './pages/OwnerPage';












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
        <Route path="/rent/apartment" element={<ApartmentPage />} />
        <Route path="/rent/house" element={<HousePage />} />
        <Route path="/mortgage/calculator" element={<MortgageCalculatorPage />} />
        
        <Route path="/mortgage/partners" element={<BankPartnersPage />} />

        <Route path="/rent/office" element={<OfficePage />} />

        <Route path="/career" element={<CareerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/buy/new" element={<NewConstructionPage />} />
        <Route path="/buy/foreclosures" element={<ForeclosurePage />} />
        

       
        <Route path="/agent/search" element={<AgentSearchPage />} />
        <Route path="/agent/rate" element={<RateAgentPage />} />

        <Route path="/manage/properties" element={<MyPropertiesPage />} />
        <Route path="/manage/add" element={<NewListingPage />} />
        <Route path="/advertise/banner" element={<BannerAdvertisingPage />} />
        <Route path="/advertise/premium" element={<PremiumListingPage />} />
        <Route path="/help/faq" element={<HelpFaqPage />} />
        <Route path="/help/support" element={<HelpSupportPage />} />
        <Route path="/help/how-it-works" element={<HelpHowItWorksPage />} />
        <Route path="/buy/owner" element={<OwnerPage />} />
        



        
        





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
