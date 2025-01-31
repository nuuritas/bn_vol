import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from "ag-grid-community";
import { FxMatikBoxTable, FxMatikBoxTableResponse } from '../shared';
import { fetchFxMatikBoxTable } from '../api/api';
const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "#242b3a",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);


type FilterState = '-' | 'L' | 'S';

const GridBoxes = () => {
  const [rowData, setRowData] = useState<FxMatikBoxTable[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, FilterState>>({
    KH: '-',
    KR: '-',
    '144': '-',
    '36': '-',
    '52': '-',
    HY: '-',
  });

  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, maxWidth: 150 },
    { field: 'T_KH', headerName: 'T_KH', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'T_kristal', headerName: 'T_KR', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'T_144', headerName: 'T_144', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'T_36', headerName: 'T_36', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'T_52', headerName: 'T_52', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'T_hayyam', headerName: 'T_HY', sortable: true, filter: 'agTextColumnFilter', maxWidth: 65, cellStyle: params => getTypeCellStyle(params.value) },
    { field: 'G_LP', headerName: 'G_LP', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'G_HV', headerName: 'G_HV', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'G_HD', headerName: 'G_HD', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'G_LV', headerName: 'G_LV', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'G_LD', headerName: 'G_LD', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_KH', headerName: 'PD_KH', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_Kristal', headerName: 'PD_KR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_36', headerName: 'PD_36', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_52', headerName: 'PD_52', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_144', headerName: 'PD_144', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: 'PD_Hayyam', headerName: 'PD_HY', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 80 },
    // { field: 'S_Kristal', headerName: 'S_KR', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    // { field: 'S_36', headerName: 'S_36', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    // { field: 'S_52', headerName: 'S_52', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    // { field: 'S_144', headerName: 'S_144', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
    // { field: 'S_Hayyam', headerName: 'S_HY', sortable: true, filter: 'agNumberColumnFilter', maxWidth: 65 },
  ], []);

  const getTypeCellStyle = (value: string) => {
    return value === 'L' ? { backgroundColor: '#75c861', color: 'white' } : { backgroundColor: '#c46d6d', color: 'white' };
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

  const handleBoxClick = (box: string) => {
    setFilters(prevFilters => {
      const currentState = prevFilters[box];
      const nextState = currentState === '-' ? 'L' : currentState === 'L' ? 'S' : '-';
      return { ...prevFilters, [box]: nextState };
    });
  };

  const filteredRowData = useMemo(() => {
    return rowData.filter(row => {
      return (
        (filters.KH === '-' || row.T_KH === filters.KH) &&
        (filters.KR === '-' || row.T_kristal === filters.KR) &&
        (filters['144'] === '-' || row.T_144 === filters['144']) &&
        (filters['36'] === '-' || row.T_36 === filters['36']) &&
        (filters['52'] === '-' || row.T_52 === filters['52']) &&
        (filters.HY === '-' || row.T_hayyam === filters.HY)
      );
    });
  }, [rowData, filters]);

  useEffect(() => {
    const fetchFxMatikBoxTableData = async () => {
      try {
        const data = await fetchFxMatikBoxTable();
        setRowData(data.data);
        setLastUpdate(data.last_update);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFxMatikBoxTableData();

    // Cleanup function
    return () => {
      setRowData([]); // Clear data on unmount
      setLoading(true); // Reset loading state
      setError(null); // Clear - errors
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
        height: '40px'
      }}>
        Last Update: {formatTimestamp(lastUpdate)}
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '5px', 
        marginBottom: '10px' 
      }}>
        {['KH', 'KR', '144', '36', '52', 'HY'].map(box => (
          <div
            key={box}
            style={{
              padding: '0px',
              backgroundColor: filters[box] === '-' ? '#242b3a' : filters[box] === 'L' ? '#75c861' : '#c46d6d',
              color: '#ffffff',
              cursor: 'pointer',
              borderRadius: '5px',
              textAlign: 'center',
              minWidth: '55px',
            }}
            onClick={() => handleBoxClick(box)}
          >
            {box}({filters[box]})
          </div>
        ))}
      </div>
      <div className="ag-theme-alpine" style={{ height: '1000px', width: '100%' }}>
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={columnDefs}
          pagination={false}
          paginationPageSize={10}
          theme={myTheme}
        />
      </div>
    </div>
  );
};

export default GridBoxes;