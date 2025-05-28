// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import { FaBuilding, FaHome, FaBriefcase, FaTree, FaSearch, FaChartBar, FaStar, FaMapMarkerAlt, FaThumbsUp, FaLock, FaMobileAlt } from 'react-icons/fa';
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
        console.error('Error loading listings:', err);
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
              <img
                src={img}
                alt={`hero-${idx}`}
                className="w-full h-full object-cover"
              />
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

      {/* WHY SECTION */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-8 text-gray-800">{t('home.whyTitle')}</h3>
          <p className="text-gray-600 mb-12 text-xl">{t('home.whyDesc')}</p>
          <div className="grid sm:grid-cols-3 gap-12">
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <FaThumbsUp className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why1')}</h4>
              <p className="text-base text-gray-600">{t('home.why1Desc')}</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <FaLock className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why2')}</h4>
              <p className="text-base text-gray-600">{t('home.why2Desc')}</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <FaMobileAlt className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{t('home.why3')}</h4>
              <p className="text-base text-gray-600">{t('home.why3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-blue-50 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <h3 className="text-4xl font-bold mb-12 text-gray-800">{t('home.statsTitle')}</h3>
          <div className="grid sm:grid-cols-3 gap-12">
            <div className="bg-white shadow-md rounded-xl p-6">
              <FaChartBar size={40} className="text-blue-600 mb-4 mx-auto" />
              <h4 className="text-3xl font-bold text-gray-800">{listings.length}+</h4>
              <p className="text-gray-500 mt-2">{t('home.activeListings')}</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6">
              <FaStar size={40} className="text-blue-600 mb-4 mx-auto" />
              <h4 className="text-3xl font-bold text-gray-800">4.9/5</h4>
              <p className="text-gray-500 mt-2">{t('home.averageRating')}</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6">
              <FaMapMarkerAlt size={40} className="text-blue-600 mb-4 mx-auto" />
              <h4 className="text-3xl font-bold text-gray-800">300+</h4>
              <p className="text-gray-500 mt-2">{t('home.cities')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 py-10 text-center text-base text-gray-500">
        © {new Date().getFullYear()} MyHome24App. {t('footer.rights')}
      </footer>
    </div>
  );
};

export default HomePage;
