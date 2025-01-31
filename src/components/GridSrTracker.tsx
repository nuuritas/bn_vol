import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { themeQuartz } from "ag-grid-community";
import usePersistedState from '../hooks/usePersistedState';
import { SRTrackerResponse } from '../shared';
import { fetchSRTracker } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "#242b3a",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);



const GridSRTracker = () => {
  const [rowData, setRowData] = useState<SRTrackerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarkets, setSelectedMarkets] = usePersistedState('selectedMarkets', ['crypto', 'nasdaq', 'forex', 'index', 'bist']);
  // type CCFilterState = '-' | 'M' | 'K';
  // type RNFilterState = '-' | 'L1' | 'S1' | 'L2' | 'S2';
  // type ViopFilterState = '-' | true | false;
  // // console.log('Selected Markets:', selectedMarkets);

  // const [ccFilter, setCcFilter] = usePersistedState<CCFilterState>('c cFilter', '-');
  // const [rnFilter, setRnFilter] = usePersistedState<RNFilterState>('rnFilter', '-');
  // const [viopFilter, setViopFilter] = usePersistedState<ViopFilterState>('viopFilter', '-');

  // const handleCCClick = () => {
  //   setCcFilter(prev => {
  //     if (prev === '-') return 'M';
  //     if (prev === 'M') return 'K';
  //     return '-';
  //   });
  // };

  // const handleRNClick = () => {
  //   setRnFilter(prev => {
  //     if (prev === '-') return 'L1';
  //     if (prev === 'L1') return 'S1';
  //     if (prev === 'S1') return 'L2';
  //     if (prev === 'L2') return 'S2';
  //     return '-';
  //   });
  // };

  // const handleViopClick = () => {
  //   setViopFilter(prev => {
  //     if (prev === '-') return true;
  //     if (prev === true) return false;
  //     return '-';
  //   });
  // };

  const handleMarketChange = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  const filteredRowData = useMemo(() => {
    return rowData.filter(row => {


      return  selectedMarkets.includes(row.market.toLowerCase());
    });
  }, [rowData, selectedMarkets]);

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 120 },
    { field: 'p_type', headerName: 'PType', sortable: true, maxWidth: 20 },
    { field: 'close_price', headerName: 'Entry', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'lp', headerName: 'LP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    { field: 'take_profit', headerName: 'TP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'stop_loss', headerName: 'SL', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'result', headerName: 'Result', sortable: true, maxWidth: 50,cellStyle: params => getTypeCellStyleGR(params.value) },
    { field: 'c_r', headerName: 'CR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'status', headerName: 'Status', sortable: true, maxWidth: 90 },
    // { field: 'st', headerName: 'ST', sortable: true, maxWidth: 60 },
    { field: 'time', headerName: 'Time', sortable: true, valueFormatter: params => formatDateTime(params.value), maxWidth: 100 },
    { field: 'f_key', headerName: 'Key', sortable: true, maxWidth: 60 },
    { field: 'f_level', headerName: 'Level', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'body_ratio', headerName: 'Body', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'range', headerName: 'Range', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    
    
    // { field: 'f_b_c', headerName: 'FBC', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'l_f_r', headerName: 'LFR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'c_f_r', headerName: 'CFR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'h_f_r', headerName: 'HFR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'f_l_l', headerName: 'FLL', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'f_u_l', headerName: 'FUL', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'status_type', headerName: 'Type', sortable: true, maxWidth: 70 },
    { field: 'p_status', headerName: 'ST', sortable: true, maxWidth: 80 },
    { field: 'market', headerName: 'Market', sortable: true, maxWidth: 80 },
    { field: 'find_type', headerName: 'Find', sortable: true, maxWidth: 70 },
    
    { field: 'close_ratio', headerName: 'CR', sortable: true, maxWidth: 40 },
    { field: 'exit_price', headerName: 'Exit', sortable: true, maxWidth: 40 },
    { field: 'exit_time', headerName: 'ExitTime', sortable: true, valueFormatter: params => formatDateTime(params.value), maxWidth: 180 },
    
  ], []);

  const getTypeCellStyleGR = (value: string | null) => {
    if (value === null || value === undefined) {
      return {};  // No style applied if value is null or undefined
    }
  
    return value.includes('W')
      ? { backgroundColor: '#75c861', color: 'white' }
      : { backgroundColor: '#c46d6d', color: 'white' };
  };
  

  useEffect(() => {
    const fetchSRTrackerData = async () => {
      try {
        const data = await fetchSRTracker();
        // @ts-ignore
        setRowData(data);
        // setLastUpdate(response.data.last_update);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSRTrackerData();

    // Cleanup function
    return () => {
      setRowData([]); // Clear data on unmount
      setLoading(true); // Reset loading state
      setError(null); // Clear any errors
    };
  }, []);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    date.setHours(date.getHours() - 3); // Subtract 3 hours
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  // #region Dimensions
  const getChartDimensions = () => {
    return { width: window.innerWidth, height: window.innerHeight }; // Adjust dimensions as needed
  };

  const dimensions = getChartDimensions();

  return (
    <div>
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
              width: '40px',
              height: '40px',
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100vh', // Full viewport height
          width: '100%',   // Full viewport width
        }}
      >
        <div className="ag-theme-alpine" style={{ height: '80%', width: '100%', maxWidth: "950px", maxHeight:"100vh" }}>
          <AgGridReact
            rowData={filteredRowData}
            columnDefs={columnDefs}
            rowSelection="single"
            onRowSelected={null}
            pagination={false}
            paginationPageSize={10}
            theme={myTheme}
          />
        </div>
        </div>

    </div>
  );
};

export default GridSRTracker;