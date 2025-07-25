// src/App.jsx
import './i18n';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import OfficePage from './pages/OfficePage';
import LoginForm from './pages/LoginForm';
import ManageRentalsPage from './pages/ManageRentalsPage';
import RegisterPage from './pages/RegisterPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ForeclosurePage from './pages/ForeclosurePage';
import MortgageCalculatorPage from './pages/MortgageCalculatorPage';
import BankPartnersPage from './pages/BankPartnersPage';
import AgentSearchPage from './pages/AgentSearchPage';
import RateAgentPage from './pages/RateAgentPage';
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
import ImpressumPage from './pages/ImpressumPage';
import SearchResultsPage from './pages/SearchResultsPage';
import GermanyMapLeaflet from './components/GermanyMapLeaflet';
import GermanyMapReal from './pages/GermanyMapReal';
import { useTranslation } from 'react-i18next';
import ComparePage from './pages/ComparePage';
import CompareDetails from './pages/CompareDetails';
import PropertyDetails from './components/PropertyDetails/PropertyDetails';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import BuyMapPage from './pages/BuyMapPage';
import RentMapPage from './pages/RentMapPage';
import { RoleProvider } from './roles/RoleContext';
import RequireRole from './roles/RequireRole';
import AgentDashboard from './pages/AgentDashboard';
import PublishProperty from './publish/PublishProperty';
import AdminDashboard from './pages/AdminDashboard';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UnauthorizedPage from './pages/Unauthorized';






const MapWrapper = ({ purpose }) => (
  <GermanyMapReal purpose={purpose} key={purpose} />
);


function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
     <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/listing/:id" element={<PropertyDetails />} />
  <Route path="/edit/:id" element={<EditListingForm />} />
  <Route path="/register" element={<RegisterForm />} />
  <Route path="/login" element={<LoginForm />} />
  <Route path="/register-success" element={<RegisterSuccess />} />
  <Route path="/auth" element={<LoginRegister />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/rent/house" element={<HousePage />} />
  <Route path="/rent/apartment" element={<ApartmentPage />} />
  <Route path="/rent/office" element={<OfficePage />} />
  <Route path="/buy/owner" element={<OwnerPage />} />
  <Route path="/buy/foreclosures" element={<ForeclosurePage />} />
  <Route path="/new-construction" element={<NewConstructionPage />} />
  <Route path="/mortgage/calculator" element={<MortgageCalculatorPage />} />
  <Route path="/mortgage/partners" element={<BankPartnersPage />} />
  <Route path="/advertise/banner" element={<BannerAdsPage />} />
  <Route path="/advertise/premium" element={<PremiumListingPage />} />
  <Route path="/manage/add" element={<NewListing />} />
  <Route path="/manage/properties" element={<ManageRentalsPage />} />
  <Route path="/agents" element={<FindAgentPage />} />
  <Route path="/agent/search" element={<AgentSearchPage />} />
  <Route path="/agent/rate" element={<RateAgentPage />} />
  <Route path="/support" element={<SupportPage />} />
  <Route path="/how-it-works" element={<HowItWorksPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/privacy" element={<PrivacyPage />} />
  <Route path="/terms" element={<TermsPage />} />
  <Route path="/impressum" element={<ImpressumPage />} />
  <Route path="/create" element={<ListingCreatePage />} />
  <Route path="/careers" element={<CareersPage />} />
  <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
  <Route path="/add" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />
  <Route path="/search" element={<SearchResultsPage />} />
  <Route path="/listings" element={<ListingsPage />} />
  <Route path="/compare" element={<ComparePage />} />
  <Route path="/compare/details" element={<CompareDetails />} />
  <Route path="/map" element={<MapPage purpose="all" />} />
  <Route path="/buy" element={<MapPage purpose="buy" />} />
  <Route path="/rent" element={<MapPage purpose="rent" />} />
  <Route path="/buy/map" element={<MapPage purpose="buy" />} />
  <Route path="/rent/map" element={<MapPage purpose="rent" />} />
  <Route path="/map-leaflet" element={<GermanyMapLeaflet />} />
  <Route path="/explore" element={<ExplorePage />} />
  <Route path="/explore/germany" element={<ExplorePage />} />

  {/* ✅ DASHBOARDS ME ROLE SPECIFIKE */}
  <Route
    path="/owner-dashboard"
    element={
      <RequireRole allowedRoles={['owner', 'admin']}>
        <OwnerDashboard />
      </RequireRole>
    }
  />
  <Route
    path="/agent-dashboard"
    element={
      <RequireRole allowedRoles={['agent', 'admin']}>
        <AgentDashboard />
      </RequireRole>
    }
  />
  <Route
    path="/dashboard"
    element={
      <RequireRole allowedRoles={['user', 'admin']}>
        <UserDashboard />
      </RequireRole>
    }
  />
  <Route
    path="/admin-dashboard"
    element={
      <RequireRole allowedRoles={['admin']}>
        <AdminDashboard />
      </RequireRole>
    }
  />

  <Route path="/add-property" element={<PublishProperty />} />
  <Route path="/unauthorized" element={<UnauthorizedPage />} />



  
</Routes>

      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    
      <BrowserRouter>
         <AuthProvider>
            <RoleProvider>
         <AppRoutes />
         <ToastContainer />
    </RoleProvider>
  </AuthProvider>
</BrowserRouter>
    
  );
}
export default App;
