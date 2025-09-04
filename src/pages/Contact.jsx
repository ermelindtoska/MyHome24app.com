import React, { useState } from 'react';
import SiteMeta from "../components/SEO/SiteMeta";

const Contact = () => {
  const { t } = useTranslation('contact');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const response = await fetch('https://formspree.io/f/mdkgrndd', {
      method: 'POST',
      body: data,
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      setStatus('Thank you! Your message has been sent.');
      form.reset();
    } else {
      setStatus('Oops! Something went wrong. Try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SiteMeta titleKey="contact.title" descKey="contact.desc" path="/contact" />
        <div>
          <label htmlFor="name" className="block font-semibold">Name</label>
          <input type="text" name="name" id="name" required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold">Email</label>
          <input type="email" name="email" id="email" required className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="message" className="block font-semibold">Message</label>
          <textarea name="message" id="message" required className="w-full border px-3 py-2 rounded h-32" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
        {status && <p className="mt-4 text-green-600">{status}</p>}
      </form>
    </div>
  );
};

export default Contact;
