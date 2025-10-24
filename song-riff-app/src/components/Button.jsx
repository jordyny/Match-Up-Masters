import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';


//"children" is the text/icon in the button
// "to" the component will add a link
//"primary" to apply the spotify green style
const Button = ({ to, onClick, children, className = '', icon: Icon, primary = false }) => {
  const buttonClasses = `custom-button ${primary ? 'primary' : ''} ${className}`;

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {children}
        {Icon && <Icon />}
      </Link>
    );
  }
// render a standard button if "to" not provided
  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
      {Icon && <Icon />}
    </button>
  );
};

export default Button;