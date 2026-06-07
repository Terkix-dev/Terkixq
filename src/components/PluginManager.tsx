/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Puzzle, 
  Terminal, 
  Cpu, 
  Plus, 
  Check, 
  Trash2, 
  Code2, 
  BookOpen, 
  Zap, 
  HelpCircle,
  Play,
  FileCode2,
  CheckSquare,
  Workflow,
  ArrowRight,
  ShieldCheck,
  Eye
} from "lucide-react";

export interface CustomPlugin {
  id: string;
  name: string;
  triggerCommand: string;
  responseOutput: string;
  agentRole?: string;
  agentDesc?: string;
  isEnabled: boolean;
  type: "command" | "agent" | "layout";
}

interface PluginManagerProps {
  plugins: CustomPlugin[];
  onAddPlugin: (plugin: CustomPlugin) => void;
  onDeletePlugin: (id: string) => void;
  onTogglePlugin: (id: string) => void;
}

export default function PluginManager({
  plugins,
  onAddPlugin,
  onDeletePlugin,
  onTogglePlugin
}: PluginManagerProps) {
  // Navigation replacements using live Interactive Diagram nodes
  const [selectedNode, setSelectedNode] = useState<"kernel" | "commands" | "agents" | "compile" | "docs">("kernel");
  
  // Custom Plugin creation states
  const [newName, setNewName] = useState("");
  const [type, setType] = useState<"command" | "agent">("command");
  const [triggerCommand, setTriggerCommand] = useState("");
  const [responseOutput, setResponseOutput] = useState("");
  
  // Custom Agent association inside the plugin
  const [agentRole, setAgentRole] = useState("");
  const [agentDesc, setAgentDesc] = useState("");

  const [notification, setNotification] = useState("");

  const handleCreatePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (type === "command" && !triggerCommand.trim()) return;
    if (type === "agent" && (!agentRole.trim() || !agentDesc.trim())) return;

    const newPlugin: CustomPlugin = {
      id: "plugin-" + Date.now(),
      name: newName,
      type,
      triggerCommand: type === "command" ? triggerCommand.trim().toLowerCase() : "",
      responseOutput: type === "command" ? responseOutput : `Agent ${agentRole} online. Spawning instructions complete.`,
      agentRole: type === "agent" ? agentRole.trim() : undefined,
      agentDesc: type === "agent" ? agentDesc.trim() : undefined,
      isEnabled: true
    };

    onAddPlugin(newPlugin);
    setNotification(`Đã liên kết và cài đặt Plugin "${newName}" thành công!`);
    
    // Reset inputs
    setNewName("");
    setTriggerCommand("");
    setResponseOutput("");
    setAgentRole("");
    setAgentDesc("");
    setSelectedNode("commands");

    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const handleTestCommand = (cmd: string) => {
    alert(`[MÔ PHỎNG PHẢN HỒI KERNEL]\n\nChạy thử: rkix > ${cmd}\nTrạng thái: OK\nKết quả xử lý cục bộ được gửi trả thành công về Terminal UI.`);
  };

  const commandPlugins = plugins.filter(p => p.type === "command");
  const agentPlugins = plugins.filter(p => p.type === "agent");

  return (
    <div className="space-y-6" id="plugin-management-center">
      
      {/* Brand Header Unit */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-[#161B22] rounded-xl border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-md font-bold text-white flex items-center gap-2 font-sans tracking-tight">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3FB950] shrink-0 animate-pulse"></div>
            Premium SDK Plugin Hub &amp; Kernel Extension Broker
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Mở rộng tệp lệnh rkix terminal, cài đặt AI Specialists và quản lý cổng kết nối luồng công việc.
          </p>
        </div>
        
        {/* Navigation Doc trigger */}
        <button
          onClick={() => setSelectedNode("docs")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer font-mono border ${
            selectedNode === "docs" 
              ? "bg-[#3FB950] text-[#0D1117] border-green-500 font-bold" 
              : "bg-slate-800 border-slate-700 text-gray-400 hover:text-white"
          }`}
        >
          <BookOpen size={13} />
          {selectedNode === "docs" ? "Viewing SDK Specs" : "Read SDK Documentation"}
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl text-xs bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] flex items-center gap-2">
          <Zap size={14} className="animate-bounce" />
          <span>{notification}</span>
        </div>
      )}

      {/* TWO COLUMN COCKPIT WITH PIPELINE TOPOLOGY & CO-EXTENSIONS INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="plugins-mesh-cockpit">
        
        {/* LEFT COMPONENT: STUNNING INTERACTIVE SVG PIPELINE GRAPH (7/12 width) */}
        <div className="lg:col-span-7 bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between relative min-h-[460px] overflow-hidden">
          
          <div className="z-10 bg-[#0D1117]/80 backdrop-blur border border-slate-800/80 p-3.5 rounded-lg absolute top-4 left-4 max-w-[280px]">
            <span className="text-[9px] font-mono uppercase font-bold text-[#8B949E] block mb-1">Pipeline Architecture Diagram</span>
            <span className="text-[11px] text-white leading-normal font-medium">Bản đồ đăng ký Runtime. Trực quan hóa đường truyền lệnh mở rộng trực tiếp vào Terminal Kernel.</span>
          </div>

          {/* PIPELINE INFRASTRUCTURE PLAN */}
          <div className="flex-1 flex items-center justify-center py-6 min-h-[320px]">
            <svg viewBox="0 0 500 360" className="w-full max-w-[450px] overflow-visible">
              
              {/* FLOW LINES */}
              
              {/* Kernel core to Commands Registry */}
              <path d="M 250,180 L 100,100" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 100,100" 
                stroke="#3FB950" 
                strokeWidth="2" 
                strokeDasharray="6 10" 
                className="animate-[dash_14s_linear_infinite]"
              />

              {/* Kernel core to AI Agent Specialists */}
              <path d="M 250,180 L 400,100" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 400,100" 
                stroke="#BC8CFF" 
                strokeWidth="2" 
                strokeDasharray="6 8" 
                className="animate-[dash_12s_linear_infinite]"
              />

              {/* Kernel core to Mod compiler */}
              <path d="M 250,180 L 250,300" stroke="#30363D" strokeWidth="2.5" />
              <path 
                d="M 250,180 L 250,300" 
                stroke="#58A6FF" 
                strokeWidth="2" 
                strokeDasharray="4 12" 
                className="animate-[dash_8s_linear_infinite]"
              />

              {/* NODE 1: CENTRAL OS KERNEL */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("kernel")}
              >
                <circle 
                  cx="250" 
                  cy="180" 
                  r="38" 
                  fill="#0D1117" 
                  stroke={selectedNode === "kernel" ? "#3FB950" : "#30363D"} 
                  strokeWidth={selectedNode === "kernel" ? "3.5" : "2"}
                  className="transition duration-200 group-hover:scale-105"
                />
                <circle 
                  cx="250" 
                  cy="180" 
                  r="45" 
                  fill="none" 
                  stroke="#3FB950" 
                  strokeWidth="1.5" 
                  strokeDasharray="5 7" 
                  className="animate-spin opacity-45"
                  style={{ transformOrigin: '250px 180px', animationDuration: "16s" }}
                />
                <Workflow className="text-[#3FB950]" x="238" y="168" size={24} />
                <rect x="200" y="225" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="250" y="237" textAnchor="middle" fill="#E6EDF3" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  TERMINAL KERNEL
                </text>
              </g>

              {/* NODE 2: CUSTOM COMMANDS LIST (Glowing green) */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("commands")}
              >
                <circle 
                  cx="100" 
                  cy="100" 
                  r="28" 
                  fill="#0D1117" 
                  stroke={selectedNode === "commands" ? "#3FB950" : "#30363D"} 
                  strokeWidth="2.5"
                  className="transition duration-200 group-hover:scale-105"
                />
                <Terminal className="text-[#3FB950]" x="88" y="88" size={24} />
                <rect x="50" y="135" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="100" y="147" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  COMMAND HOOKS ({commandPlugins.length})
                </text>
              </g>

              {/* NODE 3: AI AGENT SPECIALISTS (Glowing pink) */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("agents")}
              >
                <circle 
                  cx="400" 
                  cy="100" 
                  r="28" 
                  fill="#0D1117" 
                  stroke={selectedNode === "agents" ? "#BC8CFF" : "#30363D"} 
                  strokeWidth="2.5"
                  className="transition duration-200 group-hover:scale-105"
                />
                <Cpu className="text-[#BC8CFF]" x="388" y="88" size={24} />
                <rect x="350" y="135" width="100" height="18" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="400" y="147" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  AI SPECIALISTS ({agentPlugins.length})
                </text>
              </g>

              {/* NODE 4: ASSEMBLE COMPILER */}
              <g 
                className="cursor-pointer group"
                onClick={() => setSelectedNode("compile")}
              >
                <circle 
                  cx="250" 
                  cy="300" 
                  r="26" 
                  fill="#0D1117" 
                  stroke={selectedNode === "compile" ? "#58A6FF" : "#30363D"} 
                  strokeWidth="2"
                  className="transition duration-200 group-hover:scale-105"
                />
                <Plus className="text-[#58A6FF]" x="238" y="288" size={24} />
                <rect x="200" y="332" width="100" height="16" rx="4" fill="#0D1117" stroke="#30363D" strokeWidth="1" />
                <text x="250" y="343" textAnchor="middle" fill="#8B949E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  + EXTENSION MOD
                </text>
              </g>

            </svg>
          </div>

          <div className="z-10 bg-[#0D1117]/50 border-t border-slate-800/80 p-3 flex justify-between items-center text-[10px] font-mono text-gray-500 mt-2 shrink-0 rounded-lg">
            <span className="flex items-center gap-1"><Check className="text-[#3FB950]" size={12} /> Live Event Interceptors Active</span>
            <span className="flex items-center gap-1">Host Ingress Proxy: On Port 3000</span>
          </div>

        </div>

        {/* RIGHT COLUMN: REENGINEERED CONTEXT INSPECTOR & DETAILS PANEL (5/12 width) */}
        <div className="lg:col-span-5 bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col justify-between min-h-[460px] relative">
          
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            
            {/* Header tag based on active node state */}
            <div className="border-b border-[#30363D] pb-3 mb-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-black/40 ${
                  selectedNode === "kernel" ? "text-[#3FB950]" :
                  selectedNode === "commands" ? "text-green-400" :
                  selectedNode === "agents" ? "text-[#BC8CFF]" :
                  selectedNode === "compile" ? "text-[#58A6FF]" : "text-gray-400"
                }`}>
                  {selectedNode === "kernel" && <Workflow size={14} />}
                  {selectedNode === "commands" && <Terminal size={14} />}
                  {selectedNode === "agents" && <Cpu size={14} />}
                  {selectedNode === "compile" && <Code2 size={14} />}
                  {selectedNode === "docs" && <BookOpen size={14} />}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    {selectedNode === "kernel" && "SYS: Kernel Kernel OS"}
                    {selectedNode === "commands" && "SYS: Custom Commands"}
                    {selectedNode === "agents" && "SYS: AI Specialists Stack"}
                    {selectedNode === "compile" && "SYS: Plugin Assembly"}
                    {selectedNode === "docs" && "SYS: Extension SDK Guidelines"}
                  </h3>
                  <span className="text-[10px] text-gray-500 leading-none">
                    {selectedNode === "kernel" && "Kernel Core Registry"}
                    {selectedNode === "commands" && "Mở rộng danh bạ dòng lệnh rkix >"}
                    {selectedNode === "agents" && "Agents bổ sung ma trận thực thi AI"}
                    {selectedNode === "compile" && "Lắp ráp thêm plugin mới cực nhanh"}
                    {selectedNode === "docs" && "Hướng dẫn đặc trị dành cho nhà phát triển"}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-black/40 text-gray-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                Node Inspector
              </span>
            </div>

            {/* INTERACTIVE COMPONENT DETAILS IN INSPECTOR PANEL */}

            {/* A. SYSTEM KERNEL SCREEN */}
            {selectedNode === "kernel" && (
              <div className="space-y-4 text-xs leading-relaxed flex-1 flex flex-col justify-center select-none">
                <p className="text-slate-300">
                  Lõi hệ điều hành hoạt hạt nhân xử lý toàn bộ cơ chế so khớp lệnh tự động. 
                  Các plugin đăng ký liên tục gán listener trực tiếp lên kernel để gửi luồng phản hồi trực tiếp.
                </p>

                <div className="p-3.5 bg-[#0D1117] rounded-lg border border-slate-800 space-y-2 text-[11px] font-mono">
                  <span className="font-bold text-white block">⚙️ HỒ SƠ LÕI KERNEL REGISTERED:</span>
                  <div className="flex justify-between border-b border-slate-800 pb-1 text-gray-400">
                    <span>Lệnh mở rộng đang chạy:</span>
                    <span className="text-[#3FB950] font-bold">{commandPlugins.length} Shell modules</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1 text-gray-400">
                    <span>Biên chế đặc vụ AI nạp thêm:</span>
                    <span className="text-[#BC8CFF] font-bold">{agentPlugins.length} Specialists</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Vite Hot Proxy Client State:</span>
                    <span className="text-[#3FB950] font-bold">READY (Port 3000)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedNode("commands")}
                    type="button"
                    className="w-full bg-[#3FB950] hover:bg-green-600 text-[#0D1117] font-extrabold font-sans py-2.5 rounded-lg transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Xem Chi Tiết Mở Rộng Dòng Lệnh
                    <ArrowRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* B. COMMAND HOOKS LIST (No Cluttered lists) */}
            {selectedNode === "commands" && (
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-xs text-slate-300 mb-3 shrink-0">
                  Danh bạ câu lệnh mở rộng được đăng kí cục bộ. Gõ lệnh khớp ở Terminal để nhận dữ liệu hoàn trả ngay.
                </p>

                {commandPlugins.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-[#30363D] rounded-lg flex-1 flex flex-col justify-center">
                    Chưa có Custom Command nào được lắp đặt. Hãy tạo mới ở nút + Extension phía dưới.
                  </div>
                ) : (
                  <div className="overflow-y-auto pr-1 space-y-2 flex-1 max-h-[290px]">
                    {commandPlugins.map((plugin) => (
                      <div 
                        key={plugin.id}
                        className={`p-3 rounded-lg border bg-[#0D1117]/60 flex items-center justify-between transition-all duration-200 ${
                          plugin.isEnabled ? "border-[#3FB950]/50" : "border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`p-1.5 rounded-md shrink-0 ${plugin.isEnabled ? "bg-green-500/10 text-[#3FB950]" : "bg-slate-800 text-gray-500"}`}>
                            <Terminal size={12} />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-white text-[11px] font-bold font-mono leading-tight truncate">{plugin.name}</h4>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">&gt; rkix {plugin.triggerCommand}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {plugin.isEnabled && (
                            <button
                              onClick={() => handleTestCommand(plugin.triggerCommand)}
                              className="text-[9px] bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:text-white text-gray-400 px-2 py-0.5 rounded font-mono transition cursor-pointer"
                              title="Test response Output"
                            >
                              Run test
                            </button>
                          )}
                          
                          {/* Toggle Slider */}
                          <button
                            onClick={() => onTogglePlugin(plugin.id)}
                            className={`w-7 h-4 rounded-full p-0.5 transition duration-200 outline-none shrink-0 ${
                              plugin.isEnabled ? "bg-[#3FB955]" : "bg-slate-700"
                            }`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition transform ${
                              plugin.isEnabled ? "translate-x-3" : "translate-x-0"
                            }`} />
                          </button>

                          <button
                            onClick={() => onDeletePlugin(plugin.id)}
                            className="p-1 hover:text-red-400 hover:bg-slate-800 text-gray-500 rounded transition"
                            title="Xóa Plugin"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* C. AI AGENT SPECIALISTS STACK COMPONENT */}
            {selectedNode === "agents" && (
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-xs text-slate-300 mb-3 shrink-0">
                  Lắp đặt thêm AI Specialist Developers giúp điều phối công việc với khả năng phân tách vai trò hoàn chỉnh.
                </p>

                {agentPlugins.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-[#30363D] rounded-lg flex-1 flex flex-col justify-center">
                    Chưa đăng kí AI Agent mở rộng nào. Hãy tạo mới một plugin với dạng "Custom Agent" ở phía dưới.
                  </div>
                ) : (
                  <div className="overflow-y-auto pr-1 space-y-2 flex-1 max-h-[290px]">
                    {agentPlugins.map((plugin) => (
                      <div 
                        key={plugin.id}
                        className={`p-3 rounded-lg border bg-[#0D1117]/60 flex items-center justify-between transition-all duration-200 ${
                          plugin.isEnabled ? "border-[#BC8CFF]/50" : "border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className={`p-1.5 rounded-md shrink-0 ${plugin.isEnabled ? "bg-violet-500/10 text-[#BC8CFF]" : "bg-slate-800 text-gray-500"}`}>
                            <Cpu size={12} />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-white text-[11px] font-bold font-mono leading-tight truncate">{plugin.name}</h4>
                            <p className="text-[9px] text-gray-400 font-mono mt-0.5">Role: {plugin.agentRole}</p>
                            <p className="text-[9px] text-gray-500 truncate mt-0.5">{plugin.agentDesc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle Slider */}
                          <button
                            onClick={() => onTogglePlugin(plugin.id)}
                            className={`w-7 h-4 rounded-full p-0.5 transition duration-200 outline-none shrink-0 ${
                              plugin.isEnabled ? "bg-[#BC8CFF]" : "bg-slate-700"
                            }`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition transform ${
                              plugin.isEnabled ? "translate-x-3" : "translate-x-0"
                            }`} />
                          </button>

                          <button
                            onClick={() => onDeletePlugin(plugin.id)}
                            className="p-1 hover:text-red-400 hover:bg-slate-800 text-gray-500 rounded transition"
                            title="Xóa Specialist"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* D. PLUGINS COMPILING & ASSEMBLE FORM */}
            {selectedNode === "compile" && (
              <form onSubmit={handleCreatePlugin} className="space-y-3 flex-1 select-none">
                <div>
                  <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">TÊN MODULE PLUGIN *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Git Sync Helper hoặc CSS Neon Lighter"
                    className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">THỂ LOẠI MỞ RỘNG</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                    >
                      <option value="command">Custom Command (Dòng lệnh)</option>
                      <option value="agent">Custom Agent (Đặc vụ AI mới)</option>
                    </select>
                  </div>

                  {type === "command" ? (
                    <>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">TRIGGER KEYWORD (LỆNH GÕ)*</label>
                        <input
                          type="text"
                          required={type === "command"}
                          value={triggerCommand}
                          onChange={(e) => setTriggerCommand(e.target.value)}
                          placeholder="e.g. compile, checks, or hello"
                          className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5 font-bold">VĂN BẢN ĐẢM BẢO PHẢN HỒI KERNEL</label>
                        <textarea
                          rows={2}
                          value={responseOutput}
                          onChange={(e) => setResponseOutput(e.target.value)}
                          placeholder="e.g. Hello developer. Subsystem is live."
                          className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">VAI TRÒ AGENT (ROLE)*</label>
                        <input
                          type="text"
                          required={type === "agent"}
                          value={agentRole}
                          onChange={(e) => setAgentRole(e.target.value)}
                          placeholder="e.g. Auditor hoặc Security"
                          className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono text-[#8B949E] mb-0.5">CHỈ CHÚ NHIỆM VỤ CỦA AGENT *</label>
                        <textarea
                          rows={2}
                          required={type === "agent"}
                          value={agentDesc}
                          onChange={(e) => setAgentDesc(e.target.value)}
                          placeholder="e.g. Phân tích lỗ hổng lưu trữ và rà soát cấu trúc server..."
                          className="w-full text-xs font-mono px-3 py-1.5 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#3FB950]"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-2 text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedNode("kernel")}
                    className="px-3 py-1.5 border border-slate-700 hover:bg-[#161B22] text-gray-400 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#3FB950] hover:bg-green-600 text-[#0D1117] font-extrabold rounded-lg transition"
                  >
                    Biên dịch &amp; Nạp
                  </button>
                </div>
              </form>
            )}

            {/* E. COMPREHENSIVE DEVELOPER SDK DOCUMENTATION */}
            {selectedNode === "docs" && (
              <div className="text-[10.5px] leading-relaxed text-slate-350 overflow-y-auto max-h-[290px] pr-1 space-y-3 flex-1 select-text">
                <span className="font-bold text-white block font-mono">1. Cấu Trúc Khai Báo JSON Schema:</span>
                <p>
                  Mọi Plugin đăng ký kích hoạt đều được kernel gán một luồng kiểm chứng kiểu an toàn (Type Safety) nghiêm ngặt trước khi lắp ráp client-side:
                </p>
                <pre className="p-2.5 bg-[#0D1117] text-[#3FB950] font-mono text-[9px] rounded border border-slate-800 whitespace-pre overflow-x-auto leading-normal">
{`interface CustomPlugin {
  id: string; // Tên định chuỗi
  name: string; // Hiển thị 
  type: "command" | "agent";
  triggerCommand?: string; 
  responseOutput?: string; 
  isEnabled: boolean;
}`}
                </pre>
                
                <span className="font-bold text-white block font-mono pt-1">2. Thử Nghiệm Gõ Lệnh Thực Tế:</span>
                <p>
                  Quay lại tab <b>"Terminal"</b>, nhập lệnh rkix ứng với từ khóa (ví dụ: <code className="text-[#58A6FF] font-bold">uptime</code>), kết quả phản hồi sẽ hiển thị tức thì trên luồng console.
                </p>
              </div>
            )}

          </div>

          <div className="mt-4 pt-3 border-t border-[#30363D] shrink-0 text-[10px] font-mono text-gray-500 leading-tight">
            💡 Gợi ý: Hãy bấm trực tiếp vào <span className="text-[#58A6FF] font-bold">Node Extension Compiler (+)</span> trong Sơ Đồ để đăng kí câu lệnh tùy chỉnh nhanh gọn.
          </div>

        </div>

      </div>

    </div>
  );
}
