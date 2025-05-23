// src/pages/HomePage.jsx
import React, { useState } from 'react';
import NewNavbar from '../components/NewNavbar';
import HeroSection from '../components/HeroSection';
import MapBanner from '../components/MapBanner';

const HomePage = () => {
  const [filters, setFilters] = useState({ keyword: '', type: '', city: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching with filters:', filters);
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen">
      <NewNavbar />
      <HeroSection filters={filters} onChange={handleFilterChange} onSubmit={handleSearch} />
      <MapBanner />
    </div>
  );
};

export default HomePage;
