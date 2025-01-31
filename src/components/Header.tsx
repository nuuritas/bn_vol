import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav>
        <ul className="header-nav">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/candle">Candlestick</Link>
          </li>
          <li>
            <Link to="/freq">Frequency</Link>
          </li>
          <li>
            <Link to="/table">Table</Link>
          </li>
          <li>
            <Link to="/tv">TV</Link>
          </li>
          <li>
            <Link to="/trade">Trade</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 