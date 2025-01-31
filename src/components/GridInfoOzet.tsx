import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { themeQuartz } from "ag-grid-community";
import { getCellStyleGR, formatValue2, formatValueInt } from '../shared';
import { fetchInfoOverallOzet } from '../api/api';

const myTheme = themeQuartz.withParams({
  spacing: 2,
  foregroundColor: "#ffffff",
  backgroundColor: "transparent",
  headerBackgroundColor: "transparent",
  rowHoverColor: "#2e374a",
});

ModuleRegistry.registerModules([AllCommunityModule]);

const GridInfo = () => {
  const [rowData, setRowData] = useState([]);
  const [rowDataV, setRowDataV] = useState([]);
  const [ozetData, setOzetData] = useState("");
  const [ozetDataV, setOzetDataV] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gridState, setGridState] = useState<'V' | 'H'>('V'); // State for grid mode

  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'TRADE_KODU',
      headerName: 'Hisse',
      sortable: true,
      filter: true,
      maxWidth: 90,
    },

    {
      field: 'KAR_ZARAR_YUZDE',
      headerName: 'KZ%',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellStyle: params => getCellStyleGR(params.value),
      valueFormatter: params => formatValue2(params.value),
      maxWidth: 70,
    },
    {
      field: 'AGIR_ORT',
      headerName: 'Maliyet',
      valueFormatter: params => formatValue2(params.value),
      maxWidth: 75,
    },
    {
      field: 'KAPANIS',
      headerName: 'Fiyat',
      valueFormatter: params => formatValue2(params.value),
      maxWidth: 70,
    },
    {
      field: 'KARZARAR',
      headerName: 'KZ',
      cellStyle: params => getCellStyleGR(params.value),
      valueFormatter: params => formatValue2(params.value),
      maxWidth: 75,
    },
    {
      field: 'T1ADET',
      headerName: 'Adet',
      valueFormatter: params => formatValue2(params.value),
      maxWidth: 60,
    },
    {
      field: 'TUTAR1',
      headerName: 'Tutar',
      sortable: true,
      sort: "desc",
      filter: 'agNumberColumnFilter',
      valueFormatter: params => formatValueInt(params.value),
      maxWidth: 100,
    }
  ], []);

  // Define column definitions for state 'V'
  const columnDefsV: ColDef[] = useMemo(
    () => [
      {
        field: 'VARLIK',
        headerName: 'Hisse',
        maxWidth: 70,
      },
      {
        field: 'UZUN_KISA',
        headerName: 'PT',
        maxWidth: 60,
      },
      {
        field: 'GUNICI_KZ',
        headerName: 'KZ',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        cellStyle: params => getCellStyleGR(params.value),
        maxWidth: 80,
      },

      {
        field: 'MALIYET',
        headerName: 'Maliyet',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      {
        field: 'KAPANIS',
        headerName: 'Fiyat',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      {
        field: 'PARASAL_TUTAR',
        headerName: 'Hacim',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => formatValue2(params.value),
        maxWidth: 80,
      },
      {
        field: 'NET_POZISYON',
        headerName: 'Net',
        maxWidth: 50,
      },
      {
        field: 'GEREKLI_BASLANGIC',
        headerName: 'Marj',
        maxWidth: 80,
        valueFormatter: (params) => formatValueInt(params.value),
      },
    ],
    []
  );

  const toggleGridState = () => {
    setGridState((prevState) => (prevState === 'H' ? 'V' : 'H'));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchInfoOverallOzet(new Date().toISOString().split('T')[0]);
        const transformedData = data.data.R3.map(item => ({
          TRADE_KODU: item.TRADE_KODU,
          T1ADET: item.T1ADET,
          AGIR_ORT: item.MALIYET,
          KAPANIS: item.KAPANIS,
          KARZARAR: item.KARZARAR,
          KAR_ZARAR_YUZDE: item.KAR_ZARAR_YUZDE,
          TUTAR1: item.TUTAR1,
        }));

        const overalAllTl = Math.round(data.data.R5.find(item => item.SIRA_NO === 9)?.T2BAKIYE || 0);
        const overalAllVadeli = Math.round(data.data.R2.find(item => item.ANA === 3230)?.T2ADET || 0);
        const overalAllHisse = Math.round(overalAllTl - overalAllVadeli);

        setOzetData(`Total: ${overalAllTl}, Hisse: ${overalAllHisse}, Vadeli: ${overalAllVadeli}`);
        setRowData(transformedData);
      } catch (err) {
        setError(err);
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

  useEffect(() => {
    const fetchInfoTable2 = async () => {
      try {
        const response = await axios.get('/api/infoApi', {
          params: {
            symbolName: 'INT_VOB_OVERRALL',
          },
        });
        const data = response.data;

        // Transform the data to match the grid structure
        const transformedData = data.data.R2.map((item, index) => ({
          GUNICI_KZ: item.GUNICI_KZ,
          KAPANIS: item.KAPANIS,
          MALIYET: item.MALIYET,
          NET_POZISYON: item.NET_POZISYON,
          PARASAL_TUTAR: item.PARASAL_TUTAR,
          UZUN_KISA: item.UZUN_KISA,
          VARLIK: item.VARLIK.split(' ')[0],
          GEREKLI_BASLANGIC: data.data.R3[index]?.GEREKLI_BASLANGIC || null, // Add R3 data if it exists
        }));

        console.log(transformedData);

        setRowDataV(transformedData);

        const ozetDataVRaw = data.data.R4.map((item) => ({
          ACIK_POZISYON_PARASAL_TUTAR: item.ACIK_POZISYON_PARASAL_TUTAR,
          CEKILEBILIR_TEMINAT: item.CEKILEBILIR_TEMINAT,
          GEREKLI_BASLANGIC_TOPLAMI: item.GEREKLI_BASLANGIC_TOPLAMI,
          KULLANILABILIR_TEMINAT: item.KULLANILABILIR_TEMINAT,
          TEMINAT_TOPLAMI: item.TEMINAT_TOPLAMI,
        }));

        console.log(ozetDataVRaw)

        setOzetDataV(`T: ${Math.round(ozetDataVRaw[0].TEMINAT_TOPLAMI || 0)}, 
        G: ${Math.round(ozetDataVRaw[0].GEREKLI_BASLANGIC_TOPLAMI || 0)}  
        A: ${Math.round(ozetDataVRaw[0].ACIK_POZISYON_PARASAL_TUTAR || 0)}, 
        Ç: ${Math.round(ozetDataVRaw[0].CEKILEBILIR_TEMINAT || 0)}, 
          `);

      } catch (err) {
        // @ts-ignore
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfoTable2();

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
    // @ts-ignore
    return <div>Error fetching data: {error.message}</div>;
  }

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
              justifyContent: 'center',
              padding: '0px',
              backgroundColor: gridState === 'H' ? '#9e167c' : '#3b8d93',
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
            {gridState === 'V' ? 'V' : 'H'}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '10px',
              marginBottom: '10px',
              fontSize: '14px',
              color: '#ffffff',
              height: '20px',
            }}
          >
            {gridState === 'V' ? ozetDataV : ozetData}
          </div>

          {/* AgGrid Table */}
          <div
            className="ag-theme-alpine"
            style={{ height: '80%', width: '100%', maxHeight: '700px' }}
          >
            <AgGridReact
              rowData={gridState === 'V' ? rowDataV : rowData}
              columnDefs={gridState === 'V' ? columnDefsV : columnDefs}
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
}
export default GridInfo;