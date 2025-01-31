import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/candlestick">Candlestick</Link>
          </li>
          <li>
            <Link to="/freq">Frequency</Link>
          </li>
          <li>
            <Link to="/table">Table</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 