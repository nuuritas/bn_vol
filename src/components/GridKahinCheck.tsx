import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { themeQuartz } from "ag-grid-community";


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
}

interface KahinAllResponse {
  last_update: string;
  data: KahinAll[];
}

const GridKahinCheck = () => {
  const [rowData, setRowData] = useState<KahinAll[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarkets, setSelectedMarkets] = useState(['bist', 'nasdaq', 'forex', 'crypto', 'index']);

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 120 },
    // { field: 'last_price', headerName: 'Price', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { field: 'price', headerName: 'Open', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { 
      field: 'type', 
      headerName: 'Type', 
      sortable: true, 
      filter: 'agTextColumnFilter', 
      maxWidth: 30,
    },
    { 
      field: 'result', 
      headerName: 'Result', 
      sortable: true, 
      filter: 'agTextColumnFilter', 
      maxWidth: 30,
      cellStyle: params => getTypeCellStyle(params.value) // Apply cell style based on value
    },
    { field: 'ratio', headerName: 'Ratio', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { field: 'tp1', headerName: 'TP1', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    // { field: 'tp2', headerName: 'TP2', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { field: 'sl', headerName: 'SL', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    
    // { field: 'volume', headerName: 'Vol', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'time_found', headerName: 'TimeFound', sortable: true, sort : "desc",filter: 'agTextColumnFilter', maxWidth: 130, valueFormatter: params => formatDateTime(params.value) },
    { field: 'close_time', headerName: 'CloseTime', sortable: true, sort : "desc",filter: 'agTextColumnFilter', maxWidth: 130, valueFormatter: params => formatDateTime(params.value) },
    // { field: 'pd_ratio', headerName: 'PD%', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    // { field: 'change', headerName: 'C', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'change_ratio', headerName: 'C%', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'range', headerName: 'R', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'range_ratio', headerName: 'R%', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'technical_rating', headerName: 'TR', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'market', headerName: 'M', sortable: true, filter: 'agTextColumnFilter', maxWidth: 50 },
    // { field: 'sector', headerName: 'Sektör', sortable: true, filter: 'agTextColumnFilter', maxWidth: 120 },
  ], []);

  const getTypeCellStyle = (value: string) => {
    return value.includes('tp') ? { backgroundColor: '#75c861', color: 'white' } : { backgroundColor: '#c46d6d', color: 'white' };
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'N/A'; // Handle empty or invalid timestamps

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date parsing

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleMarketChange = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  const filteredRowData = useMemo(() => {
    return rowData.filter(row => selectedMarkets.includes(row.market.toLowerCase()));
  }, [rowData, selectedMarkets]);

  useEffect(() => {
    const fetchFxMatikData = async () => {
      try {
        const response = await axios.get<KahinAllResponse>('/api/kahinCheck'); // Adjust the endpoint as necessary
        setRowData(response.data.data);
        setLastUpdate(response.data.last_update);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFxMatikData();

    // Cleanup function
    return () => {
      setRowData([]); // Clear data on unmount
      setLoading(true); // Reset loading state
      setError(null); // Clear any errors
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

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
        Last Update: {formatTimestamp(lastUpdate)}
      </div>
      <div className="market-filters" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['bist', 'nasdaq', 'forex', 'crypto', 'index'].map(market => (
        <div key={market} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ lineHeight: '1.5' }}>{market.charAt(0).toUpperCase()}</span>
          <input
            type="checkbox"
            checked={selectedMarkets.includes(market)}
            onChange={() => handleMarketChange(market)}
            style={{ verticalAlign: 'middle' }}
          />
        </div>
          ))}
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

export default GridKahinCheck;