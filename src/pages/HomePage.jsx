// HomePage.jsx – përfshin komponentin GermanyMap në seksionin e hartës interaktive
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useTranslation } from 'react-i18next';
import { Typewriter } from 'react-simple-typewriter';
import Slider from 'react-slick';
import ReactPlayer from 'react-player';
import {
  FaBuilding, FaHome, FaBriefcase, FaRocket, FaMapMarkerAlt,
  FaSearch, FaLightbulb, FaEnvelope, FaQuoteLeft, FaStar, FaUserCircle
} from 'react-icons/fa';
import ListingCard from '../components/ListingCard';
import GermanyMap from '../components/GermanyMap';


import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HomePage = () => {
  const { t } = useTranslation('home');
  const { t: tMap } = useTranslation('map');
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

  const handleSearch = () => {
    if (search.trim()) navigate(`/search?query=${encodeURIComponent(search.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

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
    { name: t('newConstruction'), icon: <FaRocket />, link: '/new-construction' },
  ];

  const locations = [
    t('popularArea1'),
    t('popularArea2'),
    t('popularArea3'),
    t('popularArea4'),
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
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Finde dein perfektes Zuhause</h1>
          <p className="text-xl md:text-2xl mb-8">Einfache Suche. Zuverlässige Anbieter. Sichere Transaktionen.</p>
          <div className="max-w-xl mx-auto flex rounded-full overflow-hidden shadow-lg">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nach Stadt, Adresse oder PLZ suchen..." className="flex-grow px-6 py-4 text-black text-lg outline-none" />
            <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-4 text-lg font-semibold hover:bg-blue-700 transition">
              Suchen
            </button>
          </div>
        </div>
      </section>



    <div>
      {/* Layer blur e errët sipër fotos */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"></div>

      
            {/* INTERACTIVE MAP SECTION */}
<section className="bg-white py-20 px-4 animate-fade-in">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
      Interaktive Karte
    </h2>
    <Link to="/map" className="btn btn-primary mt-6">
  {t('map.exploreGermany')}
</Link>
    <GermanyMap />
  </div>
</section>


      {/* Përmbajtja qëndrore */}
      <div className="relative z-20 bg-black bg-opacity-60 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Finde dein perfektes Zuhause</h1>
        <p className="text-xl md:text-2xl mb-8">Einfache Suche. Zuverlässige Anbieter. Sichere Transaktionen.</p>
        <div className="max-w-xl mx-auto flex rounded-full overflow-hidden shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nach Stadt, Adresse oder PLZ suchen..."
            className="flex-grow px-6 py-4 text-black text-lg outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-4 text-lg font-semibold hover:bg-blue-700 transition"
          >
            Suchen
          </button>
        </div>
      </div>
    </div>



      {/* CATEGORIES SECTION */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800">{t('categories')}</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link} className="p-6 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col items-center gap-4">
                <div className="text-blue-600 text-4xl">{cat.icon}</div>
                <div className="text-lg font-semibold text-gray-700">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* AGENTS SECTION */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-800">{t('agentsTitle') || 'Treffen Sie unsere Agent*innen'}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('agentsSubtitle') || 'Erfahrene Expert*innen, bereit Ihnen zu helfen.'}</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* TODO: Replace with real agent data */}
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

     
      {/* PARTNERS SECTION */}
      <section className="bg-blue-50 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10 text-gray-800">{t('partnersTitle') || 'Unsere Partner'}</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4].map(i => (
              <img
                key={i}src={`/images/partner${i}.png`} alt={`Partner ${i}`}className="h-16 object-contain"
/>
            ))}
          </div>
        </div>
      </section>



      {/* CAREERS SECTION */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">{t('careersTitle') || 'Karriere bei MyHome24App'}</h2>
          <p className="text-gray-600 mb-8">{t('careersDesc') || 'Werden Sie Teil unseres Teams und gestalten Sie die Zukunft des Immobilienmarkts mit.'}</p>
          <Link to="/karriere" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition">
            {t('careersButton') || 'Jetzt bewerben'}
          </Link>
        </div>
      </section>

      
      {/* VIDEO SECTION */}
      <section className="bg-white py-20 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto text-center border-4 border-blue-600 rounded-2xl p-8 shadow-xl">
          <h3 className="text-4xl font-bold mb-6 text-blue-800 animate-bounce">{t('videoTitle')}</h3>
          <p className="mb-6 text-lg text-gray-600">{t('videoSubtitle')}</p>
          <div className="aspect-w-16 aspect-h-9">
            <ReactPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" controls width="100%" height="360px" />
          </div>
        </div>
      </section>

       {/* POPULAR LOCATIONS SECTION */}
      <section className="bg-gray-100 py-20 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-12 text-blue-900">{t('popularAreasTitle')}</h3>
          <div className="grid sm:grid-cols-4 gap-6">
            {locations.map((city, i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
                <FaMapMarkerAlt className="text-3xl text-blue-600 mb-2 mx-auto" />
                <p className="text-lg font-semibold text-gray-800">{city}</p>
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