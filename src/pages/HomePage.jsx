// HomePage.jsx – përfshin komponentin GermanyMap në seksionin e hartës interaktive
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';
import Slider from 'react-slick';
import ReactPlayer from 'react-player';
import SearchBar from '../components/SearchBar/SearchBar';
import PropertyList from '../components/PropertyList/PropertyList';
import {
  FaQuoteLeft,
  FaStar,
  FaUserCircle,
  FaEnvelope
} from 'react-icons/fa';
import GermanyMap from '../components/GermanyMap';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const { t } = useTranslation('home');
  const { t: tMap } = useTranslation('map');
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
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

  const testimonials = [
    {
      name: "Anna Müller",
      text: "Fantastische Plattform! Ich habe mein Traumhaus in nur wenigen Tagen gefunden."
    },
    {
      name: "Paul Bauer",
      text: "Sehr benutzerfreundlich und zuverlässig. Ich kann es jedem empfehlen."
    },
    {
      name: "Sara Schmidt",
      text: "Die Suche war schnell, einfach und sehr hilfreich. Tolle Erfahrung!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-0 overflow-visible z-50 pointer-events-none">
        <div className="w-full h-0 animate-fireworks" />
      </div>

      {/* Hero Section with Search */}
      <section className="relative w-full h-[120vh] bg-cover bg-center flex flex-col justify-center items-center text-white text-center" style={{ backgroundImage: "url('/images/myhomehintergrund.png')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" />
        <div className="relative z-20 bg-black bg-opacity-60 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">{t('heroTitle')}</h1>
          <p className="text-xl md:text-2xl mb-8">{t('heroSubtitle')}</p>
          <SearchBar />
        </div>
      </section>

      <div>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"></div>
      </div>

      {/* Property List Section */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('latestListings')}</h2>
          {listings.length > 0 ? <PropertyList listings={listings} /> : <p className="text-center text-gray-500">{t('noListings')}</p>}
        </div>
      </section>

      {/* AGENTS SECTION */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-800">{t('agentsTitle') || 'Treffen Sie unsere Agent*innen'}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('agentsSubtitle') || 'Erfahrene Expert*innen, bereit Ihnen zu helfen.'}</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                <img src={`/images/agent${i}.jpg`} alt={`Agent ${i}`} className="w-full h-48 object-cover rounded-md mb-4" />
                <h4 className="text-xl font-semibold text-gray-800">Agent {i}</h4>
                <p className="text-sm text-gray-500">{t('agentsSpecialty') || 'Immobilienberater*in'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-blue-50 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('testimonialsTitle')}</h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <div key={index} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
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
        <div className="max-w-4xl mx-auto text-center border-4 border-blue-600 rounded-2xl p-8 shadow-lg">
          <FaEnvelope className="text-4xl text-blue-600 mb-4 mx-auto animate-pulse" />
          <h3 className="text-3xl font-bold mb-4 text-gray-800">{t('contactTitle')}</h3>
          <p className="text-lg text-gray-700 mb-2">{t('contactText')}</p>
          <a href="mailto:kontakt@myhome24app.com" className="text-blue-600 text-lg font-medium hover:underline">
            kontakt@myhome24app.com
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-200 py-10 text-center text-base text-gray-500">
        © {new Date().getFullYear()} MyHome24App. Alle Rechte vorbehalten.
        <Link to="/impressum" className="text-blue-600 hover:underline">
          Impressum
        </Link>
      </footer>
    </div>
  );
};

export default HomePage;
