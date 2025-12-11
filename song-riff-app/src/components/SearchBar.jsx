/**
 * Search Bar Component
 * 
 * Displays a search bar with an input field and a search icon, allowing 
 * users to enter search queries for songs.
 * 
 * @component
 */

import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';
// import { getLyrics } from '../geniusAPI';

const SearchBar = () => {
  return (
    <div className="search-bar-container">
      <FaSearch className="search-icon" />
      <input type="text" placeholder="Search" className="search-input" />
    </div>
  );
};

export default SearchBar;
