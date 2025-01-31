
export const calculateFibAndChRange = (min: number, max: number) => {
    const fibRange = 100 * (max - min) / min; // FibRange in percentage
    const chRange = fibRange / 8; // ChRange
    return { fibRange, chRange };
  };
  
  export const calculateFibonacciLevels = (min: number, max: number) => {
    const levels = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
    return levels.map(level => min + (max - min) * level);
  };
  
  export const findCurrentGannRange = (gannData: number[], lastPrice: number) => {
    for (let i = 1; i < gannData.length; i++) {
      const prevPrice = gannData[i - 1];
      const currentPrice = gannData[i];
      if (lastPrice >= Math.min(prevPrice, currentPrice) && lastPrice <= Math.max(prevPrice, currentPrice)) {
        return {
          min: Math.min(prevPrice, currentPrice),
          max: Math.max(prevPrice, currentPrice),
        };
      }
    }
    return null;
  };