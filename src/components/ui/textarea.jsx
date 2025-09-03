import React from 'react';

export const Textarea = ({ value, onChange, placeholder, rows = 4, className = '' }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-white ${className}`}
  />
);
