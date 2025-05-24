import React, { useState } from 'react';
import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const AddListingForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('apartment');
  const [purpose, setPurpose] = useState('rent');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const imageRef = ref(storage, `listings/${uuidv4()}-${image.name}`);
        await uploadBytes(imageRef, image);
        return await getDownloadURL(imageRef);
      })
    );

    onSubmit({ title, city, price, type, purpose, imageUrls });

    setTitle('');
    setCity('');
    setPrice('');
    setImages([]);
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold">Anzeige hinzufügen</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titel"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Stadt"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Preis (€)"
        className="w-full p-2 border rounded"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded">
        <option value="apartment">Wohnung</option>
        <option value="house">Haus</option>
      </select>
      <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2 border rounded">
        <option value="rent">Zur Miete</option>
        <option value="buy">Zum Kauf</option>
      </select>
      <input type="file" multiple onChange={handleImageChange} className="w-full" />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {uploading ? 'Wird hochgeladen...' : 'Einreichen'}
      </button>
    </form>
  );
};

export default AddListingForm;
