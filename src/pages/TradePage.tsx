import React, { useState } from 'react';
import SubHeader from '../components/SubHeaderTrade';
import GridInfo from '../components/GridInfoOzet';
import GridInfoIslem from '../components/GridInfoIslemler';
import GridBnPositions from '../components/GridBnPosition';


const TradePage: React.FC = () => {
  const [activeTable, setActiveTable] = useState('B-Pos');

  console.log(window.innerWidth);

  const renderTable = () => {
    switch (activeTable) {
      case 'I-Pos':
        return <GridInfo />;
      case 'I-Trade':
        return <GridInfoIslem />;
      case 'B-Pos':
        return <GridBnPositions />;
      case 'B-Trade':
        return <GridInfoIslem />;
      default:
        return null;
    }
  };



  return (
    <div className="app-container">
      <SubHeader activeTable={activeTable} onTableChange={setActiveTable} />
      <div className="table-container">
        {renderTable()}
      </div>
    </div>
  );
};

export default TradePage;