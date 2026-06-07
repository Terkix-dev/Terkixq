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
    <div className="space-y-6" id="dashboard-container">
      {/* OS Banner */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#161B22] to-[#0D1117] border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 bg-[#3FB950] rounded-full animate-ping"></span>
            <span className="text-xs font-mono text-[#3FB950] font-semibold tracking-wider uppercase">RKIX CORE KERNEL ACTIVE</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">RKix Terminal OS</h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Active Project: <span class="text-[#58A6FF] font-semibold font-mono">{project.name}</span> &bull; Branch: <span class="text-[#D29922] font-semibold font-mono">{project.activeBranch}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono bg-[#0D1117]/80 p-3 rounded-lg border border-[#30363D]">
          <div className="text-[#8B949E]">
            SYS_TIME: <span className="text-white font-semibold">{systime.split("T")[1].slice(0, 8)} UTC</span>
          </div>
          <span className="text-[#30363D]">|</span>
          <div className="text-[#8B949E]">
            CPU: <span className="text-[#58A6FF] font-semibold">{cpuUsage}%</span>
          </div>
          <span className="text-[#30363D]">|</span>
          <div className="text-[#8B949E]">
            RAM: <span className="text-[#3FB950] font-semibold">{memoryUsed}GB / 8.00GB</span>
          </div>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-[#8B949E] font-medium font-mono">WORKSPACE FILES</span>
            <HardDrive size={18} className="text-[#8B949E]" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{project.files.length}</div>
          <div className="text-[11px] text-[#8B949E] mt-1">
            Total footprint: <span className="text-[#58A6FF] font-mono">{totalLinesOfCode} lines</span> of code
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-[#8B949E] font-medium font-mono">GIT REVISIONS</span>
            <GitBranch size={18} className="text-[#8B949E]" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{project.commitHistory.length}</div>
          <div className="text-[11px] text-[#8B949E] mt-1">
            Active branch: <span className="text-[#D29922] font-mono font-semibold">{project.activeBranch}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-[#8B949E] font-medium font-mono">LIVE SERVICES</span>
            <Globe size={18} className="text-[#8B949E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#3FB950] font-mono">
            {project.deployments.filter(d => d.status === "live").length} Live
          </div>
          <div className="text-[11px] text-[#8B949E] mt-1">
            Configured providers: <span className="text-[#58A6FF] font-semibold">Vercel, Railway</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-[#161B22] rounded-xl border border-[#30363D] relative overflow-hidden group hover:border-[#58A6FF] transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-[#8B949E] font-medium font-mono">RUN COMMANDS</span>
            <Terminal size={18} className="text-[#8B949E]" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalCommandsRun}</div>
          <div className="text-[11px] text-[#8B949E] mt-1 font-mono">
            Orchestrated with AI
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick Shell Commands */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-[#161B22] rounded-xl border border-[#30363D]">
            <div className="flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2">
              <Zap size={16} className="text-[#58A6FF]" />
              <h3 className="font-bold text-white text-sm">Automated Agent Presets</h3>
            </div>
            <p className="text-xs text-[#8B949E] mb-4">
              RKix OS is optimized for prompt-first workflows. Click any prompt below to pipeline it directly into our intelligent Agent Terminal environment:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="dashboard-preset-commands">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  id={`preset-cmd-${index}`}
                  onClick={() => {
                    setCurrentSection("terminal");
                    onRunPresetCommand(preset.cmd);
                  }}
                  className="p-3 bg-[#0D1117] hover:bg-[#1f2631] border border-[#30363D]/80 rounded-lg text-left transition duration-200 group flex justify-between items-center text-xs"
                >
                  <div className="space-y-1 pr-2">
                    <span className="font-bold text-white block group-hover:text-[#58A6FF] transition">
                      {preset.label}
                    </span>
                    <span className="text-[#8B949E] block overflow-hidden text-ellipsis whitespace-nowrap max-w-xs font-mono">
                      $ {preset.cmd}
                    </span>
                  </div>
                  <Play size={12} className="text-[#8B949E] group-hover:text-[#3FB950] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Project Details Panel */}
          <div className="p-5 bg-[#161B22] rounded-xl border border-[#30363D]">
            <div className="flex justify-between items-center mb-4 border-b border-[#30363D] pb-2">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#D29922]" />
                <h3 className="font-bold text-white text-sm">Active Workspace Metadata</h3>
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
        <div className="space-y-4">
          <div className="p-5 bg-[#161B22] rounded-xl border border-[#30363D]">
            <div className="flex items-center gap-2 mb-4 border-b border-[#30363D] pb-2">
              <Activity size={16} className="text-[#3FB950]" />
              <h3 className="font-bold text-white text-sm">Autonomous Developer Matrix</h3>
            </div>
            <div className="space-y-3.5" id="agent-diagnostic-list">
              {agents.map((agent) => {
                const isRunning = agent.status === "running";
                return (
                  <div 
                    key={agent.id} 
                    id={`diagnostics-${agent.id}`}
                    className="p-3 bg-[#0D1117] rounded-lg border border-[#30363D] relative overflow-hidden flex flex-col justify-between hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${agent.color}`} />
                        <span className="text-xs font-bold text-white">{agent.name}</span>
                        <span className="text-[10px] text-[#8B949E] px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                          {agent.role}
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
