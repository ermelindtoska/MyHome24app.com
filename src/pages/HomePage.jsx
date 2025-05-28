// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import {
  FaBuilding, FaHome, FaBriefcase, FaTree, FaSearch, FaQuoteLeft, FaHandshake
} from 'react-icons/fa';
import ListingCard from '../components/ListingCard';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Fehler beim Laden der Anzeigen:', err);
      }
    };
    fetchListings();
  }, []);

  const heroImages = [
    '/images/hero-1.jpg',
    '/images/hero-2.jpg',
    '/images/hero-3.jpg'
  ];

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    arrows: false,
    dots: false,
    fade: true
  };

  const categories = [
    { name: t('home.apartment'), icon: <FaBuilding />, link: '/category/apartment' },
    { name: t('home.house'), icon: <FaHome />, link: '/category/house' },
    { name: t('home.office'), icon: <FaBriefcase />, link: '/category/office' },
    { name: t('home.land'), icon: <FaTree />, link: '/category/land' },
  ];

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] overflow-hidden">
        <Slider {...sliderSettings}>
          {heroImages.map((img, idx) => (
            <div key={idx} className="w-full h-[90vh]">
              <img src={img} alt={`hero-${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </Slider>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-400/60 flex flex-col items-center justify-center text-white text-center px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-md animate-fade-in-delay">
            {t('home.heroTitle')}
          </h1>
          <p className="text-2xl md:text-3xl mb-8 drop-shadow-sm animate-fade-in-delay">
            {t('home.heroSubtitle')}
          </p>
          <Link to="/listings">
            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow hover:bg-gray-100 transition text-lg animate-fade-in-delay">
              {t('home.heroButton')}
            </button>
          </Link>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="max-w-3xl mx-auto mt-14 px-4 flex items-center gap-3 animate-fade-in">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('home.searchPlaceholder')}
          className="w-full border border-gray-300 rounded-full py-4 px-6 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
        <button onClick={handleSearch} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
          <FaSearch size={20} />
        </button>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-fade-in">
        <h2 className="text-4xl font-semibold mb-12 text-center text-gray-800">
          {t('home.categories')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {categories.map((cat, index) => (
            <Link to={cat.link} key={cat.name} className={`bg-white shadow-xl rounded-2xl p-10 text-center hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 duration-300 delay-${index * 100}`}>
              <div className="text-6xl mb-4 flex justify-center text-blue-600">{cat.icon}</div>
              <div className="font-semibold text-lg sm:text-xl text-gray-800">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST LISTINGS */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-fade-in">
        <h2 className="text-4xl font-semibold mb-12 text-center text-gray-800">
          {t('home.latest')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {listings.slice(0, 6).map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/listings">
            <button className="px-10 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-xl font-semibold">
              {t('home.viewAll')}
            </button>
          </Link>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-fade-in">
        <h2 className="text-4xl font-semibold mb-12 text-center text-gray-800">Empfohlene Inserate</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {listings.filter(listing => listing.isFeatured).map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-gray-800">Was unsere Nutzer sagen</h3>
          <Slider {...sliderSettings}>
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 text-center">
                <FaQuoteLeft className="text-3xl text-blue-600 mx-auto mb-4" />
                <p className="text-lg italic text-gray-700">„Fantastische Plattform! Ich habe mein neues Zuhause innerhalb einer Woche gefunden.“</p>
                <p className="mt-4 font-semibold text-blue-700">– Max Mustermann</p>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* CTA AGENTEN */}
      <section className="bg-blue-600 py-20 px-4 text-white text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <FaHandshake className="text-5xl mb-6 mx-auto" />
          <h3 className="text-4xl font-bold mb-4">Sind Sie Immobilienmakler?</h3>
          <p className="text-lg mb-8">Treten Sie unserer Plattform bei und präsentieren Sie Ihre Angebote einer großen Zielgruppe!</p>
          <Link to="/register">
            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow hover:bg-gray-100 transition text-lg">
              Jetzt registrieren
            </button>
          </Link>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-8 text-gray-800">{t('home.whyTitle')}</h3>
          <p className="text-gray-600 mb-12 text-xl">{t('home.whyDesc')}</p>
          <div className="grid sm:grid-cols-3 gap-12">
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why1')}</h4>
              <p className="text-base text-gray-600">{t('home.why1Desc')}</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why2')}</h4>
              <p className="text-base text-gray-600">{t('home.why2Desc')}</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why3')}</h4>
              <p className="text-base text-gray-600">{t('home.why3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-10 text-center text-base text-gray-500">
        © {new Date().getFullYear()} MyHome24App. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
};

export default HomePage;
