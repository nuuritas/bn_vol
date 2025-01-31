import React from 'react';

interface SubHeaderProps {
  activeTable: string;
  onTableChange: (table: string) => void;
}

const SubHeader: React.FC<SubHeaderProps> = ({ activeTable, onTableChange }) => {
  return (
    <div className="subheader">
      <button
        className={`subheader-button ${activeTable === 'I-Pos' ? 'active' : ''}`}
        onClick={() => onTableChange('I-Pos')}
      >
        I-Pos
      </button>
      <button
        className={`subheader-button ${activeTable === 'I-Trade' ? 'active' : ''}`}
        onClick={() => onTableChange('I-Trade')}
      >
        I-Trade
      </button>
      <button
        className={`subheader-button ${activeTable === 'B-Pos' ? 'active' : ''}`}
        onClick={() => onTableChange('B-Pos')}
      >
        B-Pos
      </button>
      <button
        className={`subheader-button ${activeTable === 'B-Trade' ? 'active' : ''}`}
        onClick={() => onTableChange('B-Trade')}
      >
        B-Trade
      </button>
      
    </div>
  );
};

export default SubHeader;
