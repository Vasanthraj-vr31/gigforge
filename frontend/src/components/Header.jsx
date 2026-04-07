import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo-container">
          <h1 className="logo-text">gigforge</h1>
        </div>
        <div className="title-container">
          <h2 className="project-title">GigForge – Tamil Nadu Freelance Marketplace</h2>
          <p className="subtitle">Connecting local talent with great opportunities</p>
        </div>
        <div className="auth-buttons">
          <button className="nav-btn login-btn">Log In</button>
          <button className="btn signup-btn">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
