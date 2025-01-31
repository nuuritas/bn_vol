import React from 'react';

interface SubHeaderProps {
  activeTable: string;
  onTableChange: (table: string) => void;
}

const SubHeader: React.FC<SubHeaderProps> = ({ activeTable, onTableChange }) => {
  return (
    <div className="subheader">
      <button
        className={`subheader-button ${activeTable === 'PC' ? 'active' : ''}`}
        onClick={() => onTableChange('PC')}
      >
        PC
      </button>
      <button
        className={`subheader-button ${activeTable === 'CS' ? 'active' : ''}`}
        onClick={() => onTableChange('CS')}
      >
        CS
      </button>
      {/* <button
        className={`subheader-button ${activeTable === 'Kahin' ? 'active' : ''}`}
        onClick={() => onTableChange('Kahin')}
      >
        Kahin
      </button> */}
      <button
        className={`subheader-button ${activeTable === 'Kahin' ? 'active' : ''}`}
        onClick={() => onTableChange('Kahin')}
      >
        Kahin
      </button>
      <button
        className={`subheader-button ${activeTable === 'Box' ? 'active' : ''}`}
        onClick={() => onTableChange('Box')}
      >
        Box
      </button>
      {/* <button
        className={`subheader-button ${activeTable === 'Gann' ? 'active' : ''}`}
        onClick={() => onTableChange('Gann')}
      >
        Gann
      </button> */}
      {/* <button
        className={`subheader-button ${activeTable === 'KC' ? 'active' : ''}`}
        onClick={() => onTableChange('KC')}
      >
        KC
      </button> */}
      <button
        className={`subheader-button ${activeTable === 'GT' ? 'active' : ''}`}
        onClick={() => onTableChange('GT')}
      >
        GT
      </button>
      <button
        className={`subheader-button ${activeTable === 'SR' ? 'active' : ''}`}
        onClick={() => onTableChange('SR')}
      >
        SR
      </button>
    </div>
  );
};

export default SubHeader;
