import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns'; // Import the date adapter

// Define the structure of the WebSocket data
interface VWAPData {
  time: string;
  vwap: number;
  price: number;
}

const RealTimeChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null); // Store Chart instance
  const [messages, setMessages] = useState<VWAPData[]>([]); // Store WebSocket messages
  const [symbol, setSymbol] = useState('BTCUSDT'); // Default symbol
  const wsRef = useRef<WebSocket | null>(null); // Store WebSocket instance

  // Initialize Chart
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy the existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        // Create a new Chart instance
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [], // Time labels
            datasets: [
              {
                label: 'VWAP',
                data: [], // VWAP values
                borderColor: 'blue',
                fill: false,
                pointRadius: 5,
              },
              {
                label: 'Price',
                data: [], // Price values
                borderColor: 'green',
                fill: false,
                pointRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'minute',
                },
              },
              y: {
                beginAtZero: false,
              },
            },
          },
        });
      }
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');
  
    ws.onopen = () => {
      console.log('WebSocket connection established');
      // Send the initial symbol to the Go server
      ws.send(JSON.stringify({ symbol }));
    };
  
    ws.onmessage = (event) => {
      const data: VWAPData[] = JSON.parse(event.data); // Parse the incoming data as an array
      console.log('WebSocket message received:', data);
  
      // Update messages state
      setMessages(data);
  
      // Update chart if it exists
      if (chartInstanceRef.current) {
        // Clear existing data
        chartInstanceRef.current.data.labels = [];
        chartInstanceRef.current.data.datasets[0].data = [];
        chartInstanceRef.current.data.datasets[1].data = [];
  
        // Add new data
        data.forEach((item) => {
          chartInstanceRef.current!.data.labels?.push(item.time);
          chartInstanceRef.current!.data.datasets[0].data.push(item.vwap); // VWAP
          chartInstanceRef.current!.data.datasets[1].data.push(item.price); // Price
        });
  
        // Update the chart
        chartInstanceRef.current.update();
      }
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  
    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array to run only once
  
  // Send the selected symbol to the Go WebSocket server
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ symbol }));
    }
  }, [symbol]); // Send the symbol when it changes

  return (
    <div>
      <h2>Real-Time VWAP and Price Chart</h2>
      <div>
        <label htmlFor="symbol">Select Symbol: </label>
        <select
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          <option value="BTCUSDT">BTCUSDT</option>
          <option value="ETHUSDT">ETHUSDT</option>
          <option value="BNBUSDT">BNBUSDT</option>
          <option value="ADAUSDT">ADAUSDT</option>
          <option value="DOGEUSDT">DOGEUSDT</option>
        </select>
      </div>
      <canvas ref={chartRef} width="800" height="400"></canvas>
      <h3>WebSocket Messages</h3>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <strong>Time:</strong> {message.time}, <strong>VWAP:</strong> {message.vwap}, <strong>Price:</strong> {message.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RealTimeChart;