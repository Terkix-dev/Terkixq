/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  GitBranch, 
  Globe, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Layers, 
  Play 
} from "lucide-react";
import { Project, Agent } from "../types";

interface DashboardOverviewProps {
  project: Project;
  agents: Agent[];
  setCurrentSection: (sec: string) => void;
  onRunPresetCommand: (cmd: string) => void;
  totalCommandsRun: number;
}

export default function DashboardOverview({
  project,
  agents,
  setCurrentSection,
  onRunPresetCommand,
  totalCommandsRun,
}: DashboardOverviewProps) {
  const [systime, setSystime] = useState<string>(new Date().toISOString());
  const [cpuUsage, setCpuUsage] = useState<number>(12);
  const [memoryUsed, setMemoryUsed] = useState<number>(3.15); // in GB

  // Update system indicators periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setSystime(new Date().toISOString());
    }, 1000);

    const metricsTimer = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 15) - 7;
        return Math.min(Math.max(prev + delta, 4), 62);
      });
      setMemoryUsed(prev => {
        const delta = (Math.random() * 0.1) - 0.05;
        return Number(Math.min(Math.max(prev + delta, 2.8), 4.2).toFixed(2));
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(metricsTimer);
    };
  }, []);

  const totalLinesOfCode = project.files.reduce((acc, current) => {
    return acc + current.content.split("\n").length;
  }, 0);

  const presets = [
    { label: "Scaffold Landing Page Info", cmd: "build a modern feature gallery with beautiful responsive bento grids" },
    { label: "Refactor Theme Style", cmd: "edit index.html to add a glowing neon violet header and improve branding typography" },
    { label: "Deploy to Production", cmd: "deploy production to Vercel and check route health" },
    { label: "Run Agent Debug Task", cmd: "fix all typescript lint warnings inside App.tsx and simplify states" }
  ];

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full px-3 md:px-4 py-3 md:py-4 overflow-hidden" id="dashboard-container">
      {/* OS Banner */}
      <div className="p-3 md:p-6 rounded-lg md:rounded-xl bg-gradient-to-r from-[#161B22] to-[#0D1117] border border-[#30363D] flex flex-col justify-between gap-3 w-full overflow-hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 md:h-2.5 md:w-2.5 bg-[#3FB950] rounded-full animate-ping flex-shrink-0"></span>
            <span className="text-[10px] md:text-xs font-mono text-[#3FB950] font-semibold tracking-wider uppercase">RKIX CORE</span>
          </div>
          <h2 className="text-lg md:text-2xl font-black text-white tracking-tight truncate">RKix Terminal OS</h2>
          <p className="text-[11px] md:text-xs text-[#8B949E] mt-1 truncate">
            Project: <span className="text-[#58A6FF] font-semibold font-mono">{project.name}</span>
          </p>
        </div>
        <div className="flex gap-2 text-[9px] md:text-xs font-mono bg-[#0D1117]/80 p-2 md:p-3 rounded border border-[#30363D] w-full overflow-x-auto whitespace-nowrap">
          <div className="text-[#8B949E] flex-shrink-0">
            SYS: <span className="text-white font-semibold">{systime.split("T")[1].slice(0, 8)}</span>
          </div>
          <span className="text-[#30363D] hidden sm:inline flex-shrink-0">•</span>
          <div className="text-[#8B949E] flex-shrink-0">
            CPU: <span className="text-[#58A6FF] font-semibold">{cpuUsage}%</span>
          </div>
          <span className="text-[#30363D] hidden sm:inline flex-shrink-0">•</span>
          <div className="text-[#8B949E] flex-shrink-0">
            RAM: <span className="text-[#3FB950] font-semibold">{memoryUsed}GB</span>
          </div>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 w-full">
        {/* Metric 1 */}
        <div className="p-2 md:p-4 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className="text-[9px] md:text-xs text-[#8B949E] font-medium font-mono truncate">FILES</span>
            <HardDrive size={14} className="text-[#8B949E] flex-shrink-0 ml-1" />
          </div>
          <div className="text-lg md:text-2xl font-extrabold text-white font-mono">{project.files.length}</div>
          <div className="text-[9px] md:text-[11px] text-[#8B949E] mt-0.5 md:mt-1 truncate">
            <span className="text-[#58A6FF] font-mono">{totalLinesOfCode}</span> LOC
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-2 md:p-4 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className="text-[9px] md:text-xs text-[#8B949E] font-medium font-mono truncate">GIT</span>
            <GitBranch size={14} className="text-[#8B949E] flex-shrink-0 ml-1" />
          </div>
          <div className="text-lg md:text-2xl font-extrabold text-white font-mono">{project.commitHistory.length}</div>
          <div className="text-[9px] md:text-[11px] text-[#8B949E] mt-0.5 md:mt-1 truncate">
            <span className="text-[#D29922] font-mono font-semibold">{project.activeBranch}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-2 md:p-4 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className="text-[9px] md:text-xs text-[#8B949E] font-medium font-mono truncate">LIVE</span>
            <Globe size={14} className="text-[#8B949E] flex-shrink-0 ml-1" />
          </div>
          <div className="text-lg md:text-2xl font-extrabold text-[#3FB950] font-mono">
            {project.deployments.filter(d => d.status === "live").length}
          </div>
          <div className="text-[9px] md:text-[11px] text-[#8B949E] mt-0.5 md:mt-1 truncate">
            Services
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-2 md:p-4 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300 hidden sm:block lg:block">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <span className="text-[9px] md:text-xs text-[#8B949E] font-medium font-mono truncate">RUNS</span>
            <Terminal size={14} className="text-[#8B949E] flex-shrink-0 ml-1" />
          </div>
          <div className="text-lg md:text-2xl font-extrabold text-white font-mono">{totalCommandsRun}</div>
          <div className="text-[9px] md:text-[11px] text-[#8B949E] mt-0.5 md:mt-1 truncate">
            Commands
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 w-full">
        {/* Left column: Quick Shell Commands */}
        <div className="lg:col-span-2 space-y-3 md:space-y-6 w-full">
          <div className="p-3 md:p-5 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-[#30363D] pb-2">
              <Zap size={14} className="text-[#58A6FF] flex-shrink-0" />
              <h3 className="font-bold text-white text-[12px] md:text-sm truncate">Presets</h3>
            </div>
            <p className="text-[10px] md:text-xs text-[#8B949E] mb-3 md:mb-4 line-clamp-2">
              Click to run in Agent Terminal:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full" id="dashboard-preset-commands">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  id={`preset-cmd-${index}`}
                  onClick={() => {
                    setCurrentSection("terminal");
                    onRunPresetCommand(preset.cmd);
                  }}
                  className="p-2 md:p-3 bg-[#0D1117] hover:bg-[#1f2631] border border-[#30363D]/80 rounded text-left transition duration-200 group flex justify-between items-center text-[10px] md:text-xs w-full min-w-0"
                >
                  <div className="space-y-0.5 md:space-y-1 pr-2 min-w-0 flex-1">
                    <span className="font-bold text-white block group-hover:text-[#58A6FF] transition truncate text-[10px] md:text-xs">
                      {preset.label}
                    </span>
                    <span className="text-[#8B949E] block overflow-hidden text-ellipsis whitespace-nowrap text-[9px] md:text-[10px] font-mono truncate">
                      $ {preset.cmd.substring(0, 25)}
                    </span>
                  </div>
                  <Play size={12} className="text-[#8B949E] group-hover:text-[#3FB950] flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Project Details Panel */}
          <div className="p-3 md:p-5 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] w-full overflow-hidden">
            <div className="flex justify-between items-center mb-3 md:mb-4 border-b border-[#30363D] pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Layers size={14} className="text-[#D29922] flex-shrink-0" />
                <h3 className="font-bold text-white text-[12px] md:text-sm truncate">Metadata</h3>
              </div>
              <button 
                onClick={() => setCurrentSection("files")}
                className="text-xs text-[#58A6FF] hover:underline"
              >
                Browse Files
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 py-1 text-xs font-mono border-b border-[#30363D]/40">
                <span className="text-[#8B949E]">Project Name:</span>
                <span className="col-span-2 text-white font-medium">{project.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-xs font-mono border-b border-[#30363D]/40">
                <span className="text-[#8B949E]">Description:</span>
                <span className="col-span-2 text-[#8B949E]">{project.description}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-xs font-mono border-b border-[#30363D]/40">
                <span className="text-[#8B949E]">Active Branch:</span>
                <span className="col-span-2 text-[#D29922] font-semibold">{project.activeBranch}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 text-xs font-mono">
                <span className="text-[#8B949E]">Available Files:</span>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {project.files.map((file, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[10px] text-[#58A6FF]"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Active Agents Health Diagnostic */}
        <div className="space-y-3 md:space-y-4 w-full">
          <div className="p-3 md:p-5 bg-[#161B22] rounded border md:rounded-xl border-[#30363D] w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-[#30363D] pb-2">
              <Activity size={14} className="text-[#3FB950] flex-shrink-0" />
              <h3 className="font-bold text-white text-[12px] md:text-sm truncate">Agents</h3>
            </div>
            <div className="space-y-2 md:space-y-3.5" id="agent-diagnostic-list">
              {agents.map((agent) => {
                const isRunning = agent.status === "running";
                return (
                  <div 
                    key={agent.id} 
                    id={`diagnostics-${agent.id}`}
                    className="p-2 md:p-3 bg-[#0D1117] rounded border md:rounded-lg border-[#30363D] relative overflow-hidden flex flex-col justify-between hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 md:gap-2 min-w-0">
                        <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full flex-shrink-0 ${agent.color}`} />
                        <span className="text-[10px] md:text-xs font-bold text-white truncate">{agent.name}</span>
                        <span className="text-[8px] md:text-[10px] text-[#8B949E] px-1 md:px-1.5 py-0.5 rounded bg-slate-800 font-mono whitespace-nowrap flex-shrink-0">
                          {agent.role.substring(0, 4)}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono leading-none font-semibold ${
                        isRunning ? "text-[#D29922] animate-pulse" : "text-[#3FB950]"
                      }`}>
                        {isRunning ? "ACTIVE" : "STANDBY"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] line-clamp-1 mb-1">
                      {agent.lastAction || "Awaiting task decomposition orders."}
                    </p>
                    {isRunning && (
                      <div className="w-full bg-[#30363D] h-1 rounded-full overflow-hidden mt-1 bg-opacity-40">
                        <div className="bg-[#58A6FF] h-1 rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{ width: "60%" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentSection("agents")}
              className="w-full text-center mt-4 text-xs font-bold text-[#58A6FF] hover:underline"
            >
              Configure Agent Delegation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
