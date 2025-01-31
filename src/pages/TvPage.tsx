// // MyPage.jsx
import React, { useState } from 'react';
import StockDashboard from '../components/TvFullStock';
import CryptoDashboard from '../components/TvFullCrypto';
import SubHeader from '../components/SubHeaderTv';
import ScreenerDashboard from '../components/TvFullScreener';
import DenemeDashboard from '../components/TvDeneme';



const TvPage: React.FC = () => {
  const [activePage, setActivePage] = useState('Stock');

  const renderPage = () => {
    switch (activePage) {
      case 'Stock':
        return <StockDashboard />;
      case 'Crypto':
        return <CryptoDashboard />;
      case 'Screener':
        return <ScreenerDashboard />;
        case 'Deneme':
          return <DenemeDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <SubHeader activeTable={activePage} onTableChange={setActivePage} />
        {renderPage()}
    </div>
  );
};

export default TvPage;

