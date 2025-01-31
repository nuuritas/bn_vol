import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from "ag-grid-community";
import usePersistedState from '../hooks/usePersistedState';
import { GannTrackerResponse } from '../shared';
import { fetchGannTracker } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "#242b3a",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);




const GridGannTracker = () => {
  const [rowData, setRowData] = useState<GannTrackerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarkets, setSelectedMarkets] = usePersistedState('selectedMarkets', ['crypto', 'nasdaq', 'forex', 'index', 'bist']);
  type CCFilterState = '-' | 'M' | 'K';
  type RNFilterState = '-' | 'L1' | 'S1' | 'L2' | 'S2';
  type ViopFilterState = '-' | true | false;
  // console.log('Selected Markets:', selectedMarkets);

  const [ccFilter, setCcFilter] = usePersistedState<CCFilterState>('c cFilter', '-');
  const [rnFilter, setRnFilter] = usePersistedState<RNFilterState>('rnFilter', '-');
  const [viopFilter, setViopFilter] = usePersistedState<ViopFilterState>('viopFilter', '-');

  const handleCCClick = () => {
    setCcFilter(prev => {
      if (prev === '-') return 'M';
      if (prev === 'M') return 'K';
      return '-';
    });
  };

  const handleRNClick = () => {
    setRnFilter(prev => {
      if (prev === '-') return 'L1';
      if (prev === 'L1') return 'S1';
      if (prev === 'S1') return 'L2';
      if (prev === 'L2') return 'S2';
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

  const handleMarketChange = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market)
        ? prev.filter(m => m !== market)
        : [...prev, market]
    );
  };

  const filteredRowData = useMemo(() => {
    return rowData.filter(row => {
      const ccMatch = ccFilter === '-' || row.cc === ccFilter;

      const rnMatch = rnFilter === '-' || row.rn === rnFilter;

      const viopMatch = viopFilter === '-' || row.viop === viopFilter;

      return ccMatch && rnMatch && viopMatch && selectedMarkets.includes(row.market.toLowerCase());
    });
  }, [rowData, ccFilter, viopFilter, rnFilter, selectedMarkets]);

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 120 },
    // { field: 'high', headerName: 'High', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    // { field: 'low', headerName: 'Low', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { field: 'lp', headerName: 'LP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { 
      field: 'ae', 
      headerName: 'ae', 
      sortable: true, 
      valueFormatter: params => formatDateTime(params.value),
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 100
    },
    { 
      field: 'rn', 
      headerName: 'rn', 
      cellStyle: params => getTypeCellStyle1(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'tc', 
      headerName: 'tc', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'lcc', 
      headerName: 'lcc', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'cp', 
      headerName: 'cp', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'cc', 
      headerName: 'cc', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getTypeCellStyle2(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'gl', 
      headerName: 'gl', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'gh', 
      headerName: 'gh', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      // cellStyle: params => getCellStyle(params.value),
      // valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    
    { field: 'fl', headerName: 'fl', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'fh', headerName: 'fh', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'gr', headerName: 'gr', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    
    { field: 'market', headerName: 'market', hide:true },
    { field: 'viop', headerName: 'viop', hide:true },
  ], []);

  const getTypeCellStyle1 = (value: string) => {
    return value.includes('L')
      ? { backgroundColor: '#75c861', color: 'white' }
      : { backgroundColor: '#c46d6d', color: 'white' };
  };

  const getTypeCellStyle2 = (value: string) => {
    return value === 'M' ? { backgroundColor: '#3b8d93', color: 'white' } : { backgroundColor: '#ff6076', color: 'white' };
  };

  useEffect(() => {
    const fetchGannTrackerData = async () => {
      try {
        const data = await fetchGannTracker();
        setRowData(data);
        // setLastUpdate(response.data.last_update);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGannTrackerData();

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
            backgroundColor: ccFilter === '-' ? '#242b3a' : ccFilter === 'K' ? '#ff6076' : '#3b8d93',
            // return value === 'M' ? { backgroundColor: '#3b8d93', color: 'white' } : { backgroundColor: '#ff6076', color: 'white' };
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleCCClick}
        >
          CC: ({ccFilter})
        </div>

        {/* GCP Button */}
        <div
          style={{
            padding: '0px',
            backgroundColor: rnFilter === '-' ? '#242b3a' :
              rnFilter === 'L1' ? '#75c861' :
                rnFilter === 'S1' ? '#c46d6d' :
                  rnFilter === 'L2' ? '#75c861' : '#c46d6d',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
            minWidth: '55px',
          }}
          onClick={handleRNClick}
        >
          CP: ({rnFilter})
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

export default GridGannTracker;