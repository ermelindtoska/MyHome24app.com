import React, { useEffect, useState } from 'react';

const images = [
  '/images/house1.jpg',
  '/images/house2.jpg',
  '/images/house3.jpg',
];

const ImageSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="w-full max-h-[400px] overflow-hidden">
      <img src={images[index]} alt="Haus" className="w-full object-cover" />
    </div>
  );
};

export default ImageSlider;
