// src/utils/compareUtils.js
export const filterListings = (listings, city, maxPrice, minRating) => {
  return listings.filter((item) => {
    const matchesCity = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
    const matchesPrice = maxPrice ? item.price <= parseFloat(maxPrice) : true;
    const matchesRating = minRating ? (parseFloat(item.avgRating) || 0) >= parseFloat(minRating) : true;
    return matchesCity && matchesPrice && matchesRating;
  });
};

export const formatPrice = (price) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);

export const getPriceColor = (price) =>
  price < 100000 ? 'text-green-600' : price < 300000 ? 'text-yellow-600' : 'text-red-600';

export const createCSVBlob = (listings) => {
  const headers = ['Titel', 'Ort', 'Preis (€)', 'Ø Bewertung'];
  const rows = listings.map((item) => [
    item.title,
    item.city,
    item.price,
    item.avgRating || '-',
  ]);
  const csvContent = [headers, ...rows].map((e) => e.join(';')).join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

export const createChartData = (listings) => {
  return listings.map((item) => ({
    name: item.title,
    Preis: item.price,
    Bewertung: parseFloat(item.avgRating) || 0,
  }));
};
