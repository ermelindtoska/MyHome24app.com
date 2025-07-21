import React from 'react';

const ListingSidebar = ({ listings = [], onClickItem }) => {
  if (!Array.isArray(listings) || listings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No listings available.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
      {listings.map((item) => (
        <div
          key={item.id}
          onClick={() => onClickItem && onClickItem(item)}
          className="cursor-pointer bg-white dark:bg-gray-800 shadow-md p-4 rounded hover:shadow-lg transition-all"
        >
          <img
            src={item.image || '/assets/new-listing.png'}
            alt={item.title}
            className="w-full h-32 object-cover rounded mb-2"
          />
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {item.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {item.price} €
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingSidebar;
