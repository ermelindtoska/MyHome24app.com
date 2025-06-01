// src/components/BlogPreview.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const BlogPreview = () => {
  const { t } = useTranslation('blogPost');
  const posts = t('posts', { returnObjects: true }) || [];

  return (
    <section className="bg-white py-20 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-10 text-gray-800">
          {t('pageTitle') || 'Our Blog'}
        </h2>

        <div className="grid sm:grid-cols-2 gap-8 text-left">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover rounded-md mb-4"
                />
                <h4 className="text-xl font-semibold text-blue-700 mb-2">{post.title}</h4>
                <p className="text-gray-600">{post.summary}</p>
                <Link
                  to={`/blog/${index + 1}`}
                  className="text-blue-600 hover:underline mt-2 block"
                >
                  {t('readMore')}
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No blog posts available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
