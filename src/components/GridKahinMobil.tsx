import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { themeQuartz } from "ag-grid-community";
import usePersistedState from '../hooks/usePersistedState';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "#242b3a",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);

interface KahinAll {
  symbol: string;
  last_price: number;
  price: number;
  type: string;
  tp1: number;
  tp2: number;
  sl: number;
  volume: number;
  datetime: string;
  pd_ratio: number;
  change: number;
  change_ratio: number;
  range: number;
  range_ratio: number;
  technical_rating: number;
  market: string;
  sector: string;
  is_viop: boolean;
}

interface KahinAllResponse {
  last_update_kahin: string;
  last_update_gann: string;
  data: KahinAll[];
}

const GridKahinMobil = () => {
  const [symbolData, setSymbolData] = useState<SymbolData[]>([]);
  const [inputSymbol, setInputSymbol] = usePersistedState('inputSymbol', 'BTCUSDT');
  const [inputInterval, setInputInterval] = usePersistedState('inputInterval', '15m');
  const [inputDayback, setInputDayback] = usePersistedState('inputDayback', 10);

  // #region Table Part 
  const [rowData, setRowData] = useState<KahinAll[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarkets, setSelectedMarkets] = usePersistedState('selectedMarkets', ['crypto', 'nasdaq', 'forex', 'index', 'bist']);
  type GCCFilterState = '-' | 'M' | 'K';
  type TypeFilterState = '-' | 'L' | 'S';
  type GCPFilterState = '-' | 'L1' | 'S1' | 'L2' | 'S2';
  type ViopFilterState = '-' | true | false;
  console.log('Selected Markets:', selectedMarkets);

  const [gccFilter, setGccFilter] = usePersistedState<GCCFilterState>('gccFilter', '-');
  const [gcpFilter, setGcpFilter] = usePersistedState<GCPFilterState>('gcpFilter', '-');
  const [typeFilter, setTypeFilter] = usePersistedState<TypeFilterState>('typeFilter', '-');
  const [viopFilter, setViopFilter] = usePersistedState<ViopFilterState>('viopFilter', '-');

  const handleGCCClick = () => {
    setGccFilter(prev => {
      if (prev === '-') return 'M';
      if (prev === 'M') return 'K';
      return '-';
    });
  };

  const handleGCPClick = () => {
    setGcpFilter(prev => {
      if (prev === '-') return 'L1';
      if (prev === 'L1') return 'S1';
      if (prev === 'S1') return 'L2';
      if (prev === 'L2') return 'S2';
      return '-';
    });
  };

  const handleTypeClick = () => {
    setTypeFilter(prev => {
      if (prev === '-') return 'L';
      if (prev === 'L') return 'S';
      return '-';
    });
  };

  const handleViopClick = () => {
    setViopFilter(prev => {
      if (prev === '-') return true;
      if (prev === true) return false;
      return '-';
    });
  };


  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 100 },
    { field: 'G_LP', headerName: 'Price', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    { field: 'price', headerName: 'Open', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    { field: 'G_CP', headerName: 'GCP', maxWidth: 60, sort: "desc" },
    { field: 'G_CC', headerName: 'GCC', maxWidth: 40, cellStyle: params => getTypeCellStyle2(params.value) },
    {
      field: 'type',
      headerName: 'Type',
      sortable: true,
      filter: 'agTextColumnFilter',
      maxWidth: 30,
      cellStyle: params => getTypeCellStyle(params.value)
    },

    { field: 'tp1', headerName: 'TP1', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 75 },
    { field: 'sl', headerName: 'SL', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 75 },
    { field: 'G_HD', headerName: 'GHD', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'G_LD', headerName: 'GLD', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'datetime', headerName: 'Date', sortable: true, filter: 'agDateColumnFilter', maxWidth: 100, valueFormatter: params => formatDateTime(params.value) },
    { field: 'market', headerName: 'M', sortable: true, filter: 'agTextColumnFilter', maxWidth: 60 },
  ], []);

  const getTypeCellStyle = (value: string) => {
    return value === 'L' ? { backgroundColor: '#75c861', color: 'white' } : { backgroundColor: '#c46d6d', color: 'white' };
  };

  const getTypeCellStyle2 = (value: string) => {
    return value === 'M' ? { backgroundColor: '#3b8d93', color: 'white' } : { backgroundColor: '#ff6076', color: 'white' };
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month} ${hours}:${minutes}`;
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month} ${hours}:${minutes}`;
  };

  const handleMarketChange = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  // const filteredRowData = useMemo(() => {
  //   return rowData.filter(row => selectedMarkets.includes(row.market.toLowerCase()));
  // }, [rowData, selectedMarkets]);
  const filteredRowData = useMemo(() => {
    return rowData.filter(row => {
      const gccMatch = gccFilter === '-' || row.G_CC === gccFilter;

      let gcpMatch = true;
      if (gcpFilter !== '-') {
        const gcpValue = row.G_CP;
        switch (gcpFilter) {
          case 'L1':
            gcpMatch = gcpValue >= 5 && gcpValue <= 20;
            break;
          case 'S1':
            gcpMatch = gcpValue >= 30 && gcpValue <= 45;
            break;
          case 'L2':
            gcpMatch = gcpValue >= 55 && gcpValue <= 70;
            break;
          case 'S2':
            gcpMatch = gcpValue >= 80 && gcpValue <= 95;
            break;
          default:
            gcpMatch = true;
        }
      }

      const typeMatch = typeFilter === '-' || row.type === typeFilter;
      const viopMatch = viopFilter === '-' || row.is_viop === viopFilter;

      return gccMatch && gcpMatch && typeMatch && viopMatch && selectedMarkets.includes(row.market.toLowerCase());
    });
  }, [rowData, gccFilter, viopFilter, gcpFilter, typeFilter, selectedMarkets]);

  


  useEffect(() => {
    const fetchFxMatikData = async () => {
      try {
        const response = await axios.get<KahinAllResponse>('/api/kahinAll');
        setRowData(response.data.data);
        setLastUpdate(`K: ${formatTimestamp(response.data.last_update_kahin)} | G: ${formatTimestamp(response.data.last_update_gann)}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFxMatikData();

    return () => {
      setRowData([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  // #endregion

  // #region Chart Part

  // #region Checkbox Change

  const handleCheckboxChangeChart = (name: string) => {
    setSelectedBoxes((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // #endregion

  // #endregion

  // #region Dimensions
  const getChartDimensions = () => {
    return { width: window.innerWidth, height: window.innerHeight }; // Adjust dimensions as needed
  };

  const dimensions = getChartDimensions();

  return (
    <div className="app-container">
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '0px',
        fontSize: '14px',
        color: '#ffffff',
        height: '20px'
      }}>
        LU: {lastUpdate}
      </div>
      <div className="box-container" style={{ marginBottom: '10px', marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {['crypto', 'forex', 'index', 'nasdaq', 'bist'].map(market => (
          <div
            key={market}
            className={`box ${selectedMarkets.includes(market) ? 'selected' : ''}`}
            onClick={() => handleMarketChange(market)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '25px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            <span style={{ lineHeight: '1.5', fontSize: '14px', fontWeight: 'bold' }}>
              {market.charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '5px',
        marginBottom: '10px'
      }}>
        {/* GCC Button */}
        <div
          style={{
            padding: '0px',
            backgroundColor: gccFilter === '-' ? '#242b3a' : gccFilter === 'K' ? '#ff6076' : '#3b8d93',
            // return value === 'M' ? { backgroundColor: '#3b8d93', color: 'white' } : { backgroundColor: '#ff6076', color: 'white' };
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleGCCClick}
        >
          CC: ({gccFilter})
        </div>

        {/* GCP Button */}
        <div
          style={{
            padding: '0px',
            backgroundColor: gcpFilter === '-' ? '#242b3a' :
              gcpFilter === 'L1' ? '#75c861' :
                gcpFilter === 'S1' ? '#c46d6d' :
                  gcpFilter === 'L2' ? '#75c861' : '#c46d6d',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleGCPClick}
        >
          CP: ({gcpFilter})
        </div>
        {/* Type Button */}
        <div
          style={{
            padding: '0px',
            backgroundColor: typeFilter === '-' ? '#242b3a' :
              typeFilter === 'L' ? '#75c861' :
                typeFilter === 'S' ? '#c46d6d' : '#242b3a',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleTypeClick}
        >
          T: ({typeFilter})
        </div>
        {/* Viop Button */}
        <div
          style={{
            padding: '0px',
            backgroundColor: viopFilter === '-' ? '#242b3a' :
              viopFilter === true ? '#75c861' :
                viopFilter === false ? '#c46d6d' : '#242b3a',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleViopClick}
        >
          V: ({viopFilter === true ? 'Y' : viopFilter === false ? 'N' : '-'})
        </div>

        
      </div>
      <div className="ag-theme-alpine" style={{ height: '1000px', width: '100%' }}>
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={columnDefs}
          // @ts-ignore
          rowSelection={null}
          pagination={false}
          paginationPageSize={10}
          theme={myTheme}
        />
      </div>
    </div>
  );
};

export default GridKahinMobil;