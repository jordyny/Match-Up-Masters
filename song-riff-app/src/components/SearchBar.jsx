import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';
import { getLyrics } from '../geniusAPI';

const SearchBar = () => {
  return (
    <div className="search-bar-container">
      <FaSearch className="search-icon" />
      <input type="text" placeholder="Search" className="search-input" />
    </div>
  );
};

export default SearchBar;
