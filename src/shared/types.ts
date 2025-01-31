export interface BnPositionsResponse {
    symbol: string;
    positionSide: string;
    positionAmt: string;
    entryPrice: string;
    breakEvenPrice: string;
    markPrice: string;
    unRealizedProfit: string;
    liquidationPrice: string;
    isolatedMargin: string;
    notional: string;
    marginAsset: string;
    isolatedWallet: string;
    initialMargin: string;
    maintMargin: string;
    positionInitialMargin: string;
    openOrderInitialMargin: string;
    adl: number;
    bidNotional: string;
    askNotional: string;
    updateTime: number;
    positionType: string;
    percentChange: string;
}

export interface AgGridPositionParams {
    data: BnPositionsResponse; // Directly use BnPositionsResponse
    value: number;
}

export interface SymbolDataResponse {
    symbol_text: string;
    price_precision: number;
    market: string;
}

export interface KlineDataResponse {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    ticker: string;
    interval: string;
}

export interface PriceDataResponse {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    buy_ratio: number;
}

export interface VWPDataResponse {
    time: number;
    vwp: number;
    total_value: number;
    total_quantity: number;
    price_precision: number;
}

export interface VWPDataFreqResponse {
    time: number;
    vwp: number;
    total_value: number;
    total_quantity: number;
    price_precision: number;
    change: number;
}

export interface FxMatikBoxDataResponse {
    status: number;
    d: string;
    sl: number;
    p: number;
    tp1: number;
    tp2: number;
}

export interface FxMatikBoxLineResponse {
    status: number;
    d: string;
    sl: number;
    p: number;
    tp1: number;
    tp2: number;
}

export interface ChartData extends KlineDataResponse {
    vwp?: number;
}

export interface OrderDataResponse {
    orderId: number;
    symbol: string;
    status: string;
    clientOrderId: string;
    price: number;
    avgPrice: number;
    origQty: number;
    executedQty: number;
    cumQuote: number;
    timeInForce: string;
    type: string;
    reduceOnly: boolean;
    closePosition: boolean;
    side: string;
    positionSide: string;
    stopPrice: number;
    workingType: string;
    priceMatch: string;
    selfTradePreventionMode: string
    goodTillDate: number;
    priceProtect: boolean;
    origType: string;
    time: number;
    updateTime: number;
}

export interface AssetDataResponse {
    time: number;
    main: number;
    card: number;
    margin: number;
    isolatedMargin: number;
    future: number;
    delivery: number;
    saving: number;
    toption: number;
    total: number;
}

export interface GannTrackerResponse {
    symbol: string;
    ae: string;
    rn: string;
    tc: number;
    lcc: string;
    cp: number;
    cc: string;
    gl: number;
    gh: number;
    fl: number;
    fh: number;
    gr: number;
    lp: number;
    market: string;
    viop: boolean;
}

export interface InfoApiResponse {
    data: {
        R1: any[];
        R2: any[];
        R3: any[];
        R4: any[];
    }
}

export interface CryptoScreenResponse {
    data: any[];
    last_update: string;
}

export interface AssetData {
    total: number;
    time: string;
}

export interface CryptoScreenData {
    symbol: string;
    high: number;
    low: number;
    close: number;
    h1: number;
    m1: number;
    d1: number;
    m15: number;
    m5: number;
    h4: number;
    w1: number;
    month1: number;
    volume: number;
    volChange: number;
    vol24h: number;
    VWAP: number;
    technicalRating: number;
    oscRating: number;
    priceRange: number;
    priceRangeRatio: number;
}

export interface CryptoScreenResponse {
    last_update: string;
    data: CryptoScreenData[];
}

export interface PriceChangesResponse {
    [symbol: string]: {
        total_volume: number;
        fxmatik: boolean;
        '5m': number;
        '15m': number;
        '30m': number;
        '1h': number;
        '4h': number;
        '12h': number;
        '24h': number;
        '7d': number;
    }
}

export interface KahinAll {
    [x: string]: any;
    symbol: string;
    last_price: number;
    price: number;
    type: string;
    tp1: number;
    tp2: number;
    sl: number;
    volume: number;
    datetime: string;
    pd_ratio: number;
    change: number;
    change_ratio: number;
    range: number;
    range_ratio: number;
    technical_rating: number;
    market: string;
    sector: string;
    is_viop: boolean;
}

export interface SymbolData {
    symbol_text: string;
    price_precision: number;
    market: string;
}

export interface KahinAllResponse {
    last_update_kahin: string;
    last_update_gann: string;
    data: KahinAll[];
}

export interface FxMatikBoxTable {
    symbol: string;
    T_144: string;
    T_36: string;
    T_52: string;
    T_hayyam: string;
    T_kristal: string;
    S_144: number;
    S_36: number;
    S_52: number;
    S_Hayyam: number;
    S_Kristal: number;
    PD_144: number;
    PD_36: number;
    PD_52: number;
    PD_Hayyam: number;
    PD_Kristal: number;
    PD_KH: number;
    T_KH: string;
    G_HV: number;
    G_HD: number;
    G_LV: number;
    G_LD: number;
    G_LP: number;
  }

export interface FxMatikBoxTableResponse {
    last_update: string;
    data: FxMatikBoxTable[];
}


export interface SRTrackerResponse {
    time: string;
    status: string;
    st: string | null;
    f_key: string;
    f_level: number;
    body_ratio: number;
    range: number;
    close_price: number;
    take_profit: number | null;
    stop_loss: number | null;
    f_b_c: number;
    l_f_r: number;
    c_f_r: number;
    h_f_r: number;
    f_l_l: number;
    f_u_l: number;
    symbol: string;
    status_type: string;
    p_status: string;
    market: string;
    find_type: string;
    p_type: string;
    p_id: number;
    close_ratio: string | null;
    exit_price: string | null;
    exit_time: string | null;
    result: string | null;
    lp: number;
    c_r: number | null;
  }