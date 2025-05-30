import React from 'react';
import { useTranslation } from 'react-i18next';

const CommentsSection = () => {
  const { t } = useTranslation('comments');

  return (
    <section>
      <h2 className="text-xl font-semibold">{t('comments.title')}</h2>
      <form className="space-y-4">
        <input
          type="text"
          placeholder={t('comments.name')}
          className="border p-2 w-full"
        />
        <textarea
          placeholder={t('comments.text')}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {t('comments.submit')}
        </button>
      </form>
    </section>
  );
};

export default CommentsSection;
