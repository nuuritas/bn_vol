import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

import {fetchAssetData, fetchSymbolData2} from '../api/api';
import { formatValue2, formatValueInt, getCellStyleGR, myTheme } from '../shared';
// import { formatValueInt, myTheme } from '../shared';

ModuleRegistry.registerModules([AllCommunityModule]);





const GridBnPositions = () => {
  const [symbolsData, setSymbolsData] = useState<Map<string, number>>(new Map());
  const [processedData, setProcessedData] = useState<BnPositionsResponse[]>([]);
  const [assetData, setAssetData] = useState<AssetData[]>([]);
  const [sparkLinearray, setSparkLineArray] = useState([]);
  const [timeArray, setTimeArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);



  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: 'symbol',
      headerName: 'Symbol',
      maxWidth: 100,
    },
    {
      field: 'positionType',
      headerName: 'PT',
      maxWidth: 40,
    },
    {
      field: 'percentChange',
      headerName: 'P%',
      maxWidth: 70,
      valueGetter: params => parseFloat(params.data.percentChange) || 0,
      valueFormatter: params => formatValue2(params.value),
      comparator: (valueA, valueB) => valueA - valueB,
    },
    {
      field: 'unRealizedProfit',
      headerName: 'PL',
      sortable: true,
      sort: 'desc',
      maxWidth: 60,
      valueGetter: params => parseFloat(params.data.unRealizedProfit) || 0,
      valueFormatter: params => formatValue2(params.value),
      cellStyle: params => getCellStyleGR(params.value),
      comparator: (valueA, valueB) => valueA - valueB,
    },
    {
      field: 'entryPrice',
      headerName: 'O',
      maxWidth: 90,
      valueGetter: params => parseFloat(params.data.entryPrice) || 0,
      valueFormatter: params => {
        const precision = symbolsData.get(params.data.symbol) ?? 2;
        return formatValue2(params.value, precision);
      },
      comparator: (valueA, valueB) => valueA - valueB,
    },
    {
      field: 'markPrice',
      headerName: 'LP',
      maxWidth: 90,
      valueGetter: params => parseFloat(params.data.markPrice) || 0,
      valueFormatter: params => {
        const precision = symbolsData.get(params.data.symbol) ?? 2;
        return formatValue2(params.value, precision);
      },
      comparator: (valueA, valueB) => valueA - valueB,
    },
    {
      field: 'notional',
      headerName: 'Vol',
      sortable: true,
      maxWidth: 70,
      valueGetter: params => parseFloat(params.data.notional) || 0,
      valueFormatter: params => formatValueInt(params.value),
      comparator: (valueA, valueB) => valueA - valueB,
    },
    {
      field: 'positionInitialMargin',
      headerName: 'MR',
      sortable: true,
      maxWidth: 70,
      valueGetter: params => parseFloat(params.data.positionInitialMargin) || 0,
      valueFormatter: params => formatValue2(params.value),
      comparator: (valueA, valueB) => valueA - valueB,
    },
  ], [symbolsData]);

  useEffect(() => {
    const fetchSymbolsData = async () => {
      try {
        const response = await fetchSymbolData2(); // Add `await` here

        const symbolMap = new Map(
          response.map(symbol => [symbol.symbol_text, symbol.price_precision])
        );
  
        // Update state
        setSymbolsData(symbolMap);
      } catch (err) {
        // Handle errors
        setError(err instanceof Error ? err : new Error('Failed to fetch symbols'));
        setLoading(false);
      }
    };
  
    fetchSymbolsData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAssetData();
        setAssetData(response);
        setSparkLineArray(response.map(item => item.total));
        setTimeArray(response.map(item => new Date(item.time)));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch asset data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch positions data only after symbols data is loaded
  useEffect(() => {
    const fetchPositions = async () => {
      if (symbolsData.size === 0) return;

      try {
        const response = await fetchPositionsData();
        setProcessedData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch positions'));
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [symbolsData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="app-container">
      <div className="ag-theme-alpine" style={{ paddingLeft: '1rem', height: '500px', width: '90%', maxWidth: '720px' }}>
      <Stack direction="row" sx={{ width: '100%' }}>
      <Typography>Assest Timeline</Typography>
        <Box sx={{ flexGrow: 1 }}>
          <SparkLineChart
            plotType="line"
            data={sparkLinearray}
            height={100}
            xAxis={{
              scaleType: 'time',
              data: timeArray,
              valueFormatter: (value) => value.toISOString().slice(0,10)
            }}
            title='XX'
          />
        </Box>
      </Stack>
        <AgGridReact
          rowData={processedData}
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

export default GridBnPositions;