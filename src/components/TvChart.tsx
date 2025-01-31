import React, { useEffect, useRef, useState } from 'react';

const TvChart = ({ containerId, symbol = 'NASDAQ:AAPL' }) => {
  const container = useRef(null);
  const [scriptId, setScriptId] = useState(generateUniqueScriptId());
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("iframe");
    script.id = scriptId;
    script.src = `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${JSON.stringify({
      "frameElementId": scriptId,
      "width": "300",
      "height": "300",
      "symbol": symbol,
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    })}`;
    script.style.width = "100%";
    script.style.height = "100%";
    script.style.border = "0"; 
    script.style.allowTransparency = "true";

    script.onerror = () => {
      setError(`Error loading TradingView script for chart ${containerId}`);
    };

    container.current.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        container.current.removeChild(existingScript);
      }
    };
  }, [scriptId, symbol]);

  return (
    <div className="nur" id={containerId} ref={container} style={{ height: "1200px", width: "800px" }}>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

function generateUniqueScriptId() {
  return `tradingview-widget-script-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default TvChart;

