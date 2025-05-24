import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterBar from './components/FilterBar';
import ListingCards from './components/ListingCards';
import AddListingForm from './components/AddListingForm';
import LoginRegister from './components/LoginRegister';
import UserDashboard from './pages/UserDashboard';
import HomePage from './pages/HomePage';

function App() {
  const { i18n } = useTranslation();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddListingForm />} />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
