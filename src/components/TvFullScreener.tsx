import React, { useState, useEffect } from 'react';

const ScreenerkDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('NASDAQ:AAPL');
  const symbols = [
    { value: 'NASDAQ:AAPL', label: 'Apple (AAPL)' },
    { value: 'NASDAQ:MSFT', label: 'Microsoft (MSFT)' },
    { value: 'NASDAQ:TSLA', label: 'Tesla (TSLA)' }
  ];

  // Function to load TradingView widget scripts
  const loadTradingViewScript = (widgetId, scriptUrl, config) => {
    const container = document.getElementById(widgetId);
    if (container) {
      // Clear existing widgets
      container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      
      // Create and load new script
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify(config);
      
      container.appendChild(script);
    }
  };

  // Update all widgets when symbol changes
  useEffect(() => {
    // Ticker Tape
    loadTradingViewScript('ticker-tape', 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js', {
      symbols: symbols.map(s => ({ description: '', proName: s.value })),
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en'
    });

    // Symbol Info
    loadTradingViewScript('symbol-info', 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js', {
      symbol: selectedSymbol,
      width: '100%',
      locale: 'en',
      colorTheme: 'dark',
      isTransparent: true
    });

    // Advanced Chart
    loadTradingViewScript('advanced-chart', 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js', {
      autosize: true,
      symbol: selectedSymbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false
    });

    loadTradingViewScript('additional-advanced-chart', 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js', {
        autosize: true,
        symbol: selectedSymbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        allow_symbol_change: true,
        calendar: false
      });

    // Company Profile
    loadTradingViewScript('screener', 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js', {
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      isTransparent: true,
      symbol: selectedSymbol,
      locale: 'en',
      market: "crypto",
      defaultScreen: "top_gainers",
    });

    // Fundamental Data
    loadTradingViewScript('fundamental-data', 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js', {
      symbol: selectedSymbol,
      colorTheme: 'dark',
      isTransparent: true,
      largeChartUrl: '',
      displayMode: 'adaptive',
      width: '100%',
      height: '100%',
      locale: 'en'
    });

    // Technical Analysis
    loadTradingViewScript('technical-analysis', 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js', {
      interval: '15m',
      width: '100%',
      isTransparent: true,
      height: '100%',
      symbol: selectedSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: 'dark'
    });

    // Top Stories
    loadTradingViewScript('top-stories', 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js', {
      feedMode: 'symbol',
      symbol: selectedSymbol,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      locale: 'en'
    });
  }, [selectedSymbol]);

  return (
    <div className="flex flex-col min-h-screen">
    <header className="flex justify-between items-center px-8 py-4 bg-transparent shadow-sm">
      <a href="#" className="text-3xl font-semibold bg-gradient-to-r from-[#00bce5] to-[#2962ff] text-transparent bg-clip-text">
        Screenerk
      </a>
      <select 
        value={selectedSymbol}
        onChange={(e) => setSelectedSymbol(e.target.value)}
        className="px-4 py-2 w-40 bg-transparent text-white"
      >
        {symbols.map((symbol) => (
        <option key={symbol.value} value={symbol.value}>
          {symbol.label}
        </option>
        ))}
      </select>
    </header>

      <nav id="ticker-tape" className="w-full mb-8"></nav>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-6xl mx-auto w-full">
        <section id="symbol-info" className="col-span-2"></section>
        <section id="advanced-chart" className="col-span-2 md:col-span-1 h-[500px]"></section>
        <section id="additional-advanced-chart" className="col-span-2 md:col-span-1 h-[500px]"></section>
        <section id="screener" className="col-span-2 h-[390px]"></section>
        <section id="fundamental-data" className="col-span-2 h-[490px]"></section>
        <section id="technical-analysis" className="col-span-2 md:col-span-1 h-[425px]"></section>
        <section id="top-stories" className="col-span-2 md:col-span-1 h-[425px]"></section>
        
        <section className="col-span-2 md:col-span-1 bg-[#f8f9fd] border border-[#e0e3eb] p-4 rounded-lg">
          <div className="flex flex-col gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="157" height="21">
              <use href="/widget-docs/tradingview-logo.svg#tradingview-logo"></use>
            </svg>
            <p className="text-sm text-gray-600">
              Charts and financial information provided by TradingView, a popular charting & trading platform. 
              Check out even more <a href="https://www.tradingview.com/features/" className="text-blue-600">advanced features</a> or
              <a href="https://www.tradingview.com/widget/" className="text-blue-600"> grab charts</a> for your website.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-8 py-4 px-8 bg-gray-50 border-t-2 border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          This example page demonstrates dynamic TradingView widgets integration.
        </p>
      </footer>
    </div>
  );
};

export default ScreenerkDashboard;