// src/App.jsx
import './i18n';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
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
import ComparePage from './pages/ComparePage';
import CompareDetails from './pages/CompareDetails';
import PropertyDetails from './components/PropertyDetails/PropertyDetails';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import BuyMapPage from './pages/BuyMapPage';
import RentMapPage from './pages/RentMapPage';
import AgentDashboard from './pages/AgentDashboard';
import PublishProperty from './publish/PublishProperty';
import AdminDashboard from './pages/AdminDashboard';
import UnauthorizedPage from './pages/Unauthorized';
import EmailActionGate from './components/EmailActionGate';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import RoleRedirect from './pages/RoleRedirect';
import VerifyNeeded from './pages/VerifyNeeded';



// Providers
import { RoleProvider } from './roles/RoleContext';
import RequireRole from './roles/RequireRole';
import { AuthProvider } from './context/AuthContext'; // ✅ vetem kjo
import { SearchStateProvider } from "./state/useSearchState";
import PathTracker from './components/PathTracker';


// Toasts / SEO
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToasterProvider } from './components/ui/toaster';
import { Toaster } from 'sonner';
import GlobalMeta from './components/SEO/GlobalMeta';

const MapWrapper = ({ purpose }) => (
  <GermanyMapReal purpose={purpose} key={purpose} />
);

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <GlobalMeta />
      <main className="flex-grow pt-14 md:pt-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<PropertyDetails />} />
          <Route path="/edit/:id" element={<EditListingForm />} />

          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/auth" element={<LoginRegister />} />
          <Route path="/auth/action" element={<EmailActionGate />} />
          <Route path="/auth/redirect" element={<RoleRedirect />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/redirect" element={<RoleRedirect />} />
          <Route path="/verify-needed" element={<VerifyNeeded />} />



          {/* Rent/Buy */}
          <Route path="/rent/house" element={<HousePage />} />
          <Route path="/rent/apartment" element={<ApartmentPage />} />
          <Route path="/rent/office" element={<OfficePage />} />
          <Route path="/buy/owner" element={<OwnerPage />} />
          <Route path="/buy/foreclosures" element={<ForeclosurePage />} />
          <Route path="/new-construction" element={<NewConstructionPage />} />

           {/* Mortgage */}
            <Route path="/mortgage" element={<MortgagePage />} />
            <Route path="/mortgage/calculator" element={<MortgageCalculatorPage />} />
            <Route path="/mortgage/partners" element={<BankPartnersPage />} />
           {/* 🔁 Deutsche Alias-Weiterleitung, falls Mobile irgendwo /hypothek nutzt */}
           <Route path="/hypothek" element={<Navigate to="/mortgage" replace />} />

          {/* Advertise */}
          <Route path="/advertise/banner" element={<BannerAdsPage />} />
          <Route path="/advertise/premium" element={<PremiumListingPage />} />

          {/* Manage */}
          <Route path="/manage/add" element={<NewListing />} />
          <Route path="/manage/properties" element={<ManageRentalsPage />} />

          {/* Agents */}
          <Route path="/agents" element={<FindAgentPage />} />
          <Route path="/agent/search" element={<AgentSearchPage />} />
          <Route path="/agent/rate" element={<RateAgentPage />} />

          {/* Static */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/create" element={<ListingCreatePage />} />
          <Route path="/careers" element={<CareersPage />} />

          {/* User content */}
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />

          {/* Search / Listings */}
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/homes" element={<SearchPage />} />

          {/* Compare */}
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/compare/details" element={<CompareDetails />} />

          {/* Maps – mbaje vetëm NJË /map */}
         <Route path="/map"      element={<MapPage key="all"  purpose="all"  />} />
         <Route path="/buy"      element={<MapPage key="buy"  purpose="buy"  />} />
         <Route path="/rent"     element={<MapPage key="rent" purpose="rent" />} />
         <Route path="/buy/map"  element={<MapPage key="buy2"  purpose="buy"  />} />
         <Route path="/rent/map" element={<MapPage key="rent2" purpose="rent" />} />
          <Route path="/map-leaflet" element={<GermanyMapLeaflet />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/germany" element={<ExplorePage />} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
          <Route path="/my-listings" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/meine-immobilien" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/manage/properties" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/ratgeber" element={<Navigate to="/how-it-works" replace />} />
          <Route path="/ratgeber/*" element={<Navigate to="/how-it-works" replace />} />


          <Route path="/owner" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/agent" element={<Navigate to="/agent-dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />


          {/* Role-based dashboards */}
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
              <RequireRole allowedRoles={['user', 'owner', 'agent', 'admin']}>
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
          <Route
          path="/user-dashboard"
          element={
              <RequireRole allowedRoles={['user']}>
                  <UserDashboard />
                  </RequireRole>
            }
          />
          <Route
              path="/publish"
              element={
                <RequireRole allowedRoles={['owner','agent','admin']}>
                <PublishProperty />
                </RequireRole>
            }
          />


          <Route path="/add-property" element={<PublishProperty />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<div className="text-center text-gray-500">404 Not Found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <RoleProvider>
          <SearchStateProvider>
          <AppRoutes />
          <PathTracker />
          <ToastContainer />
          <ToasterProvider />
          <Toaster richColors />
          </SearchStateProvider>
        </RoleProvider>
      </AuthProvider>
    </Router>
  );
}
