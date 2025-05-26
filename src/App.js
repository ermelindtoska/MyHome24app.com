// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddListingForm from './components/AddListingForm';
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
import Dashboard from './pages/Dashboard';
import AboutPage from './pages/AboutPage';

import { auth, db, storage } from './firebase-config';

function App() {
  const handleAddListing = async (form) => {
    if (!auth.currentUser) return;

    if (!form.image) {
      alert("Bitte wählen Sie ein Bild für die Anzeige aus.");
      return;
    }

    try {
      const imageRef = ref(storage, `images/${form.image.name}`);
      await uploadBytes(imageRef, form.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'listings'), {
        title: form.title,
        city: form.city,
        price: parseFloat(form.price),
        type: form.type,
        purpose: form.purpose,
        imageUrl,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert('Anzeige wurde erfolgreich hinzugefügt!');
    } catch (error) {
      console.error("Fehler beim Speichern der Anzeige:", error);
      alert("Beim Speichern ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<PublicListings />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
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
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AddListingForm />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard onAdd={handleAddListing} />
          </ProtectedRoute>
        } />
        <Route path="/user-dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
