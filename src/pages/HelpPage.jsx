// src/pages/HelpPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { CheckCircle, AlertCircle } from 'lucide-react'; // ikonat nga lucide-react

const HelpPage = () => {
  const { t } = useTranslation('help');

  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.category || !form.message) {
      setError(t('form.error'));
      return;
    }

    console.log('Support message submitted:', form);

    // TODO: implement email API
    setSubmitted(true);
    setForm({ name: '', email: '', category: '', message: '' });
    setError('');
  };

  const categories = [
    { value: '', label: t('form.selectPlaceholder') },
    { value: 'technical', label: t('form.categories.technical') },
    { value: 'login', label: t('form.categories.login') },
    { value: 'listing', label: t('form.categories.listing') },
    { value: 'feedback', label: t('form.categories.feedback') },
    { value: 'other', label: t('form.categories.other') }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Helmet>
        <title>{t('meta.title')} – MyHome24app</title>
        <meta name="description" content={t('meta.description')} />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-blue-700">{t('title')}</h1>

      {/* Kontakt */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{t('support.title')}</h2>
        <p className="text-gray-700 mb-4">{t('support.text')}</p>

        {submitted ? (
          <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
            <CheckCircle className="w-6 h-6" />
            {t('support.confirmation')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            <input
              type="text"
              name="name"
              placeholder={t('form.name')}
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder={t('form.email')}
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <textarea
              name="message"
              placeholder={t('form.message')}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded h-32"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {t('form.submit')}
            </button>
          </form>
        )}
      </section>
      <section className="bg-white py-20 px-4 animate-fade-in">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-4xl font-bold mb-10 text-gray-800">{t('blogTitle')}</h2>
    <div className="grid sm:grid-cols-2 gap-8 text-left">
      {/* Blog 1 */}
      <div className="bg-gray-50 rounded-xl shadow hover:shadow-md transition overflow-hidden">
        <img
          src="/images/Blog1.png"
          alt="Përgatitje për projekt të ri në çift"
          className="w-full h-52 object-cover"
        />
        <div className="p-6">
          <h4 className="text-xl font-semibold text-blue-700 mb-2">{t('blogTitle1')}</h4>
          <p className="text-gray-600">{t('blogSummary1')}</p>
          <Link to="/blog" className="text-blue-600 hover:underline mt-2 block">
            {t('readMore')}
          </Link>
        </div>
      </div>

      {/* Blog 2 */}
      <div className="bg-gray-50 rounded-xl shadow hover:shadow-md transition overflow-hidden">
        <img
          src="/images/Blog2.png"
          alt="Pronarë duke dorëzuar çelësat"
          className="w-full h-52 object-cover"
        />
        <div className="p-6">
          <h4 className="text-xl font-semibold text-blue-700 mb-2">{t('blogTitle2')}</h4>
          <p className="text-gray-600">{t('blogSummary2')}</p>
          <Link to="/blog" className="text-blue-600 hover:underline mt-2 block">
            {t('readMore')}
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default HelpPage;
