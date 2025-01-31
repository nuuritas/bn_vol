import React from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
import { PriceData, VWPDataFreq, OrderData } from '../shared';
// import { calculateFibAndChRange, calculateFibonacciLevels, findCurrentGannRange } from '../utils/fibonacciUtils';

interface CandlestickChartProps {
  priceData: PriceData[];
  vwpDataFreq: VWPDataFreq[];
  height: number;
  width: number;
  symbol: string;
  interval: string;
  selectedBoxes: { [key: string]: boolean };
  fxMatikBoxLine: FxMatikBoxLine[];
  gannData: number[];
  pricePrecision: number;
  orderData: OrderData[];
}

interface FxMatikBox {
  Status: number;
  Date: string;
  SL: number;
  Price: number;
  TP1: number;
  TP2: number;
}

type FxMatikBoxLine = {
  [key: string]: FxMatikBox;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  priceData,
  vwpDataFreq,
  height,
  width,
  symbol,
  interval,
  selectedBoxes,
  fxMatikBoxLine,
  gannData,
  pricePrecision,
  orderData,
}) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const legendRef = React.useRef<HTMLDivElement>(null);
  const [chart, setChart] = React.useState<IChartApi | null>(null);
  const candlestickSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
  const vwpSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);
  const closeSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<'Histogram'> | null>(null);
  const gannSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);


  // #region Create Chart
  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartInstance = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B2B' },
        horzLines: { color: '#2B2B2B' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: false,
        fontSize: 36,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(191, 180, 180, 0.69)',
        text: `${symbol} ${interval}`,
      },
    });

    setChart(chartInstance);

    return () => {
      if (candlestickSeriesRef.current) {
        chartInstance.removeSeries(candlestickSeriesRef.current);
        candlestickSeriesRef.current = null;
      }
      if (vwpSeriesRef.current) {
        chartInstance.removeSeries(vwpSeriesRef.current);
        vwpSeriesRef.current = null;
      }
      if (volumeSeriesRef.current) {
        chartInstance.removeSeries(volumeSeriesRef.current);
        volumeSeriesRef.current = null;
      }
      if (gannSeriesRef.current) {
        chartInstance.removeSeries(gannSeriesRef.current);
        gannSeriesRef.current = null;
      }
      chartInstance.remove();
      setChart(null);
    };
  }, []);

  // #endregion

  // #region Create Legend
  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create legend container if it doesn't exist
    if (!legendRef.current) {
      const legend = document.createElement('div');
      legend.style.position = 'absolute';
      legend.style.left = '12px';
      legend.style.top = '12px';
      legend.style.zIndex = '1';
      legend.style.fontSize = '14px';
      legend.style.fontFamily = 'sans-serif';
      legend.style.lineHeight = '18px';
      legend.style.fontWeight = '300';
      legend.style.color = 'white';

      // Create rows
      const firstRow = document.createElement('div');
      const secondRow = document.createElement('div');
      legend.appendChild(firstRow);
      legend.appendChild(secondRow);

      // @ts-ignore
      legendRef.current = legend;
      chartContainerRef.current.appendChild(legend);
    }

    return () => {
      if (legendRef.current && chartContainerRef.current) {
        chartContainerRef.current.removeChild(legendRef.current);
        // @ts-ignore
        legendRef.current = null;
      }
    };
  }, []);

  // #endregion

  // #region Main

  React.useEffect(() => {
    if (!chart || !priceData.length ||   !legendRef.current) return;

    const firstRow = legendRef.current.children[0] as HTMLDivElement;
    const secondRow = legendRef.current.children[1] as HTMLDivElement;
    // const pricePrecision = parseInt(String(vwpDataFreq[0].price_precision), 10);
    // const pricePrecision = 4;

    

    // #region Cleanup existing series
    if (candlestickSeriesRef.current) {
      chart.removeSeries(candlestickSeriesRef.current);
      candlestickSeriesRef.current = null;
    }
    if (vwpSeriesRef.current) {
      chart.removeSeries(vwpSeriesRef.current);
      vwpSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }
    if (closeSeriesRef.current) {
      chart.removeSeries(closeSeriesRef.current);
      closeSeriesRef.current = null;
    }
    if (gannSeriesRef.current) {
      chart.removeSeries(gannSeriesRef.current);
      gannSeriesRef.current = null;
    }
    // #endregion

    // #region Candlestick
    if (selectedBoxes['Candle']) {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      
      const minMove = parseFloat((1 / Math.pow(10, pricePrecision)).toFixed(pricePrecision));
      candlestickSeries.applyOptions({
        priceFormat: {
          type: 'price',
          precision: pricePrecision,
          minMove: minMove,
        },
      });

      const candlestickData = priceData.map((k) => ({
        time: k.time,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        buy_ratio: k.buy_ratio,
      }));

      // @ts-ignore
      candlestickSeries.setData(candlestickData.map((k) => ({
          time: k.time,
          open: k.open,
          high: k.high,
          low: k.low,
          close: k.close,
          customValues: { buyRatio: k.buy_ratio },
        }))
      );

      candlestickSeriesRef.current = candlestickSeries;

      if (orderData) {
        console.log("O",orderData);
      // determining the dates for the 'buy' and 'sell' markers added below.
        

        const markers = [
          // {
          //     time: priceData[priceData.length - 48].time,
          //     position: 'aboveBar',
          //     color: '#f68410',
          //     shape: 'circle',
          //     text: 'D',
          // },
        ];
        // markers.push({
        //             time: orderData[1].time,
        //             position: 'aboveBar',
        //             color: '#e91e63',
        //             shape: 'arrowDown',
        //             text: 'Sell @ ' + Math.floor(orderData[1].cumQuote + 2)
        //         });
        for (let i = 0; i < orderData.length; i++) {
          console.log(orderData[i]);
          if (orderData[i].side === 'BUY' && orderData[i].status === 'FILLED') {
            markers.push({
              time: orderData[i].updateTime,
              position: 'belowBar',
              color: '#4CAF50',
              shape: 'arrowUp',
              // text: 'B:' + Math.floor(orderData[i].cumQuote) + '$ @ ' + orderData[i].avgPrice
              text: Number(orderData[i].avgPrice).toFixed(pricePrecision)
            });
          }
          else if (orderData[i].side === 'SELL' && orderData[i].status === 'FILLED') {
            markers.push({
              time: orderData[i].updateTime,
              position: 'aboveBar',
              color: '#e91e63',
              shape: 'arrowDown',
              text: Number(orderData[i].avgPrice).toFixed(pricePrecision)
            });
          } else if (orderData[i].status === 'NEW') {
            if (orderData[i].type === 'TAKE_PROFIT_MARKET') {
                candlestickSeriesRef.current?.createPriceLine({
                price: Number(Number(orderData[i].stopPrice).toFixed(pricePrecision)),
                color: '#1cb137',
                lineWidth: 2,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: true,
                title: `TP`,
                });
            } else if (orderData[i].type === 'STOP_MARKET') {
              candlestickSeriesRef.current?.createPriceLine({
                price: Number(orderData[i].stopPrice),
                color: '#f23645',
                lineWidth: 2,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: true,
                title: `SL`,
              });
            }
          }
          candlestickSeriesRef.current.
            // @ts-ignore
            setMarkers(markers);
        }
      }
    }

    
    // #endregion
    

    
    
    // #region Volume
    const volumeData = priceData.map((p) => ({
      time: p.time,
      value: p.volume,
      color: p.change > 0 ? '#4CAF50' : '#F23645',
    }));

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volumeScale', // set as an overlay by setting a blank priceScaleId
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.9, // highest point of the series will be 70% away from the top
        bottom: 0,
      },
      visible: true,
    });

    volumeSeries.applyOptions({
      priceLineVisible: false,
      visible: true,
    });
    // @ts-ignore
    volumeSeries.setData(volumeData.map((data) => ({
        time: data.time,
        value: data.value,
        color: data.color, // Use the color property
      }))
    );

    volumeSeriesRef.current = volumeSeries;
    // #endregion

    // #region Close
    if (selectedBoxes['Close']) {
      const closeSeries = chart.addLineSeries({
        color: '#ffffff',
        lineWidth: 2,
      });

      const minMove = parseFloat((1 / Math.pow(10, pricePrecision)).toFixed(pricePrecision));
      closeSeries.applyOptions({
        priceLineVisible: false,
        priceFormat: {
          type: 'price',
          precision: pricePrecision,
          minMove: minMove,
        },
      });

      const closeLineData = priceData.map((v) => ({
        time: v.time,
        value: v.close,
      }));

      // @ts-ignore
      closeSeries.setData(closeLineData);
      closeSeriesRef.current = closeSeries;
    }
    // #endregion

    // #region VWP
    if (selectedBoxes['VWP'] && vwpDataFreq.length > 0) {

      console.log(vwpDataFreq);

      const vwpSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });

      const minMove = parseFloat((1 / Math.pow(10, pricePrecision)).toFixed(pricePrecision));
      vwpSeries.applyOptions({
        priceLineVisible: false,
        priceFormat: {
          type: 'price',
          precision: pricePrecision,
          minMove: minMove,
        },
      });

      const vwpLineData = vwpDataFreq.map((v) => ({
        time: v.time,
        value: v.vwp,
      }));

      // @ts-ignore
      vwpSeries.setData(vwpLineData);
      vwpSeriesRef.current = vwpSeries;
    }
    // #endregion

    // #region Gann Series
    if (selectedBoxes['Gann']) {

    
      console.log(gannData);

      const totalRange = gannData[gannData.length - 1] - gannData[0];

      // Iterate through the Gann data and draw horizontal lines
      for (let i = 1; i < gannData.length; i++) {
        let prevPrice = gannData[i - 1];
        let currentPrice = gannData[i];
        const difference = currentPrice - prevPrice;
        const differencePercentage = (difference / totalRange) * 100;

        // Determine the color based on the difference percentage
        const color = differencePercentage > 5 ? '#56f3ff' : '#ff6076';

        // // Adjust prices to avoid overlapping lines
        // if (i > 1) {
        //   prevPrice *= 1.002; // Slightly increase the first value
        //   currentPrice *= 0.998; // Slightly decrease the second value
        // }


        if (candlestickSeriesRef.current) {
          // @ts-ignore
          candlestickSeriesRef.current?.createPriceLine({
            price: prevPrice,
            color: color,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: `G-${i}`,
          });
  
          
          // candlestickSeriesRef.current?.createPriceLine({
          //   price: currentPrice,
          //   color: color,
          //   lineWidth: 2,
          //   lineStyle: LineStyle.Solid,
          //   axisLabelVisible: true,
          //   title: `G-${i}`,
          // });
        }

        if (vwpSeriesRef.current) {
          // @ts-ignore
          vwpSeriesRef.current?.createPriceLine({
            price: prevPrice,
            color: color,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: false,
          });
  
          
          // vwpSeriesRef.current?.createPriceLine({
          //   price: currentPrice,
          //   color: color,
          //   lineWidth: 2,
          //   lineStyle: LineStyle.Solid,
          //   axisLabelVisible: false,
          // });
        }
        
        
      }
  }
    // #endregion

    // #region Fibonacci

      // Add Fibonacci levels if Fib is selected
      if (selectedBoxes['Fib']) {
        const lastPrice = priceData[priceData.length - 1].close;
        const currentGannRange = findCurrentGannRange(gannData, lastPrice);
        const levels = [0, 0.125, 0.236, 0.382, 0.5, 0.618, 0.786, 0.9, 1];
      
        if (currentGannRange) {
          // const { fibRange, chRange } = calculateFibAndChRange(currentGannRange.min, currentGannRange.max);
          const fibLevels = calculateFibonacciLevels(currentGannRange.min, currentGannRange.max);
      
          if (candlestickSeriesRef.current) {
            fibLevels.forEach((level, index) => {
              candlestickSeriesRef.current?.createPriceLine({
                price: level,
                color: "white",
                lineWidth: 1,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: true,
                title: `${levels[index]}`, // Label for the Fibonacci level
              });
            });
          }
        }
      }
    // #endregion

    // #region SelectBoxes
    Object.keys(selectedBoxes).forEach((key) => {
      if (selectedBoxes[key]) {
        // @ts-ignore
        const data = fxMatikBoxLine[key];
        if (data) {
          const myPriceLines = [
            { price: data.sl, title: `SL-${key}`, color: 'red' },
            { price: data.p, title: `O-${key}`, color: 'blue' },
            { price: data.tp1, title: `TP1-${key}`, color: 'green' },
            { price: data.tp2, title: `TP2-${key}`, color: 'orange' },
          ];

          myPriceLines.forEach((line) => {
            const priceLine = {
              price: line.price,
              color: line.color,
              lineWidth: 2,
              lineStyle: 0, // Dashed line
              axisLabelVisible: true,
              title: line.title,
            };

            if (candlestickSeriesRef.current) {
              // @ts-ignore
              candlestickSeriesRef.current.createPriceLine(priceLine);
            }

            if (vwpSeriesRef.current) {
              // @ts-ignore
              vwpSeriesRef.current.createPriceLine(priceLine);
            }
          });
        }
      }
    });

    // #endregion


    // #region Crosshair
    const handleCrosshairMove = (param: any) => {
      if (!param.time) {
        firstRow.innerHTML = ``;
        secondRow.innerHTML = '';
        return;
      }

      const candleData = candlestickSeriesRef.current
        ? param.seriesData.get(candlestickSeriesRef.current)
        : null;
      const vwpPoint = vwpSeriesRef.current ? param.seriesData.get(vwpSeriesRef.current) : null;
      const closePoint = closeSeriesRef.current ? param.seriesData.get(closeSeriesRef.current) : null;
      const volumePoint = volumeSeriesRef.current ? param.seriesData.get(volumeSeriesRef.current) : null;

      if (volumePoint || candleData || vwpPoint || closePoint) {
        // Clear the content of secondRow before updating
        secondRow.innerHTML = '';
      }

      if (volumePoint) {
        const vol = volumePoint.value;
        // Format volume to show in thousands, millions, or billions
        const volFormatted = vol >= 1e12 
            ? (vol / 1e12).toFixed(2) + ' T' // Trillions
            : vol >= 1e9 
            ? (vol / 1e9).toFixed(2) + ' B'  // Billions
            : vol >= 1e6 
            ? (vol / 1e6).toFixed(1) + ' M'  // Millions
            : vol >= 1e3 
            ? (vol / 1e3).toFixed(0) + ' K'  // Thousands
            : vol.toFixed(0);                 // Less than a thousand
        const volColor = volumePoint.color;
        secondRow.innerHTML += `
        <span style="color: white;">Vol:</span> 
        <span style="color: ${volColor};">${volFormatted}</span>
        `;
      }

      if (candleData) {
        const { open, high, low, close, customValues } = candleData;
        const change = close - open;
        const changePercentage = ((change / open) * 100).toFixed(2);
        const changeColor = change >= 0 ? '#4CAF50' : '#F23645';
        const buyRatio = customValues.buyRatio.toFixed(2);
        const buyRatioColor = buyRatio > 50 ? '#4CAF50' : '#F23645';
        const range = high - low;
        const rangePercentage = ((range / open) * 100).toFixed(2);
        const bodyRatio = Math.abs((close - open) / range) * 100;

        firstRow.innerHTML = `
          <span style="color: white;">O:</span> 
          <span style="color: ${changeColor};">${open.toFixed(pricePrecision)}</span> 
          <span style="color: white;">H:</span> 
          <span style="color: ${changeColor};">${high.toFixed(pricePrecision)}</span> 
          <span style="color: white;">L:</span> 
          <span style="color: ${changeColor};">${low.toFixed(pricePrecision)}</span> 
          <span style="color: white;">C:</span> 
          <span style="color: ${changeColor};">${close.toFixed(pricePrecision)}</span> 
          <span style="color: ${changeColor};">(${changePercentage}%)</span> 
        `;

        // Append BR data to secondRow
        secondRow.innerHTML += `
          <span style="color: white;">BuyR:</span> 
          <span style="color: ${buyRatioColor};">${buyRatio}%</span>
          <span style="color: white;">Range:</span> 
          <span style="color: ${changeColor};">${rangePercentage}%</span>
          <span style="color: white;">BodyR:</span> 
          <span style="color: ${changeColor};">${bodyRatio.toFixed(1)}%</span>
        `;
      }

      if (vwpPoint) {
        const vwp = vwpPoint.value;

        // Append VWP data
        secondRow.innerHTML += ` | VWP: ${vwp.toFixed(pricePrecision)}`;
      }

      if (closePoint) {
        const close = closePoint.value;

        // Append Close data
        secondRow.innerHTML += ` | C: ${close.toFixed(pricePrecision)}`;
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // #endregion

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [chart, priceData, vwpDataFreq, selectedBoxes, fxMatikBoxLine, gannData]);

  // #endregion

  // #region Handle Checkbox



  const calculateFibonacciLevels = (min: number, max: number) => {
    const levels = [0, 0.125, 0.236, 0.382, 0.5, 0.618, 0.786, 0.9, 1];
    return levels.map(level => min + (max - min) * level);
  };


  const findCurrentGannRange = (gannData: number[], lastPrice: number) => {
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



  // #endregion

  
  // #region Handle resize
  React.useEffect(() => {
    if (!chart) return;

    chart.applyOptions({
      width,
      height,
    });
  }, [chart, width, height]);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: 'relative', height: `${height}px`, width: `${width}px` }}
    />
  );

  // #endregion
};