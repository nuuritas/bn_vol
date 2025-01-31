import { themeQuartz } from "ag-grid-community";

export const formatValue2 = (value: string | number, precision: number = 2) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numericValue) ? numericValue.toFixed(precision) : '0';
};

export const formatValueInt = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numericValue) ? Math.round(numericValue).toString() : '0';
};


export const myTheme = themeQuartz.withParams({
    spacing: 2,
    foregroundColor: "#ffffff",
    backgroundColor: "transparent",
    headerBackgroundColor: "transparent",
    rowHoverColor: "#2e374a",
  });

export const getCellStyleGR = (value: number) => {
    if (value > 0) return { backgroundColor: '#75c861', color: 'white' };
    if (value < 0) return { backgroundColor: '#c46d6d', color: 'white' };
    return null;
  };