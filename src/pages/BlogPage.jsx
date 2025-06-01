import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import i18n from '../i18n'; // kujdes që rruga të jetë korrekte

const BlogPage = () => {
  const { t } = useTranslation('blogPost');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    setArticles([
      {
        id: 1,
        title: t('title1'),
        summary: t('summary1'),
        image: '/images/blog1.jpg',
      },
      {
        id: 2,
        title: t('title2'),
        summary: t('summary2'),
        image: '/images/blog2.jpg',
      },
    ]);
  }, [i18n.language, t]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Helmet>
        <title>{t('pageTitle')} – MyHome24App</title>
        <meta name="description" content={t('pageSubtitle')} />
      </Helmet>

      <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">{t('pageTitle')}</h1>
      <p className="text-center text-gray-600 mb-12">{t('pageSubtitle')}</p>

      <div className="grid sm:grid-cols-2 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-4">{article.summary}</p>
              <Link to={`/blog/${article.id}`} className="text-blue-600 font-medium hover:underline">
                {t('readMore')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
