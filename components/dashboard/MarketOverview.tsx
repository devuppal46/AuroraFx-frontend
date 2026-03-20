"use client";
import React, { useEffect, useRef, memo } from "react";

function MarketOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear old script if already mounted
    container.current.innerHTML = "";

    const scriptWrapper = document.createElement("div");
    scriptWrapper.className = "tradingview-widget-container__widget h-[550px] w-full";
    container.current.appendChild(scriptWrapper);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "1M",
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showFloatingTooltip: true,
      plotLineColorGrowing: "rgba(45, 212, 191, 1)", // Teal/Primary
      plotLineColorFalling: "rgba(244, 63, 94, 1)",
      gridLineColor: "rgba(255, 255, 255, 0.05)",
      scaleFontColor: "rgba(255, 255, 255, 0.6)",
      belowLineFillColorGrowing: "rgba(45, 212, 191, 0.12)",
      belowLineFillColorFalling: "rgba(244, 63, 94, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(45, 212, 191, 0)",
      belowLineFillColorFallingBottom: "rgba(244, 63, 94, 0)",
      symbolActiveColor: "rgba(255, 255, 255, 0.05)",
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
      backgroundColor: "#000000",
      width: "100%",
      height: "550",
      showSymbolLogo: true,
      showChart: true,
    });

    scriptWrapper.appendChild(script);
  }, []);

  return (
    <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
      <div className="tradingview-widget-container w-full h-[550px]" ref={container}>
        {/* Script mounts here */}
      </div>
    </div>
  );
}

export default memo(MarketOverview);
