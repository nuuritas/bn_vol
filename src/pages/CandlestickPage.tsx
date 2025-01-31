import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  fetchPriceData, fetchVWPDataFreq,
  fetchGannData, fetchFxMatikBoxLine,
  fetchOrderData, fetchSymbolData2,
  fetchPositionData
} from '../api/api';
import { CandlestickChart } from '../components/CandlestickChart';
import SymbolSelect from '../components/SymbolSelect';
import { calculateFibAndChRange, findCurrentGannRange } from '../utils/fibonacciUtils';
// import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import {
  BnPositionsResponse, SymbolData, formatValue2,
  formatValueInt, getCellStyleGR, myTheme,
  AgGridPositionParams
} from '../shared';
import usePersistedState from '../hooks/usePersistedState';


ModuleRegistry.registerModules([AllCommunityModule]);

const CandlestickPage: React.FC = () => {
  // Form input states with default values
  const [inputSymbol, setInputSymbol] = usePersistedState('inputSymbol', 'BTCUSDT');
  const [inputInterval, setInputInterval] = usePersistedState('inputInterval', '15m');
  const [inputDayback, setInputDayback] = usePersistedState('inputDayback', 10);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [pricePrecision, setPricePrecision] = usePersistedState('pricePrecision', 2);
  const [market, setMarket] = useState<string>('crypto');
  const [fibInfo, setFibInfo] = useState<{ fibRange: number; chRange: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [symbolsData, setSymbolsData] = useState<Map<string, number>>(new Map());
  const [processedData, setProcessedData] = useState<BnPositionsResponse[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Query parameter states with default values
  const [queryParams, setQueryParams] = usePersistedState('queryParams', {
    symbol: 'BTCUSDT',
    interval: '15m',
    dayback: 10
  });

  // Trigger state to control when to fetch
  const [shouldFetch, setShouldFetch] = useState(true); // Set to true to fetch on mount

  const { data: priceData, isLoading: priceLoading, error: priceError, refetch: refetchPriceData } = useQuery(
    ['prices', queryParams.symbol, queryParams.interval, queryParams.dayback],
    () => fetchPriceData(queryParams.symbol, queryParams.interval, queryParams.dayback),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  // VWP data query - only enabled for crypto market
  const { data: vwpDataFreq, isLoading: vwpLoading, error: vwpError, refetch: refetchVWPDataFreq } = useQuery(
    ['vwpFreq', queryParams.symbol, queryParams.interval, queryParams.dayback],
    () => fetchVWPDataFreq(queryParams.symbol, queryParams.interval, queryParams.dayback),
    {
      enabled: shouldFetch && market === 'crypto',
      staleTime: Infinity,
    }
  );

  const { data: fxMatikBoxLine, isLoading: fxMatikBoxLineLoading, error: fxMatikBoxLineError, refetch: refetchFxMatikBoxLine } = useQuery(
    ['fxMatikBoxLine', queryParams.symbol],
    () => fetchFxMatikBoxLine(queryParams.symbol),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: gannData, isLoading: gannLoading, error: gannError, refetch: refetchGannData, } = useQuery(
    ['gann', queryParams.symbol],
    () => fetchGannData(queryParams.symbol),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  const { data: orderData, refetch: refetchOrderData, } = useQuery(
    ['orders', queryParams.symbol],
    () => fetchOrderData(queryParams.symbol),
    {
      enabled: shouldFetch,
      staleTime: Infinity, // Prevent auto-refetching
    }
  );

  // Effect to handle fetching when inputSymbol changes
  useEffect(() => {
    if (inputSymbol) {
      // Update query parameters with the new symbol
      setQueryParams((prevParams) => ({
        ...prevParams,
        symbol: inputSymbol,
      }));
      // Trigger fetch
      setShouldFetch(true);
    }
  }, [inputSymbol]);

  // Effect to handle fetching
  useEffect(() => {
    if (shouldFetch) {
      refetchPriceData();
      refetchFxMatikBoxLine();
      refetchGannData();

      // Only fetch VWP data for crypto market
      if (market === 'crypto') {
        refetchVWPDataFreq();
        refetchOrderData();
      }

      setShouldFetch(false);
    }
  }, [shouldFetch, market, refetchPriceData, refetchVWPDataFreq, refetchFxMatikBoxLine, refetchGannData, refetchOrderData]);


  // Effect to fetch data on component mount
  useEffect(() => {
    handleFetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleFetchData = () => {
    // First update the query parameters
    setQueryParams({
      symbol: inputSymbol,
      interval: inputInterval,
      dayback: inputDayback,
    });
    // Then set the fetch trigger
    setShouldFetch(true);
  };

  const handleSymbolChange = (symbol: string, pricePrecision: number, market: string) => {
    setInputSymbol(symbol);
    setPricePrecision(pricePrecision);
    setMarket(market)
  };

  // Determine loading and error states
  const isLoading = priceLoading ||
    (market === 'crypto' ? vwpLoading : false) ||
    fxMatikBoxLineLoading ||
    gannLoading;

  const hasError = priceError ||
    (market === 'crypto' ? vwpError : false) ||
    fxMatikBoxLineError ||
    gannError;

  const [selectedBoxes, setSelectedBoxes] = useState<{ [key: string]: boolean }>({
    Candle: true,
  });

  const handleFibonacci = () => {
    if (priceData && priceData.length > 0 && gannData && gannData.length > 0) {
      const lastPrice = priceData[priceData.length - 1].close;
      const currentGannRange = findCurrentGannRange(gannData, lastPrice);

      if (currentGannRange) {
        const { fibRange, chRange } = calculateFibAndChRange(currentGannRange.min, currentGannRange.max);
        setFibInfo({ fibRange, chRange }); // Update fibInfo state
      } else {
        setFibInfo(null); // Clear fibInfo if no valid range is found
      }
    }
  };

  useEffect(() => {
    handleFibonacci();
  }, [priceData, gannData]);

  const handleCheckboxChange = (name: string) => {
    setSelectedBoxes((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getChartDimensions = (containerElement: HTMLDivElement | null) => {
    if (!containerElement) return { width: '100%', height: 550 };

    let widthSelect;
    if (window.innerWidth < 768) {
      widthSelect = containerElement.clientWidth;
    } else {
      widthSelect = containerElement.clientWidth * 0.85;
    }

    let heightSelect;
    if (window.innerHeight < 768) {
      heightSelect = window.innerHeight * 0.75;
    } else {
      heightSelect = window.innerHeight * 0.6;
    }

    return {
      width: widthSelect,
      height: heightSelect,
    };
  };

  const dimensions = getChartDimensions(containerRef);

  // #region Table

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'symbol',
      headerName: 'Symbol',
      maxWidth: 100,
    },
    {
      field: 'positionType',
      headerName: 'PT',
      maxWidth: 40,
    },
    {
      field: 'percentChange',
      headerName: 'P%',
      maxWidth: 70,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.percentChange) || 0,
      valueFormatter: (params: AgGridPositionParams) => formatValue2(params.value),
    },
    {
      field: 'unRealizedProfit',
      headerName: 'PL',
      sortable: true,
      sort: 'desc',
      maxWidth: 60,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.unRealizedProfit) || 0,
      valueFormatter: (params: AgGridPositionParams) => formatValue2(params.value),
      cellStyle: (params: AgGridPositionParams) => getCellStyleGR(params.value),
    },
    {
      field: 'entryPrice',
      headerName: 'O',
      maxWidth: 90,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.entryPrice) || 0,
      valueFormatter: (params: AgGridPositionParams) => {
        const precision = symbolsData.get(params.data.symbol) ?? 2;
        return formatValue2(params.value, precision);
      },
    },
    {
      field: 'markPrice',
      headerName: 'LP',
      maxWidth: 90,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.markPrice) || 0,
      valueFormatter: (params: AgGridPositionParams) => {
        const precision = symbolsData.get(params.data.symbol) ?? 2;
        return formatValue2(params.value, precision);
      }
    },
    {
      field: 'notional',
      headerName: 'Vol',
      sortable: true,
      maxWidth: 70,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.notional) || 0,
      valueFormatter: (params: AgGridPositionParams) => formatValueInt(params.value),
    },
    {
      field: 'positionInitialMargin',
      headerName: 'MR',
      sortable: true,
      maxWidth: 70,
      valueGetter: (params: AgGridPositionParams) => parseFloat(params.data.positionInitialMargin) || 0,
      valueFormatter: (params: AgGridPositionParams) => formatValue2(params.value),
    },
  ], [symbolsData]);

  // Fetch symbols data

  
  useEffect(() => {
    const fetchSymbolsData = async () => {
      try {
        const response = await fetchSymbolData2(); // Add `await` here

        const symbolMap = new Map(
          response.map(symbol => [symbol.symbol_text, symbol.price_precision])
        );
  
        // Update state
        setSymbolsData(symbolMap);
      } catch (err) {
        // Handle errors
        setError(err instanceof Error ? err : new Error('Failed to fetch symbols'));
        setLoading(false);
      }
    };
  
    fetchSymbolsData();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      if (symbolsData.size === 0) return;

      try {
        const response = await fetchPositionData();
        setProcessedData(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [symbolsData]);
  
  // #endregion


  return (
    <div className="app-container">

      {/* {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: 'fixed', 
            top: '20%', 
            left: '20px', 
            padding: '10px',
            backgroundColor: '#7873f5',
            border: 'white',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '5px',
            zIndex: 1000, 
          }}
        >
          ► P
        </button>
      )}

      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed', 
            top: 100,
            left: 0,
            height: '50%', 
            width: '400px', 
            backgroundColor: '#0f172a', 
            zIndex: 1000, 
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)', 
            padding: '10px',
            color: 'white',
          }}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#7873f5',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: '10px',
            }}
          >
            ◄ Close
          </button>

        
          <div
            className="ag-theme-alpine" 
            style={{
              height: '90%', 
              width: '100%',
            }}
          >
            <AgGridReact
              rowData={processedData} 
              columnDefs={columnDefs}
              theme={myTheme}
              pagination={false}
              paginationPageSize={10}
            />
          </div>
        </div>
      )} */}

      <div className="header">
        <div className="controls-box">
          <SymbolSelect selectedSymbol={inputSymbol} onSymbolChange={handleSymbolChange}
          />
          <div
            className="fetch-button"
            style={{ display: 'inline-block', cursor: 'pointer', width: '3rem', alignItems: 'right' }}
            onClick={() => document.getElementById('interval-select')?.click()}
          >
            <select
              id="interval-select"
              value={inputInterval}
              onChange={(e) => setInputInterval(e.target.value)}
              style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              <option value="5m">M5</option>
              <option value="15m">M15</option>
              <option value="30m">M30</option>
              <option value="1h">H1</option>
              <option value="4h">H4</option>
              <option value="1d">D1</option>
              <option value="1w">W1</option>
            </select>
          </div>
          <input
            type="number"
            value={inputDayback}
            onChange={(e) => setInputDayback(Number(e.target.value))}
            placeholder="Dayback"
            className="fetch-button"
            style={{ width: '4rem', textAlign: 'center' }}
          />
          <button
            onClick={handleFetchData}
            className="fetch-button"
            disabled={isLoading}
            style={{ minWidth: '3rem' }}
          >
            {isLoading ? 'F...' : 'F'}
          </button>
        </div>
      </div>

      {!isLoading && !hasError && priceData && (market === 'crypto' ? vwpDataFreq : true) && fxMatikBoxLine && (
        <>
          <div className="box-container" style={{ marginBottom: '5px', marginTop: '15px' }}>
            {/* Candle Box */}
            <div
              className={`box ${selectedBoxes['Candle'] ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange('Candle')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                width="24"
                height="24"
                fill="none"
              >
                <line x1="20" y1="10" x2="20" y2="30" stroke="#ffffff" strokeWidth="12" />
                <rect x="15" y="30" width="10" height="40" fill="#ffffff" stroke="#ffffff" strokeWidth="12" />
                <line x1="20" y1="70" x2="20" y2="90" stroke="#ffffff" strokeWidth="12" />
                <line x1="60" y1="5" x2="60" y2="25" stroke="#26a69a" strokeWidth="12" />
                <rect x="55" y="25" width="10" height="40" fill="#26a69a" stroke="#26a69a" strokeWidth="12" />
                <line x1="60" y1="65" x2="60" y2="85" stroke="#26a69a" strokeWidth="12" />
              </svg>
            </div>

            {/* Gann Box */}
            <div
              className={`box ${selectedBoxes['Gann'] ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange('Gann')}
            >
              G
            </div>

            {/* Close Box */}
            {/* <div
              className={`box ${selectedBoxes['Close'] ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange('Close')}
            >
              Cl
            </div> */}

            {/* Fib Box */}
            <div
              className={`box ${selectedBoxes['Fib'] ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange('Fib')}
              style={{ position: 'relative' }}
            >
              F
              {selectedBoxes['Fib'] && fibInfo && (
                <div style={{ position: 'absolute', top: '100%', left: '0', whiteSpace: 'nowrap' }}>
                  (FR: {fibInfo.fibRange.toFixed(2)}% | CR: {fibInfo.chRange.toFixed(2)}%)
                </div>
              )}
            </div>

            {/* VWP Box (only for crypto market) */}
            {market === 'crypto' && (
              <div
                className={`box ${selectedBoxes['VWP'] ? 'selected' : ''}`}
                onClick={() => handleCheckboxChange('VWP')}
              >
                V
              </div>
            )}

            {/* @ts-ignore */}
            {Object.keys(fxMatikBoxLine).map((key, index) => {
              {/* @ts-ignore */ }
              const boxData = fxMatikBoxLine[key];
              const timeString = boxData.d;
              const date = new Date(timeString);
              const formattedDate = `${date.getMonth() + 1}-${date.getDate()} @${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              const labelColor = boxData.tp1 > boxData.p ? 'green' : 'red';

              return (
                <div
                  key={key}
                  className={`box ${selectedBoxes[key] ? 'selected' : ''}`}
                  onClick={() => handleCheckboxChange(key)}
                  // style={{ color: labelColor, position: 'relative' }}
                  style={{ color: labelColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {/* Conditionally render Crystal SVG or text */}
                  {key === 'Kristal' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      width="24"
                      height="24"
                      fill="#FFFFFF"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    >
                      <polygon points="50,10 80,50 50,90 20,50" />
                    </svg>
                  ) : (
                    key.substring(0, 1)
                  )}
                  {selectedBoxes[key] && (
                    <div style={{ position: 'absolute', top: '100%', left: '0', whiteSpace: 'nowrap' }}>
                      {formattedDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div ref={setContainerRef}></div>
          <div className="chart-container">
            <CandlestickChart
              priceData={priceData}
              vwpDataFreq={market === 'crypto' ? vwpDataFreq || [] : []}
              height={dimensions.height}
              // @ts-ignore
              width={dimensions.width}
              symbol={inputSymbol}
              interval={inputInterval}
              selectedBoxes={selectedBoxes}
              // @ts-ignore
              fxMatikBoxLine={fxMatikBoxLine}
              pricePrecision={pricePrecision}
              gannData={gannData}
              orderData={market === 'crypto' ? orderData : []}
            />
          </div>
        </>
      )
      }
    </div >
  );
}

export default CandlestickPage;