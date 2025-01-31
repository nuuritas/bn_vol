import React from 'react';
import GridPriceChange from '../components/GridPriceChange';
// import GridKahin from '../components/GridKahinOld';
import GridKahinWeb from '../components/GridKahinWeb';
import GridBoxes from '../components/GridBoxes';
// import GridCloseGann from '../components/GridCloseGann';
import SubHeader from '../components/SubHeaderTable';
import GridCryptoScreen from '../components/GridCryptoScreen';
import GridKahinMobil from '../components/GridKahinMobil';
// import GridKahinCheck from '../components/GridKahinCheck';
import GridGannTracker from '../components/GridGannTracker';
// @ts-ignore
import usePersistedState from '../hooks/usePersistedState'; 
import GridSRTracker from '../components/GridSrTracker';

const TablePage: React.FC = () => {
  // const location = useLocation();
  const [activeTable, setActiveTable] = usePersistedState('activeTable', 'PC');

  const renderTable = () => {
    switch (activeTable) {
      case 'PC':
        return <GridPriceChange />;
      case 'CS':
        return <GridCryptoScreen />;
      case 'Kahin':
        if (window.innerWidth < 768) {
          return <GridKahinMobil />;
        } else {
          return <GridKahinWeb />;
        }
      case 'Box':
        return <GridBoxes />;
      // case 'Gann':
      //   return <GridCloseGann />;
      // case 'KC':
      //   return <GridKahinCheck />;
      case 'GT':
        return <GridGannTracker />;
      case 'SR':
        return <GridSRTracker />;
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

export default React.memo(TablePage);