// src/pages/BlogDetail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BlogDetail = () => {
  const { id } = useParams(); // id do jetë 1, 2, etj.
  const { t } = useTranslation('blogPost');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <img
        src={`/images/Blog${id}.png`}
        alt={`Blog ${id}`}
        className="w-full h-72 object-cover rounded-lg mb-6"
      />
      <h1 className="text-4xl font-bold text-blue-700 mb-4">{t(`title${id}`)}</h1>
      <p className="text-lg text-gray-700 leading-relaxed">{t(`full${id}`)}</p>
    </div>
  );
};

export default BlogDetail;
