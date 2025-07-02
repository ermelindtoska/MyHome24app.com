import React from "react";
import HeroSection from "../components/HomeSections/HeroSection";
import LatestListingsSection from "../components/HomeSections/LatestListingsSection";
import AgentsSection from "../components/HomeSections/AgentsSection";
import TestimonialsSection from "../components/HomeSections/TestimonialsSection";
import ContactSection from "../components/HomeSections/ContactSection";
import { Helmet } from "react-helmet";


const HomePage = () => {
return (
  <>
    <Helmet>
      <title>MyHome24App - Faqja Kryesore</title>
      <meta name="description" content="Platforma më e avancuar për blerjen, shitjen dhe qiradhënien e pronave në Gjermani." />
      <meta name="keywords" content="immobilien, real estate, germany, buy, rent, sell, myhome24app" />
      <meta property="og:title" content="MyHome24App" />
      <meta property="og:description" content="Gjej pronën e ëndrrave shpejt dhe lehtë." />
      <meta property="og:type" content="website" />
    </Helmet>

    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800">
      <HeroSection />
      <LatestListingsSection />
      <AgentsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  </>
);
};

export default HomePage;
