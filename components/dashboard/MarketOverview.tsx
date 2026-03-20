"use client";
import React, { useEffect, useRef, memo } from "react";

function MarketOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear old script if already mounted
    container.current.innerHTML = "";
    
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.current.appendChild(widget);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(76, 175, 80, 1)",
      plotLineColorFalling: "rgba(242, 54, 69, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "#DBDBDB",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: [
        {
          title: "Forex",
          originalTitle: "Forex",
          symbols: [
            { s: "OANDA:XAUUSD", d: "Gold" },
            { s: "FX:EURUSD", d: "Euro USD" },
            { s: "OANDA:USDJPY", d: "USD JPY" },
            { s: "OANDA:AUDJPY", d: "AUD JPY" },
            { s: "OANDA:XAGUSD", d: "Silver" },
          ],
        },
      ],
      support_host: "https://www.tradingview.com",
      backgroundColor: "#0f0f0f",
      width: "100%",
      height: "550",
      showSymbolLogo: true,
      showChart: true,
    });

    container.current.appendChild(script);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright text-xs text-gray-400 mt-2";
    copyright.innerHTML = `
      <a href="https://www.tradingview.com/markets/" rel="noopener noreferrer" target="_blank" class="text-blue-400">
        Market summary
      </a>
      <span class="text-gray-500">by TradingView</span>
    `;
    container.current.appendChild(copyright);
  }, []);

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container}></div>
  );
}

export default memo(MarketOverview);
