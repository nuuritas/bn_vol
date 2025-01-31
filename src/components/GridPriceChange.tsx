import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from "ag-grid-community";
import { fetchPriceChanges } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "transparent",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);

const GridPriceChange = () => {
  const [rowData, setRowData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervals = ['5m', '15m', '30m', '1h', '4h', '12h', '24h', '7d'];

  // Calculate summary metrics
  const calculateSummary = (data) => {
    const summary = intervals.map(interval => {
      const mean = data.reduce((acc, row) => acc + row[interval], 0) / data.length;
      const w_mean = data.reduce((acc, row) => acc + row[interval] * row.total_volume, 0) / data.reduce((acc, row) => acc + row.total_volume, 0);

      const fxData = data.filter(row => row.fxmatik);
      const fx_mean = fxData.reduce((acc, row) => acc + row[interval], 0) / fxData.length;
      const fx_w_mean = fxData.reduce((acc, row) => acc + row[interval] * row.total_volume, 0) / fxData.reduce((acc, row) => acc + row.total_volume, 0);

      const pos_ratio = 100 * (fxData.filter(row => row[interval] > 0).length / fxData.length);

      return {
        interval,
        mean: mean.toFixed(2),
        w_mean: w_mean.toFixed(2),
        fx_mean: fx_mean.toFixed(2),
        fx_w_mean: fx_w_mean.toFixed(2),
        pos_ratio: pos_ratio.toFixed(2) + '%',
      };
    });

    setSummaryData(summary);
  };

  // Column definitions for the main grid
  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol_text', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 150 },
    { field: 'total_volume', headerName: '24HVol', sortable: true, filter: 'agNumberColumnFilter', valueFormatter: params => formatValue(params.value), maxWidth: 120 },
    ...intervals.map(interval => ({
      field: interval,
      headerName: interval,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyle(params.value),
      valueFormatter: params => formatValue(params.value),
      maxWidth: 75,
    })),
    {
      field: 'fxmatik',
      headerName: 'FXM',
      sortable: true,
      filter: 'agBooleanColumnFilter',
      maxWidth: 100
    },
  ], []);

  // Column definitions for the summary grid
  const summaryColumnDefs: ColDef[] = useMemo(() => [
    { field: 'interval', headerName: 'Int', sortable: false, filter: false, maxWidth: 50 },
    { field: 'mean', headerName: 'M.', sortable: false, filter: false, cellStyle: params => getCellStyle(params.value), maxWidth: 50 },
    { field: 'w_mean', headerName: 'W.M.', sortable: false, filter: false, cellStyle: params => getCellStyle(params.value), maxWidth: 60 },
    { field: 'fx_mean', headerName: 'Fx.M.', sortable: false, filter: false, cellStyle: params => getCellStyle(params.value), maxWidth: 60 },
    { field: 'fx_w_mean', headerName: 'FX.W.M.', sortable: false, filter: false, cellStyle: params => getCellStyle(params.value), maxWidth: 60 },
    { field: 'pos_ratio', headerName: 'PR%', sortable: false, filter: false, cellStyle: params => getCellStyle(params.value), maxWidth: 120 },
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
    return value ? value.toFixed(2) : '0.000'; // Format to 3 decimal places
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('API_BASE_URL:', import.meta.env.VITE_API_URL);
        const data = await fetchPriceChanges();
        console.log('Received data:', data);
        const formattedData = Object.keys(data).map(symbol => ({
          symbol_text: symbol,
          total_volume: data[symbol].total_volume,
          ...data[symbol],
        }));
        
        setRowData(formattedData);
        calculateSummary(formattedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch price changes'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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
    return <div>Error fetching data: {error.message}</div>;
  }

  return (
    <div className="app-container">
      {/* Summary Grid */}
      <h1 style={{ textAlign: 'center' }}> Summary Table </h1>
      <div className="ag-theme-alpine" style={{ height: '220px', width: '100%', marginBottom: '20px' }}>
        <AgGridReact
          rowData={summaryData}
          columnDefs={summaryColumnDefs}
          rowSelection={null}
          pagination={false}
          theme={myTheme}
        />
      </div>

      {/* Main Grid */}
      <div className="ag-theme-alpine" style={{ height: '800px', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection={null}
          pagination={false}
          paginationPageSize={10}
          theme={myTheme}
        />
      </div>
    </div>
  );
};

export default GridPriceChange;