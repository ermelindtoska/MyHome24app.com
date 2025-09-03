import React from 'react';

export const Button = ({ children, onClick, className = '', disabled, variant = 'default' }) => {
  const base = 'px-4 py-2 rounded font-medium transition';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
