import React from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { VWPDataFreq, PriceData } from '../types';

interface TradingChartProps {
  vwpDataFreq: VWPDataFreq[];
  priceData: PriceData[];
  height: number;
  width: string;
  symbol: string;
  interval: string;
}

const Legend: React.FC = () => {
  return (
    <div className="legend">
    </div>
  );
};

export const FreqChart: React.FC<TradingChartProps> = ({ vwpDataFreq, priceData, height, width, symbol, interval, pricePrecision }) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const [chart, setChart] = React.useState<IChartApi | null>(null);
  const legendRef = React.useRef<HTMLDivElement | null>(null);

  const seriesRef = React.useRef<{
    candlestick?: ISeriesApi<"Candlestick">;
    vwp?: ISeriesApi<"Line">;
    close?: ISeriesApi<"Line">;
    volume?: ISeriesApi<"Histogram">;
  }>({});

  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartInstance = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B2B' },
        horzLines: { color: '#2B2B2B' },
      },
      // @ts-ignore
      width: width,
      height: height,
      crosshair: {
        mode: 1,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        visible: true,
        fontSize: 36,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(191, 180, 180, 0.69)',
        text: `${symbol} ${interval}`,
        
      },
    });

    setChart(chartInstance);

    return () => {
      // Clean up series first
      Object.values(seriesRef.current).forEach(series => {
        if (series) {
          try {
            chartInstance.removeSeries(series);
          } catch (e) {
            console.warn('Error removing series:', e);
          }
        }
      });
      // Reset series references
      seriesRef.current = {};
      // Remove the chart
      chartInstance.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!chart || !priceData.length || !vwpDataFreq.length) return;

    const pricePrecision = parseInt(String(vwpDataFreq[0].price_precision), 10);
    // console.log(pricePrecision);


    // Clean up existing series first
    Object.values(seriesRef.current).forEach(series => {
      if (series) {
        try {
          chart.removeSeries(series);
        } catch (e) {
          console.warn('Error removing series:', e);
        }
      }
    });
    seriesRef.current = {};

    // VWP
    const vwpLineData = vwpDataFreq.map(v => ({
      time: v.time,
      value: v.vwp,
      change: v.change
    }));

    const vwpSeries = chart.addLineSeries({
      color: '#19a183',
      lineWidth: 2,
    });

    vwpSeries.applyOptions({
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: pricePrecision,
        minMove: Math.pow(10, -pricePrecision)
      }
    });

    // @ts-ignore
    vwpSeries.setData(vwpLineData);

    const changeMapVwp = new Map(vwpLineData.map(data => [data.time, data.change]));

    // Close

    const closeData = priceData.map(p => ({
      time: p.time,
      value: p.close,
      change: p.change,
      buy_ratio: p.buy_ratio
    }));

    const closeSeries = chart.addLineSeries({
      color: '#ffffff',
      lineWidth: 2,
    });

    closeSeries.applyOptions({
      priceLineVisible: false,
      priceFormat: {
        type: "price",
        precision: pricePrecision,
        minMove: Math.pow(10, -pricePrecision)
      }
    });

    // @ts-ignore
    closeSeries.setData(closeData);

    const changeMapClose = new Map(closeData.map(data => [data.time, data.change]));
    const buyRatioMapClose = new Map(closeData.map(data => [data.time, data.buy_ratio]));

    // Volume

    const volumeData = priceData.map(p => ({
      time: p.time,
      value: p.volume,
      color: p.change > 0 ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255, 82, 82, 0.8)',
    }));

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
          type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });

    volumeSeries.priceScale().applyOptions({
        scaleMargins: {
            top: 0.9, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    });

    // @ts-ignore
    volumeSeries.setData(volumeData.map(data => ({
      time: data.time,
      value: data.value,
      color: data.color, // Use the color property
    })));

    

    // Candlestick

    // const candlestickSeries = chart.addCandlestickSeries({
    //   upColor: '#26a69a',
    //   downColor: '#ef5350',
    //   borderVisible: false,
    //   wickUpColor: '#26a69a',
    //   wickDownColor: '#ef5350',
    //   priceFormat: {
    //     type: "price",
    //     precision: pricePrecision,
    //     minMove: Math.pow(10, -pricePrecision)
    //   }
    // });

    // Legend

    chart.timeScale().fitContent();

    const legend = document.createElement('div');
    legend.style.position = 'absolute';
    legend.style.left = '12px';
    legend.style.top = '12px';
    legend.style.zIndex = '1';
    legend.style.fontSize = '14px';
    legend.style.fontFamily = 'sans-serif';
    legend.style.lineHeight = '18px';
    legend.style.fontWeight = '300';
    // @ts-ignore
    chartContainerRef.current.appendChild(legend);

    const firstRow = document.createElement('div');
    const secondRow = document.createElement('div');
    const thirdRow = document.createElement('div');
    firstRow.style.color = 'white';
    secondRow.style.color = '#19a183';
    legend.appendChild(firstRow);
    legend.appendChild(secondRow);
    legend.appendChild(thirdRow);

    chart.subscribeCrosshairMove(param => {
      // let oFormat = '';
      // let hFormat = '';
      // let lFormat = '';
      // let cFormat = '';
      // let changeFormat = '';
      // let changeColor = 'white';

      if (param.time) {
        // const chartData = param.seriesData.get(candlestickSeries);
        // if (chartData && 'open' in chartData) {
        //   const o = chartData.open;
        //   const h = chartData.high;
        //   const l = chartData.low;
        //   const c = chartData.close;
        //   oFormat = o.toFixed(pricePrecision);
        //   hFormat = h.toFixed(pricePrecision);
        //   lFormat = l.toFixed(pricePrecision);
        //   cFormat = c.toFixed(pricePrecision);

        //   const change = c - o;
        //   const changePercentage = ((change / o) * 100).toFixed(2);
        //   changeFormat = `${change > 0 ? '+' : ''}${changePercentage}%`;
        //   changeColor = change > 0 ? 'green' : 'red';
        // }
        
        

        let vwpFormat = '';
        const vwpDataPoint = param.seriesData.get(vwpSeries);

        if (vwpDataPoint && 'value' in vwpDataPoint) {
          const vwp = vwpDataPoint.value;
          // @ts-ignore
          const vwpChange = changeMapVwp.get(vwpDataPoint.time); 
          vwpFormat = vwp.toFixed(pricePrecision);
          
          // Check if vwpChange is available
          if (vwpChange !== undefined) {
            const changeColor = vwpChange > 0 ? 'green' : 'red'; // Determine color based on change
            secondRow.innerHTML = `vwp: ${vwpFormat} <span style="color: ${changeColor};">C: ${vwpChange.toFixed(3)}%</span>`;
          } else {
            secondRow.innerHTML = `vwp: ${vwpFormat} Change: N/A`;
          }
        }

        let closeFormat = '';
        const closeDataPoint = param.seriesData.get(closeSeries);

        if (closeDataPoint && 'value' in closeDataPoint) {
          const close = closeDataPoint.value;
          // @ts-ignore
          const closeChange = changeMapClose.get(closeDataPoint.time); 
          const buy_ratio = buyRatioMapClose.get(closeDataPoint.time);
          closeFormat = close.toFixed(pricePrecision);
          
          // Check if closeChange is available
          if (closeChange !== undefined) {
            const changeColor = closeChange > 0 ? 'green' : 'red'; // Determine color based on change
            firstRow.innerHTML = `Close: ${closeFormat} <span style="color: ${changeColor};">C: ${closeChange.toFixed(3)} BR: ${buy_ratio.toFixed(2)}%</span>`;
          } else {
            firstRow.innerHTML = `Close: ${closeFormat} Change: N/A`;
          }
          if (buy_ratio !== undefined) {
            const changeColor = buy_ratio > 50 ? 'green' : 'red'; // Determine color based on change
            thirdRow.innerHTML = `<span style="color: ${changeColor};">BR: ${buy_ratio.toFixed(2)}%</span>`;
          } 
        }
      }
    });

    return () => {
      // chart.removeSeries(candlestickSeries);
      // chart.removeSeries(vwpSeries);
      // @ts-ignore
      // chartContainerRef.current.removeChild(legend);
    };
  }, [chart, vwpDataFreq, priceData, symbol]);

  return (
    <div>
      <div ref={chartContainerRef} style={{ position: 'relative', height: '500px' }} />
      <Legend />
    </div>
  );
};