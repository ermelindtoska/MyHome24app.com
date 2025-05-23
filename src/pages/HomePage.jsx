import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import GermanyMap from '../components/GermanyMap';
import FilterBar from '../components/FilterBar';
import ListingModal from '../components/ListingModal';
import ListingDetailsModal from '../components/ListingDetailsModal';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('listings');
    if (saved) {
      setListings(JSON.parse(saved));
    }
  }, []);

  const handleAdd = (listing) => {
    const updated = [...listings, listing];
    setListings(updated);
    localStorage.setItem('listings', JSON.stringify(updated));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRegionSelect = (region) => {
    setFilters((prev) => ({ ...prev, city: region }));
  };

  const handleDelete = (indexToDelete) => {
    const updated = listings.filter((_, index) => index !== indexToDelete);
    setListings(updated);
    localStorage.setItem('listings', JSON.stringify(updated));
  };

  const getFilteredListings = () => {
    return listings.filter((item) => {
      if (filters.city && !item.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.maxPrice && Number(item.price) > Number(filters.maxPrice)) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.purpose && item.purpose !== filters.purpose) return false;
      return true;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <HeroBanner />
      <GermanyMap onSelect={handleRegionSelect} />
      <FilterBar onFilterChange={handleFilterChange} />
      <ListingModal onAdd={handleAdd} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {getFilteredListings().map((listing, index) => (
          <div
            key={index}
            className="border p-4 rounded shadow relative cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setSelectedListing(listing)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // mos hap modalin nëse klikojmë për fshirje
                handleDelete(index);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
            >
              🗑️
            </button>
            <h3 className="text-lg font-bold">{listing.title}</h3>
            <p>{listing.city}</p>
            <p>€{listing.price}</p>
            <p>{listing.type} - {listing.purpose}</p>
          </div>
        ))}
      </div>

      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
