// src/pages/ContactPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ContactPage = () => {
  const { t } = useTranslation('contact');
  const { currentUser } = useAuth();
  const query = useQuery();

  // topic: p.sh. "neubau" nga /contact?topic=neubau
  const topic = query.get('topic') || 'general';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Kur ndryshon user ose topic, përditëso formën
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: currentUser?.displayName || prev.name || '',
      email: currentUser?.email || prev.email || '',
      subject:
        prev.subject ||
        t(`topics.${topic}.defaultSubject`, {
          defaultValue: t('form.defaultSubject'),
        }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, topic, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      await addDoc(collection(db, 'contacts'), {
        type: 'portal', // portal support, jo pronar
        topic,
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
        source: 'contactPage',
      });

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        subject: t(`topics.${topic}.defaultSubject`, {
          defaultValue: t('form.defaultSubject'),
        }),
        message: '',
      }));
    } catch (err) {
      console.error('[ContactPage] Fehler beim Senden:', err);
      setErrorMsg(t('form.error'));
    } finally {
      setSending(false);
    }
  };

  // Tekste sipas topic-ut (general / neubau / …)
  const headline =
    t(`topics.${topic}.headline`, { defaultValue: t('page.title') });
  const description =
    t(`topics.${topic}.description`, {
      defaultValue: t('page.description'),
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Helmet>
        <title>{headline} – MyHome24app</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <MdEmail className="text-blue-500 text-2xl" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {headline}
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl">
            {description}
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* KONTAKT-DATEN */}
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {t('page.contactInfo')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {t('page.contactInfoText')}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MdEmail className="text-blue-500" />
                  <a
                    href="mailto:kontakt@myhome24app.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    kontakt@myhome24app.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MdPhone className="text-blue-500" />
                  <span>+49 30 12345678</span>
                </div>
                <div className="flex items-start gap-2">
                  <MdLocationOn className="text-blue-500 mt-0.5" />
                  <span>
                    Beispielstraße 12
                    <br />
                    10115 Berlin, Deutschland
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">
                {t('page.hintTitle')}
              </p>
              <p>{t('page.hintText')}</p>
            </div>
          </section>

          {/* FORMULARI */}
          <section className="bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t('form.title')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block mb-1 font-medium">
                  {t('form.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {t('form.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {t('form.message')}
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500">{errorMsg}</p>
              )}
              {success && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t('form.success')}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {sending ? t('form.sending') : t('form.send')}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
