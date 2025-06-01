import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({ label, items, direction = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // mund ta ndryshosh delay këtu
  };

  const positionClass = direction === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="cursor-pointer">{label}</span>
      {isOpen && (
        <div
          className={`absolute ${positionClass} mt-2 w-56 bg-white border border-gray-200 rounded shadow-md z-50 animate-fade-in`}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block px-4 py-2 text-blue-600 hover:underline hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
