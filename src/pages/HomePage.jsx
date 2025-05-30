// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';
import Slider from 'react-slick';
import CountUp from 'react-countup';
import ReactPlayer from 'react-player';
import {
  FaBuilding, FaHome, FaBriefcase, FaTree, FaSearch, FaQuoteLeft, FaHandshake, FaEnvelope,
  FaUserCircle, FaStar, FaLightbulb, FaMapMarkerAlt
} from 'react-icons/fa';
import ListingCard from '../components/ListingCard';
import { FaRocket } from 'react-icons/fa';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const { t } = useTranslation('home');
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
    { name: 'Anna M.', text: t('testimonial1') },
    { name: 'Max K.', text: t('testimonial2') },
    { name: 'Laura W.', text: t('testimonial3') },
  ];

  const categories = [
    { name: t('apartment'), icon: <FaBuilding />, link: '/category/apartment' },
    { name: t('house'), icon: <FaHome />, link: '/category/house' },
    { name: t('office'), icon: <FaBriefcase />, link: '/category/office' },
    { name: t('land'), icon: <FaTree />, link: '/category/land' },
  ];

  const locations = [
    t('popularArea1'),
    t('popularArea2'),
    t('popularArea3'),
    t('popularArea4')
  ];

  const handleSearch = () => {
    if (search.trim()) navigate(`/search?query=${encodeURIComponent(search.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-0 overflow-visible z-50 pointer-events-none">
        <div className="w-full h-0 animate-fireworks" />
      </div>
      <div className="absolute top-20 left-1/3 transform -translate-x-1/2 text-5xl text-yellow-500 font-extrabold tracking-wide z-40 drop-shadow-lg animate-bounce flex items-center gap-4">
        <FaRocket className="text-red-500" /> WELCOME TO MyHome24App!
      </div>
      <section className="bg-blue-50 py-20 px-4 animate-fade-in mt-56">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800">{t('specialTitle')}</h2>
          <div className="grid sm:grid-cols-3 gap-12">
            <Link to="/about" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-blue-200 cursor-pointer hover:bg-yellow-50 block">
              <FaLightbulb className="text-4xl text-yellow-500 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('specialInnovative')}</h4>
              <p className="text-gray-600">{t('specialInnovativeDesc')}</p>
            </Link>
            <Link to="/trust" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-blue-200 cursor-pointer hover:bg-green-50 block">
              <FaHandshake className="text-4xl text-green-500 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('specialTrusted')}</h4>
              <p className="text-gray-600">{t('specialTrustedDesc')}</p>
            </Link>
            <Link to="/growth" className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-blue-200 cursor-pointer hover:bg-red-50 block">
              <FaRocket className="text-4xl text-red-500 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('specialGrowing')}</h4>
              <p className="text-gray-600">{t('specialGrowingDesc', { count: '' })}<CountUp end={stats.users} duration={2} /></p>
            </Link>
          </div>
        </div>
      </section>
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
              words={[t('heroTitle'), t('heroTitle2'), t('heroTitle3')]}
              loop cursor cursorStyle="|" typeSpeed={80} deleteSpeed={40} delaySpeed={2000}
            />
          </h1>
          <p className="text-2xl md:text-3xl mb-8 drop-shadow-sm">{t('heroSubtitle')}</p>
          <Link to="/listings">
            <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full shadow hover:bg-gray-100 transition text-lg">
              {t('heroButton')}
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
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition duration-200 ease-in-out"
          />
          <button
            onClick={handleSearch}
            className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white rounded-full px-5 hover:bg-blue-700 transition"
          >
            {t('searchButton')}
          </button>
        </div>
      </div>
     
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
          <h3 className="text-4xl font-bold mb-6 text-blue-900">{t('videoTitle')}</h3>
          <p className="mb-6 text-lg text-gray-600">{t('videoSubtitle')}</p>
          <div className="aspect-w-16 aspect-h-9">
            <ReactPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" controls width="100%" height="360px" />
          </div>
        </div>
      </section>

      {/* PARALLAX SECTION */}
      <section className="relative h-96 bg-fixed bg-center bg-cover bg-no-repeat" style={{ backgroundImage: 'url(/images/parallax.jpg)' }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center">
          <h2 className="text-5xl text-white font-bold text-center px-4">{t('parallaxText')}</h2>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('howItWorksTitle')}</h3>
          <p className="text-lg text-gray-600 mb-12">{t('whyDesc')}</p>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaSearch className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('howStep1')}</h4>
              <p className="text-gray-600">{t('howStep1Text')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaLightbulb className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('howStep2')}</h4>
              <p className="text-gray-600">{t('howStep2Text')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-blue-200">
              <FaEnvelope className="text-4xl text-blue-600 mb-4 mx-auto" />
              <h4 className="text-xl font-semibold mb-2">{t('howStep3')}</h4>
              <p className="text-gray-600">{t('howStep3Text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR LOCATIONS */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-gray-800">{t('popularAreasTitle')}</h3>
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
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('testimonialsTitle')}</h3>
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
          <h3 className="text-3xl font-bold mb-4 text-gray-800">{t('contactTitle')}</h3>
          <p className="text-lg text-gray-700 mb-2">{t('contactText')}</p>
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
