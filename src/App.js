import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginRegister from './components/LoginRegister';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<LoginRegister />} />
      </Routes>
    </Router>
  );
};

export default App;
