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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<PublicListings />} /> {/* Erweiterbar mit Filtern + interaktive Karte */}
        <Route path="/listing/:id" element={<ListingDetails />} /> {/* Anzeige von Galerie, Premium Badge, Datum */}
        <Route path="/edit/:id" element={<EditListingForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Geschützte Routen */}
        <Route path="/owner-dashboard" element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage /> {/* Anzeige von Galerie, Kommentaren, Kontaktoptionen */}
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
    </Router>
  );
}

export default App;
