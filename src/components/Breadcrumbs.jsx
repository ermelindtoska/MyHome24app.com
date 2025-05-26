// src/components/Breadcrumbs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Settings, List } from 'lucide-react';

const Breadcrumbs = () => {
  return (
    <div className="text-sm text-gray-600 mb-4 flex items-center space-x-2">
      <Home size={16} className="mr-1" />
      <Link to="/" className="hover:underline">Home</Link>
      <span>/</span>
      <Settings size={16} className="mr-1" />
      <span className="text-gray-500">Admin</span>
      <span>/</span>
      <List size={16} className="mr-1" />
      <span className="text-blue-600 font-medium">Listings</span>
    </div>
  );
};

export default Breadcrumbs;
