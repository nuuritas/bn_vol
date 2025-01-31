import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from "ag-grid-community";
import { CryptoScreenData, getCellStyleGR } from '../shared';
import { fetchCryptoScreenData } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "#242b3a",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);



const GridCryptoScreen = () => {
  const [rowData, setRowData] = useState<CryptoScreenData[]>([]);
  const [summaryData, setSummaryData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 120 },
    // { field: 'high', headerName: 'High', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    // { field: 'low', headerName: 'Low', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    { field: 'close', headerName: 'LP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
    // { 
    //   field: 'm1', 
    //   headerName: '1M', 
    //   sortable: true, 
    //   filter: 'agNumberColumnFilter',
    //   cellStyle: params => getCellStyle(params.value),
    //   valueFormatter: params => formatValue(params.value),
    //   maxWidth: 75 
    // },
    { 
      field: 'm5', 
      headerName: '5M', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'm15', 
      headerName: '15M', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'm30', 
      headerName: '30M', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'h1', 
      headerName: '1H', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'h4', 
      headerName: '4H', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'd1', 
      headerName: '1D', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'w1', 
      headerName: '1W', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    { 
      field: 'month1', 
      headerName: '1M', 
      sortable: true, 
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 60 
    },
    
    { field: 'price_range_ratio', headerName: 'PR%', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'technical_rating', headerName: 'TcR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'osc_rating', headerName: 'OscR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    
    { field: 'vol24h', headerName: 'Vol', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'vol_change', headerName: 'Vol%', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'VWAP', headerName: 'VWAP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 60 },
    { field: 'price_range', headerName: 'PR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 70 },
    // { field: 'volume', headerName: 'Vol', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 90 },
  ], []);

  const getCellStyle = (value: number) => {
    if (value > 0) {
      return { backgroundColor: '#75c861', color: 'white' };
    } else if (value < 0) {
      return { backgroundColor: '#c46d6d', color: 'white' };
    }
    return null; // Default style
  };

  const formatValue = (value: number) => {
    return value ? value.toFixed(2) : '0.00'; // Format to 2 decimal places
  };

  

  const intervals = ['m5', 'm15', 'm30', 'h1', 'h4', "d1", 'w1', 'm1'];

  // Calculate summary metrics
  const calculateSummary = (data: CryptoScreenData[]) => {
    const summary = intervals.map(interval => {
      const mean = data.reduce((acc, row) => acc + row[interval], 0) / data.length;

      const pos_ratio = 100 * (data.filter(row => row[interval] > 0).length / data.length);

      return {
        interval,
        mean: mean.toFixed(2),

        pos_ratio: pos_ratio.toFixed(2) + '%',
      };
    });

    setSummaryData(summary);
  };

  // Column definitions for the summary grid
  const summaryColumnDefs: ColDef[] = useMemo(() => [
    { field: 'interval', headerName: 'Interval', sortable: false, filter: false, maxWidth: 75 },
    { field: 'mean', headerName: 'Mean', sortable: false, filter: false, cellStyle: params => getCellStyleGR(params.value),maxWidth: 75 },
    { field: 'pos_ratio', headerName: 'PR%', sortable: false, filter: false, cellStyle: params => getCellStyleGR(params.value),maxWidth: 75 },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCryptoScreenData();
        setRowData(data.data);
        setLastUpdate(data.last_update);
        calculateSummary(rowData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      finally {
        setLoading(false);
      }
    };
    fetchData();
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
        height: '40px'
      }}>
        Last Update: {lastUpdate}
      </div>
      <h1 style={{ textAlign: 'center' }}> Summary Table </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '225px', 
          width: '100%',   
        }}
      >
      <div style={{ height: '95%', width: '100%', maxWidth:"250px",marginBottom: '5px' }}>
        <AgGridReact
          rowData={summaryData}
          columnDefs={summaryColumnDefs}
          // @ts-ignore
          rowSelection={null}
          pagination={false}
          theme={myTheme}
        />
      </div>
      </div>

      <div className="ag-theme-alpine" style={{ height: '1000px', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={false}
          paginationPageSize={10}
          theme={myTheme}
        />
      </div>
    </div>
  );
};

export default GridCryptoScreen;