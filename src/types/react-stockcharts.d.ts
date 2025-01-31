declare module 'react-stockcharts/lib/utils' {
    export const last: (array: any[]) => any;
    export const timeIntervalBarWidth: (interval: any) => any;
    // Add any other functions or exports you use from this module
}

declare module 'react-stockcharts/lib/axes' {
    import { Axis } from 'react-stockcharts/lib/axes';
    export const XAxis: typeof Axis;
    export const YAxis: typeof Axis;
}

declare module 'react-stockcharts/lib/series' {
    export const CandlestickSeries: any;
    // Add any other series you use from this module
}

declare module 'react-stockcharts/lib/helper' {
    export const fitWidth: (WrappedComponent: any) => any;
}

declare module 'react-stockcharts' {
    export const ChartCanvas: any;
    export const Chart: any;
    // Add any other components you use from this module
}