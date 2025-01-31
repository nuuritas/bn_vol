import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { themeQuartz } from 'ag-grid-community';
import { getCellStyleGR, formatValue2, formatValueInt } from '../shared';
import { API_BASE_URL } from '../config';
import { fetchInfoApiData } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: '#ffffff',
  backgroundColor: 'transparent',
  headerBackgroundColor: 'transparent',
  rowHoverColor: '#2e374a',
});

ModuleRegistry.registerModules([AllCommunityModule]);

const GridInfoIslem = () => {
  const [rowData, setRowData] = useState([]);
  const [rowDataV, setRowDataV] = useState([]);
  const [rowDataVH, setRowDataVH] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gridState, setGridState] = useState<'V' | 'VH' | 'H'>('V'); // State for grid mode

  const toggleGridState = () => {
    setGridState((prev) => (prev === 'V' ? 'VH' : prev === 'VH' ? 'H' : 'V'));
  };

  // Define column definitions for state 'H'
  const columnDefsH: ColDef[] = useMemo(
    () => [
      {
        field: 'MENKUL_KODU',
        headerName: 'Hisse',
        sortable: true,
        filter: true,
        maxWidth: 90,
      },
      {
        field: 'EMIR',
        headerName: 'Emir',
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => getCellStyleAS(params.value),
        maxWidth: 60,
      },
      {
        field: 'FIYAT',
        headerName: 'Fiyat',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      {
        field: 'NET_TUTAR',
        headerName: 'Net Tutar',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 120,
      },
      {
        field: 'NET_MIKTAR',
        headerName: 'N_Miktar',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValueInt(params.value),
        maxWidth: 80,
      },
      {
        field: 'KOMISYON',
        headerName: 'Komisyon',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 70,
      },
      {
        field: 'ISLEM_TARIHI',
        headerName: 'Islem Tarihi',
        sortable: true,
        sort: 'desc',
        filter: 'agTextColumnFilter',
        maxWidth: 100,
        valueFormatter: (params) => formatDateTime(params.value),
      },
    ],
    []
  );

  // Define column definitions for state 'V'
  const columnDefsVH: ColDef[] = useMemo(
    () => [
      {
        field: 'SOZLESME',
        headerName: 'Hisse',
        maxWidth: 120,
      },
      {
        field: 'ALIS_SATIS',
        headerName: 'PT',
        maxWidth: 40,
        cellStyle: params => getCellStyleAS(params.value),
      },
      {
        field: 'FIYAT',
        headerName: 'FIYAT',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      
      {
        field: 'MIKTAR',
        headerName: 'M',
        valueFormatter: (params) => formatValueInt(params.value),
        maxWidth: 50,
      },
      {
        field: 'SAAT',
        headerName: 'SAAT',
        sortable: true,
        filter: 'agNumberColumnFilter',
        maxWidth: 80,
      },
      {
        field: 'TUTAR',
        headerName: 'TUTAR',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      {
        field: 'GERCEKLESME_TARIHI',
        headerName: 'GERCEKLESME_TARIHI',
        maxWidth: 100,
      },
    ],
    []
  );

  // Define column definitions for state 'V'
  const columnDefsV: ColDef[] = useMemo(
    () => [
      {
        field: 'MENKUL_KODU',
        headerName: 'S',
        maxWidth: 120,
      },
      {
        field: 'AlisSatis',
        headerName: 'PT',
        maxWidth: 40,
      },
      {
        field: 'Fiyat',
        headerName: 'F',
        maxWidth: 50,
      },
      
      {
        field: 'KosulFiyat',
        headerName: 'KF',
        maxWidth: 50,
      },
      {
        field: 'Miktar',
        headerName: 'M',
        maxWidth: 40,
      },
      {
        field: 'ZINCIR_EMIR_TIP',
        headerName: 'ZINCIR_EMIR_TIP',
        maxWidth: 50,
      },
      {
        field: 'KAYIT_ANI',
        headerName: 'KAYIT_ANI',
        maxWidth: 180,
      },
      {
        field: 'ZINCIR_DURUM',
        headerName: 'ZINCIR_DURUM',
        maxWidth: 200,
      },
    ],
    []
  );

  
  const getCellStyleAS = (value: string) => {
    if (value === 'S') {
      return { backgroundColor: '#c12525', color: 'white' };
    } else if (value === 'A') {
      return { backgroundColor: '#359a3d', color: 'white' };
    }
    return null; // Default style
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}`;
  };

  

  useEffect(() => {
    const fetchInfoTable1 = async () => {
      try {
        const data = await fetchInfoTableData(
          'INT_GERCEKLESEN_ISLEMLER',
          '2025-01-01',
          new Date().toISOString().split('T')[0],
          0
        );

        // Transform the data to match the grid structure
        const transformedData = data.data.R1.map((item) => ({
          MENKUL_KODU: item.MENKUL_KODU,
          EMIR: item.EMIR,
          FIYAT: item.FIYAT,
          NET_MIKTAR: item.NET_MIKTAR,
          ALIS_MIKTAR: item.ALIS_MIKTAR,
          ALIS_TUTAR: item.ALIS_TUTAR,
          SATIS_MIKTAR: item.SATIS_MIKTAR,
          SATIS_TUTAR: item.SATIS_TUTAR,
          TUTAR: item.TUTAR,
          NET_TUTAR: item.NET_TUTAR,
          KOMISYON: item.KOMISYON,
          ISLEM_TARIHI: item.ISLEM_TARIHI,
        }));

        setRowData(transformedData);
      } catch (err) {
        // @ts-ignore
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfoTable1();

    // Cleanup function
    return () => {
      setRowData([]); // Clear data on unmount
      setLoading(true); // Reset loading state
      setError(null); // Clear any errors
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchInfoApiData('INT_SENTETIK_EMIR_LISTELEME');
        const transformedData = data.data.R1.map((item) => ({
          Fiyat: item.Fiyat,
          AlisSatis: item.AlisSatis,
          KosulFiyat: item.KosulFiyat,
          Miktar: item.Miktar,
          ZINCIR_DURUM: item.ZINCIR_DURUM,
          ZINCIR_EMIR_TIP: item.ZINCIR_EMIR_TIP,
          MENKUL_KODU: item.MENKUL_KODU,
          KAYIT_ANI: item.KAYIT_ANI,
        }));
        setRowDataV(transformedData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      setRowDataV([]);
      setLoading(true);
      setError(null);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchInfoApiData('INT_VOB_SP_GERCEKLESEN_EMIRLER');
        
        // Transform the data to match the grid structure
        const transformedData = data.data.R1.map((item, index) => ({
          FIYAT: item.FIYAT,
          SAAT: item.SAAT,
          SOZLESME: item.SOZLESME,
          MIKTAR: item.MIKTAR,
          TUTAR: item.TUTAR,
          ALIS_SATIS: item.ALIS_SATIS,
          GERCEKLESME_TARIHI: item.GERCEKLESME_TARIHI,
        }));

        setRowDataVH(transformedData);
      } catch (err) {
        // @ts-ignore
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfoTable3();

    // Cleanup function
    return () => {
      setRowDataVH([]); // Clear data on unmount
      setLoading(true); // Reset loading state
      setError(null); // Clear any errors
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // @ts-ignore
    return <div>Error fetching data: {error.message}</div>;
  }

  // <div
  //         style={{
  //           display: 'flex',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           marginTop: '10px',
  //           marginBottom: '10px',
  //           fontSize: '14px',
  //           color: '#ffffff',
  //           height: '20px',
  //         }}
  //       >
  //         {ozetData}
  //       </div>
  return (
    <div className="app-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100vh', // Full viewport height
          width: '100%', // Full viewport width
        }}
      >
        <div style={{ width: '100%', maxWidth: '700px' }}>
          {/* Toggle Button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center', // Center horizontally
              padding: '0px',
              backgroundColor: 
                  gridState === 'H' ? '#9e167c' : 
                  gridState === 'VH' ? '#3b8d93' : 
                  '#0fe925', // Default color for 'V'
              color: '#ffffff',
              cursor: 'pointer',
              borderRadius: '5px',
              textAlign: 'center',
              maxWidth: '55px',
              margin: '0 auto', // Horizontal centering
              marginBottom: '10px',
              marginTop: '10px',
            }}
            onClick={toggleGridState}
          >
            {gridState === 'H' ? 'H' : gridState === 'VH' ? 'VH' : 'V'}
          </div>

          {/* AgGrid Table */}
          <div
            className="ag-theme-alpine"
            style={{ height: '80%', width: '100%', maxHeight: '700px' }}
          >
            <AgGridReact
              rowData={
                gridState === 'H' ? rowData :
                gridState === 'VH' ? rowDataVH :
                rowDataV // You can specify a different row data for 'V' if needed
              }
              columnDefs={
                gridState === 'H' ? columnDefsH :
                gridState === 'VH' ? columnDefsVH :
                columnDefsV
              }
              // @ts-ignore
              rowSelection={null}
              pagination={false}
              paginationPageSize={10}
              theme={myTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridInfoIslem;