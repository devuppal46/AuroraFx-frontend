"use client";
// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import {
  elderRay, ema, discontinuousTimeScaleProviderBuilder, Chart, ChartCanvas,
  CurrentCoordinate, BarSeries, CandlestickSeries, LineSeries, MovingAverageTooltip,
  OHLCTooltip, lastVisibleItemBasedZoomAnchor, XAxis, YAxis, CrossHairCursor,
  EdgeIndicator, MouseCoordinateX, MouseCoordinateY, ZoomButtons, withDeviceRatio,
  bollingerBand, macd, rsi, stochasticOscillator, forceIndex,
  BollingerSeries, BollingerBandTooltip, MACDSeries, MACDTooltip, RSISeries,
  RSITooltip, StochasticSeries, StochasticTooltip, StraightLine, TrendLine,
  FibonacciRetracement, EquidistantChannel,
} from "react-financial-charts";

const margin = { left: 50, right: 48, top: 0, bottom: 24 };
const pricesDisplayFormat = format(".2f");
const fHeight = 100;

const macdAppearance = {
  strokeStyle: { macd: "#FF0000", signal: "#00F300" },
  fillStyle: { divergence: "#4682B4" },
};

const stoAppearance = {
  stroke: { top: "#37a600", middle: "#b8ab00", bottom: "#37a600", dLine: "#EA2BFF", kLine: "#74d400" },
};

const axisStyles = {
  strokeStyle: "#383E55",
  tickLabelFill: "#9EAAC7",
  gridLinesStrokeStyle: "rgba(56, 62, 85, 0.5)",
};

const ema12Calc = ema().id(1).options({ windowSize: 12 }).merge((d, c) => { d.ema12 = c; }).accessor((d) => d?.ema12 ?? undefined);
const ema26Calc = ema().id(2).options({ windowSize: 26 }).merge((d, c) => { d.ema26 = c; }).accessor((d) => d?.ema26 ?? undefined);
const elderCalc = elderRay();
const bbCalc = bollingerBand().merge((d, c) => { d.bb = c; }).accessor((d) => d?.bb ?? undefined);
const macdCalc = macd().options({ fast: 12, slow: 26, signal: 9 }).merge((d, c) => { d.macd = c; }).accessor((d) => d?.macd ?? undefined);
const rsiCalc = rsi().options({ windowSize: 14 }).merge((d, c) => { d.rsi = c; }).accessor((d) => d?.rsi ?? undefined);
const stoCalc = stochasticOscillator().options({ windowSize: 14, kWindowSize: 3, dWindowSize: 3 }).merge((d, c) => { d.sto = c; }).accessor((d) => d?.sto ?? undefined);
const forceCalc = forceIndex().merge((d, c) => { d.force = c; }).accessor((d) => d?.force ?? undefined);

const FinancialChart = ({ data: initialData, width, height, ratio, indicators, activeTool, onToolComplete }: any) => {
  const [enableTrendLine, setEnableTrendLine] = useState(false);
  const [trends, setTrends] = useState([]);
  const [enableFib, setEnableFib] = useState(false);
  const [retracements, setRetracements] = useState([]);
  const [enableChannel, setEnableChannel] = useState(false);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    setEnableTrendLine(activeTool === "trend");
    setEnableFib(activeTool === "fib");
    setEnableChannel(activeTool === "channel");
  }, [activeTool]);

  const onDrawComplete = useCallback((newParts: any, type: string) => {
    if (type === "trend") { setTrends(Array.isArray(newParts) ? newParts : []); setEnableTrendLine(false); onToolComplete?.(); }
    else if (type === "fib") { setRetracements(Array.isArray(newParts) ? newParts : []); setEnableFib(false); onToolComplete?.(); }
    else if (type === "channel") { setChannels(Array.isArray(newParts) ? newParts : []); setEnableChannel(false); onToolComplete?.(); }
  }, [onToolComplete]);

  const processedData = useMemo(() => {
    if (!initialData || initialData.length === 0) return [];
    const validData = initialData.filter((d: any) => d && typeof d.open === 'number' && !isNaN(d.open) && typeof d.high === 'number' && !isNaN(d.high) && typeof d.low === 'number' && !isNaN(d.low) && typeof d.close === 'number' && !isNaN(d.close) && d.date !== undefined);
    if (validData.length === 0) return [];
    if (validData.length < 26) return validData.map((d: any) => ({ ...d }));
    return forceCalc(stoCalc(rsiCalc(macdCalc(bbCalc(elderCalc(ema26Calc(ema12Calc(validData))))))));
  }, [initialData]);

  const hasEnoughDataForEMA = processedData.length >= 26;
  const hasEnoughDataForBB = processedData.length >= 20;
  const hasEnoughDataForRSI = processedData.length >= 14;
  const hasEnoughDataForMACD = processedData.length >= 26;

  const xScaleProvider = useMemo(() => discontinuousTimeScaleProviderBuilder().inputDateAccessor((d: any) => d.date), []);

  const { data, xScale, xAccessor, displayXAccessor } = useMemo(() => {
    if (processedData.length === 0) return { data: [], xScale: null, xAccessor: null, displayXAccessor: null };
    return xScaleProvider(processedData);
  }, [processedData, xScaleProvider]);

  const xExtents = useMemo(() => {
    if (!data.length || !xAccessor) return [0, 1];
    const max = xAccessor(data[data.length - 1]);
    const min = xAccessor(data[Math.max(0, data.length - 100)]);
    return [min, max + 5];
  }, [data, xAccessor]);

  const { mainChartHeight, volumeHeight, origin2, origin3, origin4, origin5, origin6, origin7, lastVisiblePanel } = useMemo(() => {
    const gridHeight = height - margin.top - margin.bottom;
    const vol = indicators?.volume ? 60 : 0;
    let usedHeight = vol;
    if (indicators?.elder) usedHeight += fHeight;
    if (indicators?.macd) usedHeight += fHeight;
    if (indicators?.rsi) usedHeight += fHeight;
    if (indicators?.sto) usedHeight += fHeight;
    if (indicators?.force) usedHeight += fHeight;
    const mainH = Math.max(200, gridHeight - usedHeight);
    let currentY = mainH + vol;
    const o3 = [0, currentY]; if (indicators?.elder) currentY += fHeight;
    const o4 = [0, currentY]; if (indicators?.macd) currentY += fHeight;
    const o5 = [0, currentY]; if (indicators?.rsi) currentY += fHeight;
    const o6 = [0, currentY]; if (indicators?.sto) currentY += fHeight;
    const o7 = [0, currentY];
    const panels = ['volume', 'elder', 'macd', 'rsi', 'sto', 'force'];
    let lastVis = 'main';
    for (let i = panels.length - 1; i >= 0; i--) { if (indicators?.[panels[i]]) { lastVis = panels[i]; break; } }
    return { mainChartHeight: mainH, volumeHeight: vol, origin2: [0, mainH], origin3: o3, origin4: o4, origin5: o5, origin6: o6, origin7: o7, lastVisiblePanel: lastVis };
  }, [height, indicators]);

  if (!initialData || initialData.length === 0) return <div className="text-white text-center p-10">Loading Chart...</div>;
  if (!data.length) return <div className="text-white text-center p-10">Processing Data...</div>;

  return (
    <div className="relative h-full w-full" style={{ touchAction: 'none' }}>
      <ChartCanvas height={height} ratio={ratio} width={width} margin={margin} data={data} displayXAccessor={displayXAccessor} seriesName="Data" xScale={xScale} xAccessor={xAccessor} xExtents={xExtents} zoomAnchor={lastVisibleItemBasedZoomAnchor} zoomEnabled={true} panEnabled={true} clamp={false} maintainZoomOnAdd={true}>
        <Chart id={1} height={mainChartHeight} yExtents={(d: any) => { const h = d?.high ?? 0; const l = d?.low ?? 0; if (h < l) return [l, l + 0.01]; if (h === l) return [l - 0.01, l + 0.01]; return [h, l]; }} padding={{ top: 10, bottom: 20 }}>
          <XAxis showGridLines showTickLabel={lastVisiblePanel === 'main'} {...axisStyles} />
          <YAxis showGridLines tickFormat={pricesDisplayFormat} {...axisStyles} />
          <CandlestickSeries fill={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")} wickStroke={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")} />
          {indicators?.ema && hasEnoughDataForEMA && (<>
            <LineSeries yAccessor={ema12Calc.accessor()} strokeStyle={ema12Calc.stroke()} />
            <LineSeries yAccessor={ema26Calc.accessor()} strokeStyle={ema26Calc.stroke()} />
            {data.length > 0 && ema12Calc.accessor()(data[data.length - 1]) !== undefined && <CurrentCoordinate yAccessor={ema12Calc.accessor()} fillStyle={ema12Calc.stroke()} />}
            {data.length > 0 && ema26Calc.accessor()(data[data.length - 1]) !== undefined && <CurrentCoordinate yAccessor={ema26Calc.accessor()} fillStyle={ema26Calc.stroke()} />}
          </>)}
          {indicators?.bb && hasEnoughDataForBB && (<><BollingerSeries yAccessor={bbCalc.accessor()} /><BollingerBandTooltip origin={[8, 60]} yAccessor={bbCalc.accessor()} options={bbCalc.options()} /></>)}
          {enableTrendLine && <TrendLine enabled={true} type="RAY" snap={false} snapTo={(d: any) => [d.high, d.low]} onComplete={(e: any) => onDrawComplete(e, "trend")} trends={trends} />}
          {enableFib && <FibonacciRetracement enabled={true} type="BOUND" onComplete={(e: any) => onDrawComplete(e, "fib")} retracements={retracements} />}
          {enableChannel && <EquidistantChannel enabled={true} onComplete={(e: any) => onDrawComplete(e, "channel")} channels={channels} />}
          <EdgeIndicator itemType="last" rectWidth={50} fill={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")} lineStroke={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")} displayFormat={pricesDisplayFormat} yAccessor={(d: any) => d.close} />
          <MouseCoordinateY at="right" orient="right" displayFormat={pricesDisplayFormat} />
          {lastVisiblePanel === 'main' && <MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat("%Y-%m-%d %H:%M")} />}
          <OHLCTooltip origin={[8, 16]} textFill="#ffffff" />
          {indicators?.ema && hasEnoughDataForEMA && <MovingAverageTooltip origin={[8, 32]} options={[{ yAccessor: ema12Calc.accessor(), type: "EMA", stroke: ema12Calc.stroke(), windowSize: ema12Calc.options().windowSize }, { yAccessor: ema26Calc.accessor(), type: "EMA", stroke: ema26Calc.stroke(), windowSize: ema26Calc.options().windowSize }]} />}
        </Chart>
        {indicators?.volume && (<Chart id={2} height={volumeHeight} origin={origin2} yExtents={(d: any) => d.volume}><XAxis showGridLines showTickLabel={lastVisiblePanel === 'volume'} {...axisStyles} /><YAxis ticks={2} tickFormat={format(".2s")} {...axisStyles} /><BarSeries yAccessor={(d: any) => d.volume} fill={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")} />{lastVisiblePanel === 'volume' && <MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat("%Y-%m-%d %H:%M")} />}</Chart>)}
        {indicators?.macd && hasEnoughDataForMACD && (<Chart id={4} height={fHeight} yExtents={macdCalc.accessor()} origin={origin4} padding={{ top: 10, bottom: 10 }}><XAxis showGridLines showTickLabel={lastVisiblePanel === 'macd'} {...axisStyles} /><YAxis ticks={4} tickFormat={pricesDisplayFormat} {...axisStyles} /><MouseCoordinateY at="right" orient="right" displayFormat={pricesDisplayFormat} /><MACDSeries yAccessor={macdCalc.accessor()} {...macdCalc.options()} /><MACDTooltip origin={[8, 16]} yAccessor={macdCalc.accessor()} options={macdCalc.options()} appearance={macdAppearance} />{lastVisiblePanel === 'macd' && <MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat("%Y-%m-%d %H:%M")} />}</Chart>)}
        {indicators?.rsi && hasEnoughDataForRSI && (<Chart id={5} height={fHeight} yExtents={[0, 100]} origin={origin5} padding={{ top: 10, bottom: 10 }}><XAxis showGridLines showTickLabel={lastVisiblePanel === 'rsi'} {...axisStyles} /><YAxis ticks={4} tickValues={[30, 50, 70]} {...axisStyles} /><MouseCoordinateY at="right" orient="right" displayFormat={format(".2f")} /><RSISeries yAccessor={rsiCalc.accessor()} /><RSITooltip origin={[8, 16]} yAccessor={rsiCalc.accessor()} options={rsiCalc.options()} />{lastVisiblePanel === 'rsi' && <MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat("%Y-%m-%d %H:%M")} />}</Chart>)}
        <CrossHairCursor />
        <ZoomButtons zoomMultiplier={1.1} zoomText="" textFill="#9EAAC7" />
      </ChartCanvas>
    </div>
  );
};

const FinancialChartWithRatio = withDeviceRatio()(FinancialChart);

const FinancialChartWrapper = (props: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions((prev) => ({ ...prev, width: entry.contentRect.width }));
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "600px" }}>
      {dimensions.width > 0 ? (
        <FinancialChartWithRatio {...props} width={dimensions.width} height={600} />
      ) : null}
    </div>
  );
};

export default FinancialChartWrapper;
