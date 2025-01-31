import React from "react";
import { scaleTime } from "d3-scale";
import { utcDay } from "d3-time";
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last, timeIntervalBarWidth } from "react-stockcharts/lib/utils";

interface CandleStickChartProps {
  data: Array<{
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  width: number;
  ratio: number;
  type?: "svg" | "hybrid";
}
// @ts-ignore
const CandleStickChart = React.forwardRef(({ data, width, ratio, type = "svg" }, ref) => {
  const xAccessor = (d: { date: Date }) => d.date;
  const xExtents = [
    xAccessor(last(data)),
    xAccessor(data[data.length - 100]),
  ];

  return (
    <ChartCanvas
      ref={ref}
      displayXAccessor={xAccessor}
      height={400}
      ratio={ratio}
      width={width}
      margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
      type={type}
      seriesName="MSFT"
      data={data}
      xAccessor={xAccessor}
      xScale={scaleTime()}
      xExtents={xExtents}
    >
      <Chart id={1} yExtents={(d: { high: number; low: number }) => [d.high, d.low]}>
        <XAxis axisAt="bottom" orient="bottom" ticks={6} />
        <YAxis axisAt="left" orient="left" ticks={5} />
        <CandlestickSeries width={timeIntervalBarWidth(utcDay)} />
      </Chart>
    </ChartCanvas>
  );
});

export default fitWidth(CandleStickChart);