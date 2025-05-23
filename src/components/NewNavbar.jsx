// src/components/NewNavbar.jsx
import React from 'react';

const NewNavbar = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">MyHome24.de</h1>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-700 hover:text-blue-600">🏠 Shtepi</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">🏢 Ambjente</a>
          <a href="#" className="text-gray-700 hover:text-blue-600">🌍 Toka</a>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-sm border px-3 py-1 rounded hover:bg-gray-100">🇩🇪 Deutsch</button>
          <button className="text-sm border px-3 py-1 rounded hover:bg-gray-100">🇬🇧 English</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Regjistrohu dhe publiko falas
          </button>
        </div>
      </div>
    </header>
  );
};

export default NewNavbar;