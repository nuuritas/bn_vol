import React, { useState, useEffect } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
import { PriceData, VWPDataFreq } from '../shared';

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
  onCheckboxChange: (name: string) => void; // Add this line
  pricePrecision: number;
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

export const CandlestickChart2: React.FC<CandlestickChartProps> = ({
  priceData,
  // vwpDataFreq,
  height,
  width,
  symbol,
  interval,
  selectedBoxes,
  fxMatikBoxLine,
  gannData,
  onCheckboxChange, // Add this line
  pricePrecision
}) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const legendRef = React.useRef<HTMLDivElement>(null);
  const [chart, setChart] = React.useState<IChartApi | null>(null);
  const candlestickSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
  // const vwpSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);
  const closeSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<'Histogram'> | null>(null);
  const gannSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null);
  const [fibInfo, setFibInfo] = useState<{ fibRange: number; chRange: number } | null>(null);
  const mountedRef = React.useRef(false);
  const initializationTimeoutRef = React.useRef<NodeJS.Timeout>();
  const destroyTimeoutRef = React.useRef<NodeJS.Timeout>();


  const getChartDimensions = () => {
    // if (!containerElement) return { width: '100%', height: 550 };

    let widthSelect;
    if (window.innerWidth < 768) {
      widthSelect = window.innerWidth;
    } else {
      widthSelect = window.innerWidth * 0.95;
    }

    let heightSelect;
    if (window.innerHeight < 768) {
      heightSelect = window.innerHeight * 0.75;
    } else {
      heightSelect = window.innerHeight * 0.755;
    }

    return {
      width: widthSelect,
      height: heightSelect,
    };
  };

  const dimensions = getChartDimensions();

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (destroyTimeoutRef.current) {
        clearTimeout(destroyTimeoutRef.current);
      }
    };
  }, []);

  // #region Create Chart

  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    // Cleanup previous chart with delay
    if (chart) {
      const currentChart = chart;
      destroyTimeoutRef.current = setTimeout(() => {
        if (candlestickSeriesRef.current) {
          currentChart.removeSeries(candlestickSeriesRef.current);
          candlestickSeriesRef.current = null;
        }
        if (volumeSeriesRef.current) {
          currentChart.removeSeries(volumeSeriesRef.current);
          volumeSeriesRef.current = null;
        }
        if (gannSeriesRef.current) {
          currentChart.removeSeries(gannSeriesRef.current);
          gannSeriesRef.current = null;
        }
        currentChart.remove();
        setChart(null);
      }, 10);
    }

    // Initialize new chart with delay
    initializationTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current || !chartContainerRef.current) return;

      const chartInstance = createChart(chartContainerRef.current, {
        width: dimensions.width / 2,
        height: dimensions.height,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#2B2B2B' },
          horzLines: { color: '#2B2B2B' },
        },
        crosshair: {
          mode: 1,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        // watermark: {
        //   visible: true,
        //   fontSize: 36,
        //   horzAlign: 'center',
        //   vertAlign: 'bottom',
        //   color: 'rgba(191, 180, 180, 0.69)',
        //   text: `${symbol} ${interval}`,
        // },
      });

      setChart(chartInstance);
    }, 10);

  }, [symbol, interval]);

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
    if (!chart || !priceData.length || !legendRef.current) return;

    const firstRow = legendRef.current.children[0] as HTMLDivElement;
    const secondRow = legendRef.current.children[1] as HTMLDivElement;
    // const pricePrecision = parseInt(String(vwpDataFreq[0].price_precision), 10);

    // #region Cleanup existing series
    if (candlestickSeriesRef.current) {
      chart.removeSeries(candlestickSeriesRef.current);
      candlestickSeriesRef.current = null;
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
    // if (selectedBoxes['VWP']) {
    //   const vwpSeries = chart.addLineSeries({
    //     color: '#2962FF',
    //     lineWidth: 2,
    //   });

    //   const minMove = parseFloat((1 / Math.pow(10, pricePrecision)).toFixed(pricePrecision));
    //   vwpSeries.applyOptions({
    //     priceLineVisible: false,
    //     priceFormat: {
    //       type: 'price',
    //       precision: pricePrecision,
    //       minMove: minMove,
    //     },
    //   });

    //   const vwpLineData = vwpDataFreq.map((v) => ({
    //     time: v.time,
    //     value: v.vwp,
    //   }));

    //   // @ts-ignore
    //   vwpSeries.setData(vwpLineData);
    //   vwpSeriesRef.current = vwpSeries;
    // }
    // #endregion

    // #region Fibonacci

    // Add Fibonacci levels if Fib is selected
    if (selectedBoxes['Fib']) {
      const lastPrice = priceData[priceData.length - 1].close;
      const currentGannRange = findCurrentGannRange(gannData, lastPrice);

      if (currentGannRange) {
        const { fibRange, chRange } = calculateFibAndChRange(currentGannRange.min, currentGannRange.max);
        setFibInfo({ fibRange, chRange });

        const fibLevels = calculateFibonacciLevels(currentGannRange.min, currentGannRange.max);
        if (candlestickSeriesRef.current) {
          fibLevels.forEach((level, index) => {
            candlestickSeriesRef.current?.createPriceLine({
              price: level,
              color: "white",
              lineWidth: 1,
              lineStyle: LineStyle.Solid,
              axisLabelVisible: true,
              title: `${(index * 0.125).toFixed(3)}`, // Label for the Fibonacci level
            });
          });
        } else {
          setFibInfo(null);
        }
      } else {
        setFibInfo(null); // Clear fibInfo when Fib is deselected
      }
    }
    // #endregion


    // #region Gann Series


    if (selectedBoxes['Gann']) {


      const totalRange = gannData[gannData.length - 1] - gannData[0];

      // Iterate through the Gann data and draw horizontal lines
      for (let i = 1; i < gannData.length; i++) {
        let prevPrice = gannData[i - 1];
        let currentPrice = gannData[i];
        const difference = currentPrice - prevPrice;
        const differencePercentage = (difference / totalRange) * 100;

        // Determine the color based on the difference percentage
        const color = differencePercentage > 5 ? '#56f3ff' : '#ff6076';


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


          candlestickSeriesRef.current?.createPriceLine({
            price: currentPrice,
            color: color,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: `G-${i}`,
          });
        }

        // if (vwpSeriesRef.current) {
        //   // @ts-ignore
        //   vwpSeriesRef.current?.createPriceLine({
        //     price: prevPrice,
        //     color: color,
        //     lineWidth: 2,
        //     lineStyle: LineStyle.Solid,
        //     axisLabelVisible: false,
        //   });


        //   vwpSeriesRef.current?.createPriceLine({
        //     price: currentPrice,
        //     color: color,
        //     lineWidth: 2,
        //     lineStyle: LineStyle.Solid,
        //     axisLabelVisible: false,
        //   });
        // }


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

            // if (vwpSeriesRef.current) {
            //   // @ts-ignore
            //   vwpSeriesRef.current.createPriceLine(priceLine);
            // }
          });
        }
      }
    });

    // #endregion

    // #region Crosshairx

    const handleCrosshairMove = (param: any) => {
      if (!param.time) {
        firstRow.innerHTML = '';
        secondRow.innerHTML = '';
        return;
      }

      const candleData = candlestickSeriesRef.current
        ? param.seriesData.get(candlestickSeriesRef.current)
        : null;
      // const vwpPoint = vwpSeriesRef.current ? param.seriesData.get(vwpSeriesRef.current) : null;
      const closePoint = closeSeriesRef.current ? param.seriesData.get(closeSeriesRef.current) : null;
      const volumePoint = volumeSeriesRef.current ? param.seriesData.get(volumeSeriesRef.current) : null;

      if (volumePoint || candleData || closePoint) {

        secondRow.innerHTML = '';
      }

      if (volumePoint) {
        const vol = volumePoint.value;
        const volColor = volumePoint.color;
        secondRow.innerHTML += `
        <span style="color: white;">Vol:</span> 
        <span style="color: ${volColor};">${vol.toFixed(2)}</span>
        `;
      }

      if (candleData) {
        const { open, high, low, close, customValues } = candleData;
        const change = close - open;
        const changePercentage = ((change / open) * 100).toFixed(2);
        const changeColor = change >= 0 ? '#4CAF50' : '#F23645';
        const buyRatio = customValues.buyRatio.toFixed(2);
        const buyRatioColor = buyRatio > 50 ? '#4CAF50' : '#F23645';

        firstRow.innerHTML = `
          <span style="color: white;">${symbol} | </span> 
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
          <span style="color: white;">BR:</span> 
          <span style="color: ${buyRatioColor};">${buyRatio}%</span>
        `;
      }

      // if (vwpPoint) {
      //   const vwp = vwpPoint.value;

      //   // Append VWP data
      //   secondRow.innerHTML += ` | VWP: ${vwp.toFixed(pricePrecision)}`;
      // }

      if (closePoint) {
        const close = closePoint.value;

        // Append Close data
        secondRow.innerHTML += ` | C: ${close.toFixed(pricePrecision)}`;
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
    // #endregion


  }, [chart, priceData, selectedBoxes, fxMatikBoxLine, gannData, symbol]);
  // vwpDataFreq,
  // #endregion

  // #region Update Watermark
  // React.useEffect(() => {
  //   if (!chart) return;

  //   chart.applyOptions({
  //     watermark: {
  //       visible: true,
  //       fontSize: 36,
  //       horzAlign: 'center',
  //       vertAlign: 'center',
  //       color: 'rgba(191, 180, 180, 0.69)',
  //       text: `${symbol} ${interval}`, // Update the watermark text
  //     },
  //   });
  // }, [chart, symbol, interval]);

  // #endregion

  // #region Handle Checkbox

  const calculateFibAndChRange = (min: number, max: number) => {
    const fibRange = 100 * (max - min) / min; // FibRange in percentage
    const chRange = fibRange / 8; // ChRange
    return { fibRange, chRange };
  };

  const calculateFibonacciLevels = (min: number, max: number) => {
    const levels = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
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

  const handleCheckboxChange = (name: string) => {
    onCheckboxChange(name);
  };

  // #endregion

  // #region Render


  return (
    <div id="candlefulldiv" style={{ height: `${height * 0.8}px` }}>
      {/* Checkboxes Container 800 alıyor.*/}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          position: 'relative', // Ensure the container is positioned relatively
        }}
      >
        {/* <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedBoxes['Candle'] || false}
              onChange={() => handleCheckboxChange('Candle')}
            />
            Candle
          </label>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedBoxes['Gann'] || false}
              onChange={() => handleCheckboxChange('Gann')}
            />
            Gann
          </label>
        </div>
        {/* <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedBoxes['Close'] || false}
              onChange={() => handleCheckboxChange('Close')}
            />
            Close
          </label>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', position: 'relative' }}>
          <label>
            <input
              type="checkbox"
              checked={selectedBoxes['Fib'] || false}
              onChange={() => handleCheckboxChange('Fib')}
            />
            Fib
          </label>
          {selectedBoxes['Fib'] && fibInfo && (
            <div style={{ position: 'absolute', top: '100%', left: '0', whiteSpace: 'nowrap' }}>
              FR: {fibInfo.fibRange.toFixed(2)}% | CR: {fibInfo.chRange.toFixed(2)}%
            </div>
          )}
        </div>
        {fxMatikBoxLine &&
          // @ts-ignore
          Object.keys(fxMatikBoxLine).map((key, index) => {
            // @ts-ignore
            const boxData = fxMatikBoxLine[key];
            const timeString = boxData.d;
            const date = new Date(timeString);
            const formattedDate = `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            const labelColor = boxData.tp1 > boxData.p ? 'green' : 'red';

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginRight: '10px', position: 'relative' }}>
                <label style={{ color: labelColor }}>
                  <input
                    type="checkbox"
                    checked={selectedBoxes[key] || false}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  {`${key.substring(0, 2)}`}
                </label>
                {selectedBoxes[key] && (
                  <div style={{ position: 'absolute', top: '100%', left: '0', whiteSpace: 'nowrap' }}>
                    {`${key}: ${formattedDate}`}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Chart Container */}
      <div
        id = "CdChart2Container"
        ref={chartContainerRef}
        style={{ position: 'relative'}}
      />
    </div>
  );
};

// #endregion

export default CandlestickChart2;