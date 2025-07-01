import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const ListingCard = ({ listing }) => {
  return (
    <div className="listing-card p-4 rounded shadow mb-4">
      className="listing-card border rounded bg-white dark:bg-neutral-800 mb-3 shadow hover:shadow-lg cursor-pointer overflow-hidden"

      
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
