import '@geoapify/geocoder-autocomplete/styles/minimal.css';
import GeocoderAutocomplete from '@geoapify/geocoder-autocomplete';

useEffect(() => {
  const ac = new GeocoderAutocomplete(
    document.getElementById('autocomplete'),
    'YOUR_GEOAPIFY_API_KEY'
  );

  ac.on('select', (location) => {
    const { lat, lon } = location.properties;
    setMapCenter([lat, lon]);
    setZoom(14);
  });
}, []);
