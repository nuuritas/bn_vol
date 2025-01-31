import React, { useState, useEffect } from "react";
import RsChart from "../components/RsChart";

interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const RsPage: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [width, setWidth] = useState<number>(800);

  useEffect(() => {
    // Parse and fetch data
    const parseData = (parse: (date: string) => Date) => (d: any) => {
      d.date = parse(d.date);
      d.open = +d.open;
      d.high = +d.high;
      d.low = +d.low;
      d.close = +d.close;
      d.volume = +d.volume;
      return d;
    };

    const fetchData = async () => {
      const parseDate = (date: string) => new Date(date);
      const response = await fetch(
        "https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv"
      );
      const text = await response.text();
      const tsvData = text
        .split("\n")
        .slice(1)
        .map((row) => row.split("\t"))
        .map(([date, open, high, low, close, volume]) => ({
          date: parseDate(date),
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
        }));

      setData(tsvData);
    };

    fetchData();
  }, []);

  return (
    <div>
      {data.length > 0 ? (
        <RsChart data={data} width={width} ratio={1} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default RsPage;