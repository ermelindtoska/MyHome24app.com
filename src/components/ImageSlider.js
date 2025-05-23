// src/components/ImageSlider.jsx
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ImageSlider = () => {
  return (
    <div className="max-w-4xl mx-auto mb-10">
      <Carousel
        showThumbs={false}
        infiniteLoop
        autoPlay
        interval={3000}
        showStatus={false}
        dynamicHeight={false}
        className="rounded-xl shadow-lg"
      >
        <div>
          <img src="/images/house1.jpg" alt="Haus 1" className="object-cover h-72 w-full" />
        </div>
        <div>
          <img src="/images/house2.jpg" alt="Haus 2" className="object-cover h-72 w-full" />
        </div>
        <div>
          <img src="/images/house3.jpg" alt="Haus 3" className="object-cover h-72 w-full" />
        </div>
      </Carousel>
    </div>
  );
};

export default ImageSlider;
