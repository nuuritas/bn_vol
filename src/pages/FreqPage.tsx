import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchVWPDataFreq, fetchPriceData } from '../api/api';
import { FreqChart } from '../components/FreqChart';
import SymbolSelect from '../components/SymbolSelect';

const FreqPage: React.FC = () => {
  const [inputSymbol, setInputSymbol] = useState('BTCUSDT');
  const [inputDayback, setInputDayback] = useState(30);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const [queryParams, setQueryParams] = useState({
    symbol: 'BTCUSDT',
    dayback: 30,
    market: 'crypto',
  });

  const [shouldFetch, setShouldFetch] = useState(true); // Set to true to fetch on mount

  const { data: priceData5, isLoading: priceLoading5, error: priceError5, refetch: refetchPrice5 } = useQuery(
    ['price', queryParams.symbol, '5m', queryParams.dayback, queryParams.market],
    () => fetchPriceData(queryParams.symbol, '5m', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: priceData15, isLoading: priceLoading15, error: priceError15, refetch: refetchPrice15 } = useQuery(
    ['price', queryParams.symbol, '15m', queryParams.dayback, queryParams.market],
    () => fetchPriceData(queryParams.symbol, '15m', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: priceData60, isLoading: priceLoading60, error: priceError60, refetch: refetchPrice60 } = useQuery(
    ['price', queryParams.symbol, '1h', queryParams.dayback , queryParams.market],
    () => fetchPriceData(queryParams.symbol, '1h', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: priceData240, isLoading: priceLoading240, error: priceError240, refetch: refetchPrice240 } = useQuery(
    ['price', queryParams.symbol, '4h', queryParams.dayback, queryParams.market],
    () => fetchPriceData(queryParams.symbol, '4h', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: vwpDataFreq5, isLoading: vwpLoading5, error: vwpError5, refetch: refetchVwpFreq5 } = useQuery(
    ['vwpFreq', queryParams.symbol, '5m', queryParams.dayback, queryParams.market],
    () => fetchVWPDataFreq(queryParams.symbol, '5m', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: vwpDataFreq15, isLoading: vwpLoading15, error: vwpError15, refetch: refetchVwpFreq15 } = useQuery(
    ['vwpFreq', queryParams.symbol, '15m', queryParams.dayback, queryParams.market],
    () => fetchVWPDataFreq(queryParams.symbol, '15m', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: vwpDataFreq60, isLoading: vwpLoading60, error: vwpError60, refetch: refetchVwpFreq60 } = useQuery(
    ['vwpFreq', queryParams.symbol, '1h', queryParams.dayback, queryParams.market],
    () => fetchVWPDataFreq(queryParams.symbol, '1h', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: vwpDataFreq240, isLoading: vwpLoading240, error: vwpError240, refetch: refetchVwpFreq240 } = useQuery(
    ['vwpFreq', queryParams.symbol, '4h', queryParams.dayback, queryParams.market],
    () => fetchVWPDataFreq(queryParams.symbol, '4h', queryParams.dayback, queryParams.market),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const vwpDataFreqArray = [vwpDataFreq5, vwpDataFreq15, vwpDataFreq60, vwpDataFreq240];
  const priceDataArray = [priceData5, priceData15, priceData60, priceData240];
  const intervalArray = ['5m', '15m', '1h', '4h'];

  const isLoading = vwpLoading5 || vwpLoading15 || vwpLoading60 || vwpLoading240 || priceLoading5 || priceLoading15 || priceLoading60 || priceLoading240;
  const hasError = vwpError5 || vwpError15 || vwpError60 || vwpError240 || priceError5 || priceError15 || priceError60 || priceError240;

  // Effect to handle fetching when shouldFetch is true
  useEffect(() => {
    if (shouldFetch) {
      refetchVwpFreq5();
      refetchVwpFreq15();
      refetchVwpFreq60();
      refetchVwpFreq240();
      refetchPrice5();
      refetchPrice15();
      refetchPrice60();
      refetchPrice240();
      setShouldFetch(false); // Reset the trigger after fetching
    }
  }, [shouldFetch, refetchVwpFreq5, refetchVwpFreq15, refetchVwpFreq60, refetchVwpFreq240, refetchPrice5, refetchPrice15, refetchPrice60, refetchPrice240]);


  const handleFetchData = () => {
    // First update the query parameters
    setQueryParams({
      symbol: inputSymbol,
      dayback: inputDayback,
      market: 'crypto',
    });
    // Then set the fetch trigger
    setShouldFetch(true);
  };

  // const handleFetchData = () => {
  //   refetchVwpFreq5();
  //   refetchVwpFreq15();
  //   refetchVwpFreq60();
  //   refetchVwpFreq240();
  //   refetchPrice5();
  //   refetchPrice15();
  //   refetchPrice60();
  //   refetchPrice240();
  // };

  // // Fetch data automatically when the component mounts
  // useEffect(() => {
  //   handleFetchData();
  // }, []);

  const getChartDimensions = (containerElement: HTMLDivElement | null) => {
    if (!containerElement) return { width: '100%', height: 450 };

    if (window.innerWidth < 768) {
      return {
        width: containerElement.clientWidth,
        height: 400
      };
    }

    return {
      width: containerElement.clientWidth / 2,
      height: 450
    };
  };

  const dimensions = getChartDimensions(containerRef);

  return (
    <div className="app-container">
      <div className="header" style={{ marginBottom: '25px' }}>
        <div className="controls-box">
          <SymbolSelect selectedSymbol={inputSymbol} onSymbolChange={setInputSymbol} />
          <input
            type="number"
            value={inputDayback}
            onChange={(e) => setInputDayback(Number(e.target.value))}
            placeholder="Dayback"
            className="dayback-input"
          />
          <button
            onClick={handleFetchData}
            className="fetch-button"
            disabled={isLoading}
          >
            {isLoading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      <div 
        ref={setContainerRef}
        className="chart-container grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ width: '100%' }}
      >
        {!isLoading && !hasError && Array(4).fill(null).map((_, index) => (
          <div key={index} style={{ width: '100%' }}>
        <FreqChart
          height={dimensions.height}
          // @ts-ignore
          width={dimensions.width}
          priceData={priceDataArray[index] || []}
          vwpDataFreq={vwpDataFreqArray[index] || []}
          symbol={inputSymbol}
          interval={intervalArray[index]}
        />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreqPage;