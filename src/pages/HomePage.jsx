// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';
import Slider from 'react-slick';
import ReactPlayer from 'react-player';
import {
  FaBuilding, FaHome, FaBriefcase, FaTree, FaSearch, FaQuoteLeft, FaHandshake, FaEnvelope,
  FaUserCircle, FaStar, FaLightbulb, FaMapMarkerAlt
} from 'react-icons/fa';
import ListingCard from '../components/ListingCard';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ listings: 0, users: 0, featured: 0 });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const listingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(listingsData);
      } catch (err) {
        console.error('Fehler beim Laden der Anzeigen:', err);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const listingsSnap = await getCountFromServer(collection(db, 'listings'));
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const featuredCount = listings.filter(listing => listing.isFeatured).length;

        setStats({
          listings: listingsSnap.data().count,
          users: usersSnap.data().count,
          featured: featuredCount,
        });
      } catch (err) {
        console.error('Fehler beim Laden der Statistiken:', err);
      }
    };
    fetchStats();
  }, [listings]);

  const heroImages = ['/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg'];
  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    arrows: false,
    dots: false,
    fade: true,
  };

  const testimonials = [
    { name: 'Anna M.', text: t('home.testimonial1') },
    { name: 'Max K.', text: t('home.testimonial2') },
    { name: 'Laura W.', text: t('home.testimonial3') },
  ];
    const categories = [
    { name: t('home.apartment'), icon: <FaBuilding />, link: '/category/apartment' },
    { name: t('home.house'), icon: <FaHome />, link: '/category/house' },
    { name: t('home.office'), icon: <FaBriefcase />, link: '/category/office' },
    { name: t('home.land'), icon: <FaTree />, link: '/category/land' },
  ];

  const locations = [
    t('home.popularArea1'),
    t('home.popularArea2'),
    t('home.popularArea3'),
    t('home.popularArea4')
  ];

  const handleSearch = () => {
    if (search.trim()) navigate(`/search?query=${encodeURIComponent(search.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-400/60 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-md">
            <Typewriter
              words={[t('home.heroTitle'), t('home.heroTitle2'), t('home.heroTitle3')]}
              loop cursor cursorStyle="|" typeSpeed={80} deleteSpeed={40} delaySpeed={2000}
            />
          </h1>
          <p className="text-2xl md:text-3xl mb-8 drop-shadow-sm">{t('home.heroSubtitle')}</p>
          <Link to="/listings">
            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow hover:bg-gray-100 transition text-lg">
              {t('home.heroButton')}
            </button>
          </Link>
        </div>
      </section>
        {/* SEARCH BAR */}
      <div className="max-w-3xl mx-auto mt-14 px-4 animate-fade-in">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">
            <FaSearch size={18} />
          </span>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('home.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition duration-200 ease-in-out"
          />
          <button
            onClick={handleSearch}
            className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white rounded-full px-5 hover:bg-blue-700 transition"
          >
            {t('home.searchButton')}
          </button>
        </div>
      </div>
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
            {/* STATISTICS SECTION */}
      <section className="max-w-6xl mx-auto py-20 px-4 animate-fade-in">
        <h2 className="text-4xl font-semibold mb-12 text-center text-gray-800">
          {t('home.statsTitle')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-5xl font-bold text-blue-600">{stats.listings}</h3>
            <p className="mt-2 text-gray-700 text-lg">{t('home.statsListings')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-5xl font-bold text-green-600">{stats.users}</h3>
            <p className="mt-2 text-gray-700 text-lg">{t('home.statsUsers')}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-5xl font-bold text-yellow-600">{stats.featured}</h3>
            <p className="mt-2 text-gray-700 text-lg">{t('home.statsFeatured')}</p>
          </div>
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
          <h3 className="text-4xl font-bold mb-8 text-gray-800">Warum MyHome24App?</h3>
          <p className="text-gray-600 mb-12 text-xl">Wir helfen dir, dein perfektes Zuhause einfach zu finden.</p>
          <div className="grid sm:grid-cols-3 gap-12">
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">Große Auswahl</h4>
              <p className="text-base text-gray-600">Viele Immobilien aus ganz Deutschland.</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">Sicher & Schnell</h4>
              <p className="text-base text-gray-600">Vertrauenswürdige Anbieter und schnelle Suche.</p>
            </div>
            <div className="transition-transform duration-300 hover:scale-105 p-6 bg-gray-50 rounded-xl shadow-sm">
              <h4 className="font-semibold text-xl mb-3 text-blue-700">Benutzerfreundlich</h4>
              <p className="text-base text-gray-600">Einfaches und modernes Design für alle Geräte.</p>
            </div>
          </div>
        </div>
      </section>


      {/* VIDEO SECTION */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6 text-blue-900">{t('home.videoTitle')}</h3>
          <p className="mb-6 text-lg text-gray-600">{t('home.videoSubtitle')}</p>
          <div className="aspect-w-16 aspect-h-9">
            <ReactPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" controls width="100%" height="360px" />
          </div>
        </div>
      </section>

      {/* PARALLAX SECTION */}
      <section className="relative h-96 bg-fixed bg-center bg-cover bg-no-repeat" style={{ backgroundImage: 'url(/images/parallax.jpg)' }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center">
          <h2 className="text-5xl text-white font-bold text-center px-4">{t('home.parallaxText')}</h2>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('home.howItWorksTitle')}</h3>
          <p className="text-lg text-gray-600 mb-12">{t('home.whyDesc')}</p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaSearch className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('home.howStep1')}</h4>
              <p className="text-gray-600">{t('home.howStep1Text')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaLightbulb className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('home.howStep2')}</h4>
              <p className="text-gray-600">{t('home.howStep2Text')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaEnvelope className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('home.howStep3')}</h4>
              <p className="text-gray-600">{t('home.howStep3Text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR LOCATIONS */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-gray-800">{t('home.popularAreasTitle')}</h3>
          <div className="grid sm:grid-cols-4 gap-8">
            {locations.map((city, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition border border-blue-200">
                <FaMapMarkerAlt className="text-3xl text-blue-600 mb-2 mx-auto" />
                <p className="text-lg font-semibold text-gray-800">{city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-blue-50 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('home.testimonialsTitle')}</h3>
          <div className="grid sm:grid-cols-3 gap-10">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-white shadow-lg rounded-xl p-6 transition-transform duration-300 hover:scale-105 border border-blue-200">
                <FaQuoteLeft className="text-3xl text-blue-600 mb-4 mx-auto" />
                <p className="text-gray-700 italic mb-4">"{item.text}"</p>
                <div className="text-yellow-500 flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (<FaStar key={i} />))}
                </div>
                <div className="text-blue-800 font-semibold flex items-center justify-center gap-2">
                  <FaUserCircle /> <span>{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center border border-blue-200 rounded-xl p-10">
          <FaEnvelope className="text-4xl text-blue-600 mb-4 mx-auto" />
          <h3 className="text-3xl font-bold mb-4 text-gray-800">{t('home.contactTitle')}</h3>
          <p className="text-lg text-gray-700 mb-2">{t('home.contactText')}</p>
          <a href="mailto:kontakt@myhome24app.com" className="text-blue-600 text-lg font-medium hover:underline">
            kontakt@myhome24app.com
          </a>
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
