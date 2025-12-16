// src/App.jsx
import "./i18n";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ListingDetails from "./pages/ListingDetails";
import EditListingForm from "./components/EditListingForm";

import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import RegisterSuccess from "./pages/RegisterSuccess";
import ForgotPassword from "./pages/ForgotPassword";

import LoginRegister from "./components/LoginRegister";
import EmailActionGate from "./components/EmailActionGate";
import RoleRedirect from "./pages/RoleRedirect";
import VerifyNeeded from "./pages/VerifyNeeded";

import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ImpressumPage from "./pages/ImpressumPage";

import NewConstructionPage from "./pages/NewConstructionPage";
import ForeclosurePage from "./pages/ForeclosurePage";
import OwnerPage from "./pages/OwnerPage";

import ApartmentPage from "./pages/ApartmentPage";
import HousePage from "./pages/HousePage";
import OfficePage from "./pages/OfficePage";

import MortgagePage from "./pages/MortgagePage";
import MortgageCalculatorPage from "./pages/MortgageCalculatorPage";
import BankPartnersPage from "./pages/BankPartnersPage";
import MortgageRequestPage from "./pages/MortgageRequestPage";
import FinancePartnerPage from "./pages/FinancePartnerPage";

import BannerAdsPage from "./pages/BannerAdsPage";
import PremiumListingPage from "./pages/PremiumListingPage";

import SupportPage from "./pages/SupportPage";
import HowItWorksPage from "./pages/HowItWorksPage";

import FindAgentPage from "./pages/FindAgentPage";
import AgentSearchPage from "./pages/AgentSearchPage";
import RateAgentPage from "./pages/RateAgentPage";
import BecomeAgentPage from "./pages/BecomeAgentPage";

import FavoritesPage from "./pages/FavoritesPage";
import AddListingPage from "./pages/AddListingPage";
import ListingsPage from "./pages/ListingsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SearchPage from "./pages/SearchPage";

import ComparePage from "./pages/ComparePage";
import CompareDetails from "./pages/CompareDetails";

import MapPage from "./pages/MapPage";
import GermanyMapLeaflet from "./components/GermanyMapLeaflet";
import ExplorePage from "./pages/ExplorePage";

import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import OwnerDashboard from "./pages/OwnerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UnauthorizedPage from "./pages/Unauthorized";

import PublishProperty from "./publish/PublishProperty";
import OwnerContactInbox from "./roles/dashboard/OwnerContactInbox";
import FinancePartnerDashboard from "./pages/FinancePartnerDashboard";

import AgentProfilePage from "./pages/AgentProfilePage";
import AgentPublicProfilePage from "./pages/AgentPublicProfilePage";

// Guards / Providers
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./roles/RequireRole";
import RequireAdmin from "./roles/RequireAdmin";
import { AuthProvider } from "./context/AuthContext";
import { RoleProvider } from "./roles/RoleContext";
import { SearchStateProvider } from "./state/useSearchState";
import PathTracker from "./components/PathTracker";

// Toasts / SEO
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToasterProvider } from "./components/ui/toaster";
import { Toaster } from "sonner";
import GlobalMeta from "./components/SEO/GlobalMeta";

function AppRoutes() {
  // (nuk e përdorim, por e mbaj nëse më vonë do logjikë me pathname)
  useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <GlobalMeta />

      <main className="flex-grow pt-14 md:pt-0">
        <Routes>
          {/* Core */}
          <Route path="/" element={<HomePage />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/edit/:id" element={<EditListingForm />} />

          {/* Auth */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth" element={<LoginRegister />} />
          <Route path="/auth/action" element={<EmailActionGate />} />
          <Route path="/auth/redirect" element={<RoleRedirect />} />
          <Route path="/verify-needed" element={<VerifyNeeded />} />

          {/* Static */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />

          {/* Buy/Rent */}
          <Route path="/buy/owner" element={<OwnerPage />} />
          <Route path="/buy/foreclosures" element={<ForeclosurePage />} />
          <Route path="/new-construction" element={<NewConstructionPage />} />

          <Route path="/rent/apartment" element={<ApartmentPage />} />
          <Route path="/rent/house" element={<HousePage />} />
          <Route path="/rent/office" element={<OfficePage />} />

          {/* Mortgage */}
          <Route path="/mortgage" element={<MortgagePage />} />
          <Route path="/mortgage/calculator" element={<MortgageCalculatorPage />} />
          <Route path="/mortgage/partners" element={<BankPartnersPage />} />
          <Route path="/mortgage/request" element={<MortgageRequestPage />} />

          {/* Aliases / redirects */}
          <Route path="/hypothek" element={<Navigate to="/mortgage" replace />} />
          <Route path="/partner/finance" element={<FinancePartnerPage />} />
          <Route path="/mortgage/*" element={<Navigate to="/mortgage" replace />} />

          {/* Advertise */}
          <Route path="/advertise/banner" element={<BannerAdsPage />} />
          <Route path="/advertise/premium" element={<PremiumListingPage />} />

          {/* Agents */}
          <Route path="/agents" element={<FindAgentPage />} />
          <Route path="/agent/search" element={<AgentSearchPage />} />
          <Route path="/agent/rate" element={<RateAgentPage />} />
          <Route path="/agent/become" element={<BecomeAgentPage />} />

          <Route
            path="/agent/:agentId"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={["user", "owner", "agent", "admin"]}>
                  <AgentPublicProfilePage />
                </RequireRole>
              </ProtectedRoute>
            }
          />

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

          {/* Maps */}
          <Route path="/map" element={<MapPage key="all" purpose="all" />} />
          <Route path="/buy" element={<MapPage key="buy" purpose="buy" />} />
          <Route path="/rent" element={<MapPage key="rent" purpose="rent" />} />
          <Route path="/buy/map" element={<MapPage key="buy2" purpose="buy" />} />
          <Route path="/rent/map" element={<MapPage key="rent2" purpose="rent" />} />
          <Route path="/map-leaflet" element={<GermanyMapLeaflet />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/germany" element={<ExplorePage />} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Convenience redirects */}
          <Route path="/my-listings" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/meine-immobilien" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/ratgeber" element={<Navigate to="/how-it-works" replace />} />
          <Route path="/ratgeber/*" element={<Navigate to="/how-it-works" replace />} />

          <Route path="/owner" element={<Navigate to="/owner-dashboard" replace />} />
          <Route path="/agent" element={<Navigate to="/agent-dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />

          {/* Role-based dashboards */}
          <Route
            path="/owner-dashboard"
            element={
              <RequireRole allowedRoles={["owner", "admin"]}>
                <OwnerDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/owner/messages"
            element={
              <RequireRole allowedRoles={["owner", "agent"]}>
                <OwnerContactInbox />
              </RequireRole>
            }
          />

          <Route
            path="/dashboard/finance-partner"
            element={
              <RequireRole allowedRoles={["financePartner", "admin"]}>
                <FinancePartnerDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/agent-dashboard"
            element={
              <RequireRole allowedRoles={["agent", "admin"]}>
                <AgentDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireRole allowedRoles={["user", "owner", "agent", "admin"]}>
                <UserDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/agent/profile"
            element={
              <ProtectedRoute>
                <RequireRole allowedRoles={["agent"]}>
                  <AgentProfilePage />
                </RequireRole>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              </ProtectedRoute>
            }
          />

          <Route
            path="/publish"
            element={
              <RequireRole allowedRoles={["owner", "agent", "admin"]}>
                <PublishProperty />
              </RequireRole>
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* 404 */}
          <Route
            path="*"
            element={<div className="text-center text-gray-500">404 Not Found</div>}
          />
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
