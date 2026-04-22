import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

const DropdownMenu = ({
  label,
  items = [],
  direction = "left",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const location = useLocation();

  const positionClass = direction === "right" ? "right-0" : "left-0";

  const clearMenuTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearMenuTimeout();
    setIsOpen(true);
  };

  const closeMenuWithDelay = () => {
    clearMenuTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const closeMenu = () => {
    clearMenuTimeout();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      clearMenuTimeout();
    };
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-800 transition hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <FiChevronDown
          className={`text-sm transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${positionClass} top-full mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl z-[9999] dark:border-gray-800 dark:bg-gray-900`}
        >
          <div className="py-2">
            {items.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={`${item.path}-${index}`}
                  to={item.path}
                  className={`block px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  }`}
                >
                  <div className="font-medium">{item.label}</div>
                  {item.description ? (
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;