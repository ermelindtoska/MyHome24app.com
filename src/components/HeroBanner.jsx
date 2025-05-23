import React, { useEffect, useState } from 'react';

const images = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80'
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[300px] md:h-[400px] overflow-hidden rounded shadow mb-4">
      <img
        src={images[current]}
        alt={`Banner ${current}`}
        className="w-full h-full object-cover transition-all duration-700 ease-in-out"
      />
    </div>
  );
};

export default HeroBanner;
