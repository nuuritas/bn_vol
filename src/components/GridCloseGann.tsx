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
  headerBackgroundColor: "transparent",
  rowHoverColor: "#2e374a",
  rowHeight: 30,
});

ModuleRegistry.registerModules([AllCommunityModule]);

interface CloseGannData {
  high: {
    gann_value: number;
    price_diff: number;
  };
  low: {
    gann_value: number;
    price_diff: number;
  };
  last_price: number;
}

interface CloseGannRowData extends CloseGannData {
  symbol: string; // Add symbol as a field
}

const GridCloseGann = () => {
  const [rowData, setRowData] = useState<CloseGannRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'symbol', headerName: 'Symbol', sortable: true, filter: true,
      maxWidth: 100
    },
    {
      field: 'last_price', headerName: 'Price', sortable: true, filter: 'agNumberColumnFilter',
      maxWidth: 90
    },
    {
      field: 'channel_color', headerName: 'CC', sortable: true, filter: 'agTextColumnFilter',
      maxWidth: 70, cellStyle: params => getTypeCellStyle(params.value)
    },
    {
      field: 'channel_percentage', headerName: 'CP', sortable: true, filter: 'agNumberColumnFilter',
      maxWidth: 90
    },
    {
      field: 'high.gann_value', headerName: 'HG', sortable: true, filter: 'agNumberColumnFilter',
      maxWidth: 90
    },
    { field: 'high.price_diff', headerName: 'HD', sort: "asc", sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    {
      field: 'low.gann_value', headerName: 'LG', sortable: true, filter: 'agNumberColumnFilter',
      maxWidth: 90
    },
    { field: 'low.price_diff', headerName: 'LD', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
  ], []);

  const getTypeCellStyle = (value: string) => {
    return value === 'M' ? { backgroundColor: '#3b8d93', color: 'white' } : { backgroundColor: '#ff6076', color: 'white' };
  };


  useEffect(() => {
    const fetchCloseGann = async () => {
      try {
        const response = await axios.get<{ [key: string]: CloseGannData }>('/api/closeGann');
        // Convert the object to an array and add the symbol as a field
        const dataArray = Object.entries(response.data).map(([symbol, data]) => ({
          symbol,
          ...data,
        }));
        setRowData(dataArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCloseGann();

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="ag-theme-alpine" style={{ width: Math.min(750, window.innerWidth), height: '100%', marginTop: "20px", overflowX: 'auto' }}>
        <style>
          {`
      ::-webkit-scrollbar {
        height: 8px;
      }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      `}
        </style>
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

export default GridCloseGann;