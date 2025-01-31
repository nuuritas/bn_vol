import React, { useEffect } from 'react';

const DenemeDashboard = () => {
  useEffect(() => {
    // Initialize the TradingView widget
    new TradingView.widget({
      container_id: 'advanced-chart',
      autosize: true,
      symbol: 'BINANCE:BTCUSDT.P',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      onChartReady: (chart) => {
        console.log('Chart is ready!');
        // Add a custom button to draw a trend line
        chart.createButton()
          .text('Draw Line')
          .on('click', () => {
            chart.executeActionById('drawingToolbarAction-trendline');
          });
      },
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-8 py-4 bg-transparent shadow-sm">
        <a href="#" className="text-3xl font-semibold bg-gradient-to-r from-[#00bce5] to-[#2962ff] text-transparent bg-clip-text">
          Crypto
        </a>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-6xl mx-auto w-full">
        <section id="advanced-chart" className="col-span-2 h-[500px]"></section>
      </main>

      <footer className="mt-8 py-4 px-8 bg-transparent text-center">
        <p className="text-sm text-white">
          This example page demonstrates dynamic TradingView widgets integration.
        </p>
      </footer>
    </div>
  );
};

export default DenemeDashboard;