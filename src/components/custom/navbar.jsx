"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  // const [darkMode, setDarkMode] = useState(false);

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  //   document.documentElement.classList.toggle('dark', !darkMode);
  // }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Toggle Dark/Light Mode Button */}
        {/* <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-gray-800 dark:text-white focus:outline-none"
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button> */}

        <div className="flex items-center space-x-4">
          <Link href="/" className="p-3 text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition">
            Home
          </Link>
          <Link href="/performance" className="p-3 text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition">
            Reports
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
