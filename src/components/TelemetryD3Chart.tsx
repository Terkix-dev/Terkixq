/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface TelemetryD3ChartProps {
  history: { cpu: number; ping: number }[];
  themeColor: "green" | "amber" | "cyan" | "violet";
}

export default function TelemetryD3Chart({ history, themeColor }: TelemetryD3ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 280, height: 75 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Use ResizeObserver for Desktop-first precision and true fluid layouts without hardcoded window bounds
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(120, width),
        height: Math.max(50, height || 75),
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Safely purge previous frames

    const margin = { top: 8, right: 8, bottom: 8, left: 8 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setup coordinates scales
    const xScale = d3
      .scaleLinear()
      .domain([0, history.length - 1])
      .range([0, chartWidth]);

    const maxVal = d3.max(history, (d) => d.cpu) || 6;
    const minVal = d3.min(history, (d) => d.cpu) || 1;
    
    // Add extra padding so the curve doesn't clip boundaries
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, minVal - 0.5), maxVal + 1.2])
      .range([chartHeight, 0]);

    // Horizontal grid line indicators (classic telemetry scope style)
    const gridLinesCount = 3;
    for (let i = 1; i <= gridLinesCount; i++) {
      const yVal = yScale.domain()[0] + (i * (yScale.domain()[1] - yScale.domain()[0])) / (gridLinesCount + 1);
      const yPos = yScale(yVal);
      g.append("line")
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", chartWidth)
        .attr("y2", yPos)
        .attr("stroke", "#30363D")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2,4")
        .attr("opacity", 0.4);
    }

    // Vertical grid ticks
    const verticalTicksCount = 5;
    for (let i = 1; i < verticalTicksCount; i++) {
      const xPos = (chartWidth / verticalTicksCount) * i;
      g.append("line")
        .attr("x1", xPos)
        .attr("y1", 0)
        .attr("x2", xPos)
        .attr("y2", chartHeight)
        .attr("stroke", "#30363D")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2,4")
        .attr("opacity", 0.35);
    }

    // Smooth spline curves
    const lineGenerator = d3
      .line<{ cpu: number; ping: number }>()
      .x((_, idx) => xScale(idx))
      .y((d) => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<{ cpu: number; ping: number }>()
      .x((_, idx) => xScale(idx))
      .y0(chartHeight)
      .y1((d) => yScale(d.cpu))
      .curve(d3.curveMonotoneX);

    // Color mapper matched to RKix terminal phosphor matrices
    const colors = {
      green: { stroke: "#3FB950", start: "rgba(63, 185, 80, 0.28)", end: "rgba(63, 185, 80, 0)" },
      amber: { stroke: "#D29922", start: "rgba(210, 153, 34, 0.28)", end: "rgba(210, 153, 34, 0)" },
      cyan: { stroke: "#00E5FF", start: "rgba(0, 229, 255, 0.28)", end: "rgba(0, 229, 255, 0)" },
      violet: { stroke: "#BC8CFF", start: "rgba(188, 140, 255, 0.28)", end: "rgba(188, 140, 255, 0)" }
    };

    const palette = colors[themeColor] || colors.green;
    const gradId = `telemetry-d3-grad-${themeColor}`;

    // Append dynamic visual definitions for area gradients
    const defs = svg.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", palette.stroke)
      .attr("stop-opacity", 0.28);

    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", palette.stroke)
      .attr("stop-opacity", 0);

    // Render continuous gradient fill path
    g.append("path")
      .datum(history)
      .attr("d", areaGenerator)
      .attr("fill", `url(#${gradId})`);

    // Render stroke vector path with custom crisp styling
    g.append("path")
      .datum(history)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", palette.stroke)
      .attr("stroke-width", 1.75)
      .attr("stroke-linecap", "round");

    // Interactive/active target indicator
    if (history.length > 0) {
      const idx = history.length - 1;
      const lastItem = history[idx];
      const targetX = xScale(idx);
      const targetY = yScale(lastItem.cpu);

      // Pulsing wave ring
      const pulseRing = g.append("circle")
        .attr("cx", targetX)
        .attr("cy", targetY)
        .attr("r", 4)
        .attr("fill", "none")
        .attr("stroke", palette.stroke)
        .attr("stroke-width", 1)
        .attr("opacity", 0.9);

      pulseRing.append("animate")
        .attr("attributeName", "r")
        .attr("values", "3;8;3")
        .attr("dur", "1.6s")
        .attr("repeatCount", "indefinite");

      pulseRing.append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "0.9;0.1;0.9")
        .attr("dur", "1.6s")
        .attr("repeatCount", "indefinite");

      // Solid central beacon
      g.append("circle")
        .attr("cx", targetX)
        .attr("cy", targetY)
        .attr("r", 2.2)
        .attr("fill", palette.stroke)
        .attr("class", "live-beacon-dot");
    }
  }, [history, dimensions, themeColor]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-16 bg-[#000000]/30 rounded-lg border border-[#30363D]/40 font-mono overflow-hidden relative flex flex-col justify-end"
      id="telemetry-svg-container"
    >
      <div className="absolute top-1.5 left-2 pointer-events-none flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-ping" style={{ backgroundColor: themeColor === "green" ? "#3FB950" : themeColor === "amber" ? "#D29922" : themeColor === "cyan" ? "#00E5FF" : "#BC8CFF" }} />
        <span className="text-[7.5px] uppercase font-bold text-[#8B949E] tracking-widest leading-none">OSCILLOSCOPE FEED</span>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full block" 
        style={{ display: "block" }} 
      />
    </div>
  );
}
