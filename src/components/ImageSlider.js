// src/components/ImageSlider.jsx
import React, { useEffect, useState } from "react";

const images = [
  "/images/house1.jpg",
  "/images/house2.jpg",
  "/images/house3.jpg",
];

const ImageSlider = () => {
  const [index, setIndex] = useState(0);

  // ✅ FIX: vetëm një interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-2xl">
      <img
        src={images[index]}
        alt="Property"
        className="w-full h-full object-cover transition-all duration-700 ease-in-out"
      />
    </div>
  );
};

export default ImageSlider;