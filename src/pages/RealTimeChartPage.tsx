import React from 'react';
import RealTimeChart from '../components/RealTimeChart';

const RealTimeChartPage: React.FC = () => {
  return (
    <div>
      <h1>Real-Time VWAP and Price Visualization</h1>
      <RealTimeChart />
    </div>
  );
};

export default RealTimeChartPage;