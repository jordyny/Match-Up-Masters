import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {FiHome, FiUser, FiArchive, FiHelpCircle} from 'react-icons/fi';
import './Header.css';

const Header = ({ userEmail, onLogout }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  return (
    // This is the new floating pill container
    <div className="floating-header-pill">
      
      {/* Profile Icon and Dropdown */}
      <div className="profile-container">
        <FiUser
          className="header-icon" 
          onClick={() => setDropdownVisible(!isDropdownVisible)} 
        />
        {isDropdownVisible && (
          <div className="profile-dropdown">
            <div className="dropdown-email">{userEmail}</div>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
      
      {/* A simple visual divider */}
      <div className="header-divider"></div>

      {/* Home Icon */}
      <Link to="/home">
          <FiHome className="header-icon" />
      </Link>

      {/* How to Play Icon */}
      <Link to="/how-to">
          <FiHelpCircle className="header-icon" />
      </Link>

      

      

    </div>
  );
};

export default Header;