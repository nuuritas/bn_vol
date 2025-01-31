// TradingViewScreener.jsx
import React, { useEffect, useRef, memo } from 'react';

const TradingViewScreener = () => {
  const container = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "defaultScreen": "general",
      "market": "crypto",
      "showToolbar": true,
      "colorTheme": "dark",
      "locale": "en",
      "isTransparent": true
    });

    if (container.current) {
      container.current.appendChild(script);
    }

    // Cleanup function to remove the script on unmount
    return () => {
      if (container.current) {
        container.current.innerHTML = ""; // Clear out the container
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      {/* The TradingView Screener widget will be injected here */}
    </div>
  );
};

export default memo(TradingViewScreener);