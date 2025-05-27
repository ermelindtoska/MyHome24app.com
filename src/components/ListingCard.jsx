import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const ListingCard = ({ listing }) => {
  return (
    <div className="relative border rounded-lg p-4 shadow hover:scale-105 transition bg-white">
      <Link to={`/listing/${listing.id}`}>
        <img
          src={listing.imageUrls?.[0] || '/placeholder.jpg'}
          alt={listing.title}
          className="w-full h-48 object-cover rounded"
        />
        <h2 className="text-xl font-semibold mt-2">{listing.title}</h2>
        <p className="text-gray-600">{listing.city}</p>
        <p className="text-blue-600 font-bold">{listing.price} €</p>
      </Link>
      <FavoriteButton listingId={listing.id} />
    </div>
  );
};

export default ListingCard;
