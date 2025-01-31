import React from 'react';

interface SubHeaderProps {
  activeTable: string;
  onTableChange: (table: string) => void;
}

const SubHeader: React.FC<SubHeaderProps> = ({ activeTable, onTableChange }) => {
  return (
    <div className="subheader">
      <button
        className={`subheader-button ${activeTable === 'Stock' ? 'active' : ''}`}
        onClick={() => onTableChange('Stock')}
      >
        Stock
      </button>
      <button
        className={`subheader-button ${activeTable === 'Crypto' ? 'active' : ''}`}
        onClick={() => onTableChange('Crypto')}
      >
        Crypto
      </button>
      <button
        className={`subheader-button ${activeTable === 'Screener' ? 'active' : ''}`}
        onClick={() => onTableChange('Screener')}
      >
        Screener
      </button>
      <button
        className={`subheader-button ${activeTable === 'Deneme' ? 'active' : ''}`}
        onClick={() => onTableChange('Deneme')}
      >
        Deneme
      </button>
    </div>
  );
};

export default SubHeader;
