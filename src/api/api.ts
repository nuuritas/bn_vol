import axios from 'axios';

import {
  KlineDataResponse, VWPDataResponse,
  VWPDataFreqResponse, PriceDataResponse, FxMatikBoxDataResponse, FxMatikBoxLineResponse,
  SymbolDataResponse,AssetDataResponse,BnPositionsResponse, 
  InfoApiResponse, 
  CryptoScreenResponse,
  GannTrackerResponse,
  PriceChangesResponse,
  KahinAllResponse,
  FxMatikBoxTableResponse,
  SRTrackerResponse,
} from '../shared';
const API_BASE_URL = 'https://goapi.nuritas.tr/api';

export const fetchKlineData = async (
  symbol: string,
  interval: string
): Promise<KlineDataResponse[]> => {
  try {
    const url = `${API_BASE_URL}/klines`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol, interval }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching kline data:', error);
    return [];
  }
};

export const fetchPriceData = async (
  symbol: string,
  interval: string,
  dayback: number
): Promise<PriceDataResponse[]> => {
  try {
    const url = `${API_BASE_URL}/prices`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol, interval, dayback },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching price data:', error);
    return [];
  }
};

export const fetchVWPData = async (
  symbol: string,
  interval: string
): Promise<VWPDataResponse[]> => {
  try {
    const url = `${API_BASE_URL}/vwp`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol, interval },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching VWP data:', error);
    return [];
  }
};

export const fetchVWPDataFreq = async (
  symbol: string,
  interval: string,
  dayback: number
): Promise<VWPDataFreqResponse[]> => {
  try {
    const url = `${API_BASE_URL}/vwpFreq`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol, interval, dayback },
      headers: {
        'Content-Type': 'application/json', // Set content type if needed
        'Accept': 'application/json', // Accept JSON response
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching VWP data Freq:', error);
    return [];
  }
};

export const fetchFxMatikBox = async (
  symbol: string,
): Promise<FxMatikBoxDataResponse[]> => {
  try {
    const url = `${API_BASE_URL}/fxMatikBox`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol },
      headers: {
        'Content-Type': 'application/json', // Set content type if needed
        'Accept': 'application/json', // Accept JSON response
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FxMatikBox data Freq:', error);
    return [];
  }
};

export const fetchFxMatikBoxTable = async (
  symbol: string,
): Promise<FxMatikBoxTableResponse[]> => {
  try {
    const url = `${API_BASE_URL}/fxMatikBoxTable`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol },
      headers: {
        'Content-Type': 'application/json', // Set content type if needed
        'Accept': 'application/json', // Accept JSON response
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FxMatikBox data Freq:', error);
    return [];
  }
};

export const fetchFxMatikBoxLine = async (
  symbol: string,
): Promise<FxMatikBoxLineResponse[]> => {
  try {
    const url = `${API_BASE_URL}/fxMatikBoxLine`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbol },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching FxMatikBoxLine :', error);
    return [];
  }
};


export const fetchGannData = async (symbol: string) => {
  try {
    const url = `${API_BASE_URL}/gann?symbol=${symbol}`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url);
    return response.data.values; // Assuming the API returns { values: [...] }
  } catch (error) {
    console.error('Error fetching Gann data:', error);
    throw error;
  }
};

export const fetchSymbolData = async () => {
  try {
    const url = `${API_BASE_URL}/symbols2`;
    console.log('Requesting URL:', url);
    const response = await axios.get<SymbolDataResponse[]>(url);
    return response.data.values;
  } catch (error) {
    console.error('Error fetching Symbol data:', error);
    throw error;
  }
};

export const fetchSymbolData2 = async () => {
  try {
    const url = `${API_BASE_URL}/symbols2`;
    console.log('Requesting URL:', url);
    const response = await axios.get<SymbolDataResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Symbol data:', error);
    throw error;
  }
};

export const fetchGannTracker = async () => {
  try {
    const url = `${API_BASE_URL}/gannTracker`;
    console.log('Requesting URL:', url);
    const response = await axios.get<GannTrackerResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Symbol data:', error);
    throw error;
  }
};

export const fetchSRTracker = async () => {
  try {
    const url = `${API_BASE_URL}/srTracker`;
    console.log('Requesting URL:', url);
    const response = await axios.get<SRTrackerResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching SR Tracker data:', error);
    throw error;
  }
};

export const fetchAssetData = async () => {
  try {
    const url = `${API_BASE_URL}/apiHistoryAssets`;
    console.log('Requesting URL:', url);
    const response = await axios.get<AssetDataResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Symbol data:', error);
    throw error;
  }
};

export const fetchPositionData = async () => {
  try {
    const url = `${API_BASE_URL}/positions`;
    console.log('Requesting URL:', url);
    const response = await axios.get<BnPositionsResponse[]>(url);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to fetch positions');
  }
};


export const fetchOrderData = async (symbol: string) => {
  try {
    const url = `${API_BASE_URL}/orders?symbol=${symbol}`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Symbol data:', error);
    throw error;
  }
};

export const fetchInfoApiData = async (symbolName: string) => {
  try {
    const url = `${API_BASE_URL}/infoApi`;
    console.log('Requesting URL:', url);
    const response = await axios.get(url, {
      params: { symbolName }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Info API data:', error);
    throw error;
  }
};


export const fetchGannTrackerData = async () => {
  try {
    const url = `${API_BASE_URL}/gannTracker`;
    console.log('Requesting URL:', url);
    const response = await axios.get<GannTrackerResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching Gann Tracker data:', error);
    throw error;
  }
};

export const fetchInfoTableData = async (
  symbolName: string,
  fromDate?: string,
  toDate?: string,
  menkulNo?: number
) => {
  try {
    const url = `${API_BASE_URL}/infoApi`;
    console.log('Requesting URL:', url);
    const response = await axios.get<InfoApiResponse>(url, {
      params: {
        symbolName,
        FROM_ISLEMTARIHI: fromDate,
        TO_ISLEMTARIHI: toDate,
        MENKUL_NO: menkulNo,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Info table data:', error);
    throw error;
  }
};

export const fetchCryptoScreenData = async () => {
  try {
    const url = `${API_BASE_URL}/cryptoScreen`;
    console.log('Requesting URL:', url);
    const response = await axios.get<CryptoScreenResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto screen data:', error);
    throw error;
  }
};

export const fetchInfoOverallOzet = async (date: string) => {
  try {
    const url = `${API_BASE_URL}/infoApi`;
    console.log('Requesting URL:', url);
    const response = await axios.get<InfoApiResponse>(url, {
      params: {
        symbolName: 'INT_OVERALL_OZET',
        OverallTarihi: date,
        OzetOverall: 1,
        T2_TEK_GUN: 0,
        KULLANIM_AMACI: 5,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Overall Ozet data:', error);
    throw error;
  }
};

export const fetchInfoVobOverall = async () => {
  try {
    const url = `${API_BASE_URL}/infoApi`;
    console.log('Requesting URL:', url);
    const response = await axios.get<InfoApiResponse>(url, {
      params: {
        symbolName: 'INT_VOB_OVERRALL',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching VOB Overall data:', error);
    throw error;
  }
};


export const fetchPriceChanges = async () => {
  const url = `${API_BASE_URL}/priceChanges`;
  console.log('Requesting URL:', url);
  try {
    const response = await axios.get<PriceChangesResponse>(url);
    console.log('Response:', response.status, response.statusText);
    return response.data;
  } catch (error) {
    console.error('Error details:', {
      url,
      error: (error as any).response?.status,
      message: (error as any).message,
      data: (error as any).response?.data
    });
    throw error;
  }
};

export const fetchKahinAll = async () => {
  const url = `${API_BASE_URL}/kahinAll`;
  console.log('Requesting URL:', url);
  try {
    const response = await axios.get<KahinAllResponse>(url);
    console.log('Response:', response.status, response.statusText);
    return response.data;
  } catch (error) {
    console.error('Error details:', {
      url,
      error: (error as any).response?.status,
      message: (error as any).message,
      data: (error as any).response?.data
    });
    throw error;
  }
};



