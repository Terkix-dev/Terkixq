/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  HardDrive, 
  GitBranch, 
  Globe, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  FolderGit2, 
  Check, 
  ExternalLink, 
  FileCode2, 
  Code, 
  Settings, 
  Play, 
  Send, 
  RefreshCw, 
  Sliders, 
  UserCog, 
  FolderPlus, 
  Save, 
  ChevronRight, 
  AlertTriangle,
  PlayCircle,
  Clock,
  ExternalLink as LinkIcon,
  Users,
  Puzzle,
  MessageSquare,
  HelpCircle,
  Menu,
  X,
  Mic,
  MicOff
} from "lucide-react";
import { Project, WorkspaceFile, Agent, TerminalLine, Deployment, GitCommit } from "./types";
import { readJsonStorage, readNumberStorage, readStringStorage, writeStorage } from "./utils/storage";
import { PRESET_PROJECTS } from "./data/presets";
import DashboardOverview from "./components/DashboardOverview";
import ProjectList from "./components/ProjectList";
import ContactsManager, { Contact } from "./components/ContactsManager";
import PluginManager, { CustomPlugin } from "./components/PluginManager";
import TelemetryD3Chart from "./components/TelemetryD3Chart";

const DEFAULT_AGENTS: Agent[] = [
  { id: "planner", name: "Planner Agent", role: "Planner", description: "Requirement analysis, task decomposition, and workflow plan generation.", status: "idle", lastAction: "Standby.", color: "bg-[#58A6FF]" },
  { id: "builder", name: "Builder Agent", role: "Builder", description: "Source code generation, project scaffolding, and system initialization.", status: "idle", lastAction: "Standby.", color: "bg-[#F0883E]" },
  { id: "designer", name: "Designer Agent", role: "Designer", description: "UI generation, component creation, interactive pacing, and style refinements.", status: "idle", lastAction: "Standby.", color: "bg-[#3FB950]" },
  { id: "debugger", name: "Debugger Agent", role: "Debugger", description: "TypeScript linting checks, type validation, and logical bug detection.", status: "idle", lastAction: "Standby.", color: "bg-[#D29922]" },
  { id: "deploy", name: "Deploy Agent", role: "Deploy", description: "Build compilation pipelines, artifact compression, and cloud link synchronization.", status: "idle", lastAction: "Standby.", color: "bg-[#BC8CFF]" },
  { id: "research", name: "Research Agent", role: "Research", description: "Documentation searching and optimal code practice recommendations.", status: "idle", lastAction: "Standby.", color: "bg-[#4AF626]" }
];

const INITIAL_LINES: TerminalLine[] = [
  { id: "init-1", type: "system", text: "TerKix Terminal OS [Version 1.0.4] - Secure Dev Kernel", timestamp: new Date().toLocaleTimeString() },
  { id: "init-2", type: "system", text: "Initializing isolated multi-agent software sandboxes...", timestamp: new Date().toLocaleTimeString() },
  { id: "init-3", type: "success", text: "Core kernel boot completed inside micro-container in 12ms.", timestamp: new Date().toLocaleTimeString() },
  { id: "init-4", type: "agent-info", text: "[PLANNER] Directives compiled. Ready for requirements parsing.", timestamp: new Date().toLocaleTimeString(), agent: "Planner" },
  { id: "init-5", type: "agent-info", text: "[BUILDER] Scaffolding matrices loaded. Standby state verified.", timestamp: new Date().toLocaleTimeString(), agent: "Builder" },
  { id: "init-6", type: "agent-success", text: "All 6 autonomous agents registered and synchronized.", timestamp: new Date().toLocaleTimeString(), agent: "Designer" },
  { id: "init-7", type: "warning", text: "Type 'help' to review TerKix custom terminal commands or enter a natural prompt to spawn assets.", timestamp: new Date().toLocaleTimeString() },
];

export default function App() {
  const terkixRootRef = useRef<HTMLDivElement>(null);

  // Persistence state loaders
  const [projects, setProjects] = useState<Project[]>(() =>
    readJsonStorage<Project[]>("terkix_projects", PRESET_PROJECTS, (value): value is Project[] =>
      Array.isArray(value) && value.every((item) => typeof item?.id === "string" && Array.isArray(item?.files)),
      ["rkix_projects"]
    )
  );

  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    readStringStorage("terkix_active_project_id", PRESET_PROJECTS[0]?.id || "", ["rkix_active_project_id"])
  );

  const [currentSection, setCurrentSection] = useState<string>("terminal");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(() =>
    readJsonStorage<TerminalLine[]>("terkix_terminal_lines", INITIAL_LINES, (value): value is TerminalLine[] =>
      Array.isArray(value) && value.every((item) => typeof item?.id === "string" && typeof item?.text === "string"),
      ["rkix_terminal_lines"]
    )
  );

  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [commandText, setCommandText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [totalCommandsRun, setTotalCommandsRun] = useState<number>(() =>
    readNumberStorage("terkix_total_commands", 0, ["rkix_total_commands"])
  );

  // File explorer states
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>("");

  // Terminal and Live Chat scroll boxes
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<boolean>(true);

  // AI Thinking Mode state
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);
  const [detailedReasoningText, setDetailedReasoningText] = useState<string>("");

  // Assistive Touch home button state additions
  const [showContext, setShowContext] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressedTriggered, setLongPressedTriggered] = useState<boolean>(false);

  const startLongPressTimer = () => {
    setLongPressedTriggered(false);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedTriggered(true);
      setShowContext(true);
    }, 500); // 500ms long press threshold
  };

  const clearLongPressTimer = (e: React.MouseEvent | React.TouchEvent, isClickAction: boolean) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    if (isClickAction && !longPressedTriggered) {
      // Toggle nav
      setIsNavOpen(prev => {
        const nextState = !prev;
        if (!nextState) {
          setCurrentSection("terminal");
        }
        return nextState;
      });
    }
    setLongPressedTriggered(false);
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      setMicStream(null);
      setIsMicActive(false);
      
      const timeStr = new Date().toLocaleTimeString();
      setTerminalLines(prev => [
        ...prev,
        {
          id: `mic-${Date.now()}`,
          type: "system",
          text: "System notification: Microphone input stream has been safely deactivated.",
          timestamp: timeStr
        }
      ]);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        setIsMicActive(true);
        
        const timeStr = new Date().toLocaleTimeString();
        setTerminalLines(prev => [
          ...prev,
          {
            id: `mic-${Date.now()}`,
            type: "success",
            text: "Voice acquisition online: Live audio capture stream established. Mic permission granted.",
            timestamp: timeStr
          }
        ]);
      } catch (err: any) {
        console.warn("Unable to establish live microphone feed directly: ", err);
        setIsMicActive(true);
        
        const timeStr = new Date().toLocaleTimeString();
        setTerminalLines(prev => [
          ...prev,
          {
            id: `mic-${Date.now()}`,
            type: "warning",
            text: `Voice simulated (Dev environment fallback): Live mic active indicator is now pulsing red!`,
            timestamp: timeStr
          }
        ]);
      }
    }
  };

  // Check microphone permissions
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          const handlePermissionChange = () => {
            if (permissionStatus.state === "denied") {
              if (isMicActive) {
                if (micStream) micStream.getTracks().forEach(t => t.stop());
                setMicStream(null);
                setIsMicActive(false);
              }
            }
          };
          permissionStatus.onchange = handlePermissionChange;
        })
        .catch(err => console.debug("Permissions query not supported: ", err));
    }
  }, [isMicActive, micStream]);

  // Termux UI responsive states
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [consoleFontSize, setConsoleFontSize] = useState<"sm" | "base" | "lg">("base");
  const [themeColor, setThemeColor] = useState<"green" | "amber" | "cyan" | "violet">("green");
  const [showLegacySidebar, setShowLegacySidebar] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(false);

  // Real-time Telemetry metrics history
  const [telemetryHistory, setTelemetryHistory] = useState<{ cpu: number; ping: number }[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      cpu: Number((1.5 + Math.random() * 2).toFixed(2)),
      ping: Number((1.2 + Math.random() * 1.5).toFixed(2))
    }));
  });

  // Contacts & Collaborators states
  const [activeCollaborators, setActiveCollaborators] = useState<Contact[]>([
    {
      resourceName: "people/c1",
      name: "Nguyễn Văn Hùng",
      email: "hung.nguyen@terkix.dev",
      phone: "+84 901 234 567",
      role: "Lead Architect",
      isCollaborating: true
    },
    {
      resourceName: "people/c2",
      name: "Trần Thị Mai",
      email: "mai.tran@terkix.dev",
      phone: "+84 912 345 678",
      role: "Designer Agent",
      isCollaborating: true
    }
  ]);

  // Custom Plugins state
  const [customPlugins, setCustomPlugins] = useState<CustomPlugin[]>([
    {
      id: "plugin-1",
      name: "Git Revision Sync",
      type: "command",
      triggerCommand: "gitsync",
      responseOutput: "[GIT SYNC] Matching revisions across active container tags. Local HEAD and origin master references are completely synced in 25ms.",
      isEnabled: true
    },
    {
      id: "plugin-2",
      name: "Cyberpunk Glow-up UI",
      type: "command",
      triggerCommand: "neonmode",
      responseOutput: "[NEON GLOW] High-frequency violet shadows and neon accents successfully registered under css components.",
      isEnabled: true
    },
    {
      id: "plugin-3",
      name: "Standard Uptime",
      type: "command",
      triggerCommand: "uptime",
      responseOutput: "[SYSTEM STATUS] TerKix Terminal OS uptime: 14h 32m 11s. Core server container response delay: 2.13ms.",
      isEnabled: true
    }
  ]);

  // Terminal Tab view toggle (shell CLI vs collaborator chat)
  const [terminalViewMode, setTerminalViewMode] = useState<"shell" | "chat">("shell");
  
  // Real-time chat threads
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: string;
    role?: string;
    avatar?: string;
    text: string;
    timestamp: string;
    isAgent?: boolean;
  }>>([
    {
      id: "msg-1",
      sender: "Nguyên Văn Hùng",
      role: "Lead Architect",
      text: "Xin chào cả đội! Tôi đã chuẩn bị xong môi trường biên dịch cho dự án mới.",
      timestamp: "10:15 AM"
    },
    {
      id: "msg-2",
      sender: "Trần Thị Mai",
      role: "Designer Agent",
      text: "Tuyệt quá! Hôm nay chúng ta sẽ bắt đầu thiết kế thêm một số module giao diện bento grid nhé.",
      timestamp: "10:16 AM"
    },
    {
      id: "msg-3",
      sender: "Designer Agent",
      role: "Designer",
      text: "I am ready too! Custom CSS layouts and viewport triggers can be generated instantly inside index.html.",
      timestamp: "10:18 AM",
      isAgent: true
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");

  // Dynamically computed agents based on enabled custom agent plugins
  const customAgentPlugins = customPlugins.filter(p => p.isEnabled && p.type === "agent");
  const computedAgents = [
    ...agents,
    ...customAgentPlugins.map(p => ({
      id: p.id,
      name: `${p.agentRole} Agent`,
      role: p.agentRole || "Specialist",
      description: p.agentDesc || "Custom developer plugin agent.",
      status: "idle" as const,
      lastAction: "Standby under Plugin directives.",
      color: "bg-[#BC8CFF]"
    }))
  ];

  // Helper callbacks
  const handleAddCollaborator = (newContact: Contact, roleAssigned: string) => {
    setActiveCollaborators(prev => {
      if (prev.some(c => c.email === newContact.email)) {
        return prev.map(c => c.email === newContact.email ? { ...c, role: roleAssigned, isCollaborating: true } : c);
      }
      return [...prev, { ...newContact, role: roleAssigned, isCollaborating: true }];
    });
  };

  const handleAddPlugin = (plugin: CustomPlugin) => {
    setCustomPlugins(prev => [plugin, ...prev]);
  };

  const handleDeletePlugin = (id: string) => {
    setCustomPlugins(prev => prev.filter(p => p.id !== id));
  };

  const handleTogglePlugin = (id: string) => {
    setCustomPlugins(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p));
  };

  const handleSendChatMessage = () => {
    const textClean = chatInput.trim();
    if (!textClean) return;

    const userMsg = {
      id: "user-msg-" + Date.now(),
      sender: "You (nvht2505@gmail.com)",
      role: "Lead Developer",
      text: textClean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate multi-user collaborator reactions based on user text keywords
    setTimeout(() => {
      let replyText = "Đã rõ! Tôi nghĩ cấu trúc này khá phù hợp. Hãy kiểm tra biên dịch và chạy thử nhé.";
      let responder = activeCollaborators[Math.floor(Math.random() * activeCollaborators.length)] || { name: "Nguyên Văn Hùng", role: "Lead Architect" };

      if (textClean.toLowerCase().includes("css") || textClean.toLowerCase().includes("style") || textClean.toLowerCase().includes("màu") || textClean.toLowerCase().includes("giao diện")) {
        responder = activeCollaborators.find(c => c.role?.includes("Designer") || c.role?.includes("Artisan") || c.name.includes("Mai")) || { name: "Trần Thị Mai", role: "Designer Agent" };
        replyText = "Hợp lý đấy! Tôi vừa phác thảo một bản vẽ layout có tích hợp hiệu ứng gradient bóng bẩy. Đội thiết kế duyệt chưa?";
      } else if (textClean.toLowerCase().includes("deploy") || textClean.toLowerCase().includes("chạy") || textClean.toLowerCase().includes("lên")) {
        replyText = "Hệ thống biên dịch đã sẵn sàng. Hãy gõ lệnh 'deploy' ở Terminal để nạp gói cài đặt lên Vercel nhé.";
      } else if (textClean.toLowerCase().includes("gitsync") || textClean.toLowerCase().includes("plugin")) {
        replyText = "Tôi vừa kiểm tra tab Plugin Hub. Các câu lệnh mở rộng đã nạp và được theo dõi trong kernel OS rồi.";
      }

      setChatMessages(prev => [
         ...prev,
         {
           id: "reply-" + Date.now(),
           sender: responder.name,
           role: responder.role,
           text: replyText,
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }
      ]);
    }, 1200);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || PRESET_PROJECTS[0];

  useEffect(() => {
    if (projects.length === 0) {
      setProjects(PRESET_PROJECTS);
      setActiveProjectId(PRESET_PROJECTS[0]?.id || "");
      return;
    }

    if (!projects.some((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProjectId, projects]);

  useEffect(() => {
    writeStorage("terkix_projects", projects);
  }, [projects]);

  useEffect(() => {
    writeStorage("terkix_active_project_id", activeProjectId);
    if (activeProject && activeProject.files.length > 0) {
      setSelectedFilePath((current) =>
        activeProject.files.some((file) => file.path === current) ? current : activeProject.files[0].path
      );
    }
  }, [activeProjectId, activeProject]);

  useEffect(() => {
    writeStorage("terkix_terminal_lines", terminalLines);
  }, [terminalLines]);

  useEffect(() => {
    writeStorage("terkix_total_commands", totalCommandsRun.toString());
  }, [totalCommandsRun]);

  // Update Real-time Telemetry Metrics periodically to drive live D3 visualizations
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        // realistic brownian noise crawl of CPU load (0.5% - 8.5%) and ping matrix (0.8ms - 5.5ms)
        const changeCpu = (Math.random() - 0.5) * 0.98;
        const nextCpu = Math.max(0.6, Math.min(8.5, Number((last.cpu + changeCpu).toFixed(2))));
        
        const changePing = (Math.random() - 0.5) * 0.45;
        const nextPing = Math.max(0.8, Math.min(5.5, Number((last.ping + changePing).toFixed(2))));
        
        return [...prev.slice(1), { cpu: nextCpu, ping: nextPing }];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Handle selected file change
  useEffect(() => {
    if (activeProject) {
      const activeFile = activeProject.files.find(f => f.path === selectedFilePath);
      if (activeFile) {
        setEditedCode(activeFile.content);
      } else if (activeProject.files.length > 0) {
        setSelectedFilePath(activeProject.files[0].path);
        setEditedCode(activeProject.files[0].content);
      }
    }
  }, [selectedFilePath, activeProject]);

  useEffect(() => {
    // Reset our manual scroll tracking bypass anytime a background AI pipeline builds/starts
    if (isProcessing) {
      terminalScrollRef.current = true;
    }
  }, [isProcessing]);

  useEffect(() => {
    // Scroll dynamically ONLY while AI is processing/broadcasting, or when user has just sent an active input command
    const lastLine = terminalLines[terminalLines.length - 1];
    const isInputType = lastLine?.type === "input";
    
    if (terminalScrollRef.current && (isProcessing || isInputType) && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLines, isProcessing]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, currentSection]);

  // Handle Termux custom interactive key modifiers
  const handleTermKeyAction = (action: string) => {
    if (action === "ESC") {
      setCommandText("");
    } else if (action === "TAB") {
      const txt = commandText.trim().toLowerCase();
      if (!txt) {
        setCommandText("help");
      } else if ("clear".startsWith(txt)) {
        setCommandText("clear");
      } else if ("create".startsWith(txt)) {
        setCommandText("create ");
      } else if ("delete".startsWith(txt)) {
        setCommandText("delete ");
      } else if ("deploy".startsWith(txt)) {
        setCommandText("deploy");
      } else if ("git commit".startsWith(txt)) {
        setCommandText("git commit ");
      } else if ("git branch".startsWith(txt)) {
        setCommandText("git branch ");
      } else if ("gitsync".startsWith(txt)) {
        setCommandText("gitsync");
      } else if ("neonmode".startsWith(txt)) {
        setCommandText("neonmode");
      } else if ("uptime".startsWith(txt)) {
        setCommandText("uptime");
      }
    } else if (action === "CTRL") {
      setCrtFilter(prev => !prev);
      setTerminalLines(prev => [
        ...prev,
        { id: `crt-${Date.now()}`, type: "system", text: `[MONITOR] CRT Scanline phosphor overlay: ${!crtFilter ? "ACTIVATED" : "DEACTIVATED"}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } else if (action === "ALT") {
      const themes: Array<"green" | "amber" | "cyan" | "violet"> = ["green", "amber", "cyan", "violet"];
      const nextTheme = themes[(themes.indexOf(themeColor) + 1) % themes.length];
      setThemeColor(nextTheme);
      setTerminalLines(prev => [
        ...prev,
        { id: `theme-${Date.now()}`, type: "system", text: `[CONSOLE] Phosphor matrix shifted to retro ${nextTheme.toUpperCase()}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } else if (action === "-") {
      if (consoleFontSize === "lg") setConsoleFontSize("base");
      else if (consoleFontSize === "base") setConsoleFontSize("sm");
    } else if (action === "+") {
      if (consoleFontSize === "sm") setConsoleFontSize("base");
      else if (consoleFontSize === "base") setConsoleFontSize("lg");
    } else if (action === "CLEAR") {
      setTerminalLines([]);
    } else if (action === "PGUP") {
      if (terminalEndRef.current) {
        terminalEndRef.current.parentNode?.dispatchEvent(new CustomEvent('scroll-up'));
        // Fallback smooth scroll
        const p = terminalEndRef.current.parentElement;
        if (p) {
          p.scrollTop -= 200;
          // Temporarily pause auto-scrolling due to manual scrolling up
          terminalScrollRef.current = false;
        }
      }
    } else if (action === "PGDN") {
      if (terminalEndRef.current) {
        const p = terminalEndRef.current.parentElement;
        if (p) {
          p.scrollTop += 200;
          const isAtBottom = p.scrollHeight - p.scrollTop - p.clientHeight < 80;
          terminalScrollRef.current = isAtBottom;
        }
      }
    }
  };

  // Execute terminal shell command pipeline
  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCmd = commandText.trim();
    if (!cleanCmd) return;

    setCommandText("");
    
    // Add prompt user input visual line to terminal console
    const inputTimestamp = new Date().toLocaleTimeString();
    const userLineId = `cmd-${Date.now()}`;
    setTerminalLines(prev => [
      ...prev,
      { id: userLineId, type: "input", text: cleanCmd, timestamp: inputTimestamp }
    ]);
    
    setTotalCommandsRun(c => c + 1);

    // Check pre-configured helper commands
    const parts = cleanCmd.split(" ");
    const primaryCmd = parts[0].toLowerCase();

    // Custom Plugin Command Interceptor
    const matchedPlugin = customPlugins.find(p => p.isEnabled && p.type === "command" && p.triggerCommand === primaryCmd);
    if (matchedPlugin) {
      setIsProcessing(true);
      setTerminalLines(prev => [
        ...prev,
        {
          id: `plugin-trigger-${Date.now()}`,
          type: "system",
          text: `[PLUGIN: ${matchedPlugin.name}] Kích hoạt thành công... Trực quan phản hồi từ câu lệnh:`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          {
            id: `plugin-resp-${Date.now()}`,
            type: "success",
            text: matchedPlugin.responseOutput,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    if (primaryCmd === "clear") {
      setTerminalLines([]);
      return;
    }

    if (primaryCmd === "help") {
      const respId = `help-${Date.now()}`;
      setTerminalLines(prev => [
        ...prev,
        {
          id: respId,
          type: "system",
          text: `\nTerKix Command Line Reference Guide:\n` +
                `---------------------------------------------------------------------------------\n` +
                `$ clear                   - Flush clean the active console log stream.\n` +
                `$ help                    - Display this system reference manual.\n` +
                `$ create <filename>       - Scaffold a new empty file in active workspace.\n` +
                `$ delete <filename>       - Remove specified file resource safely.\n` +
                `$ git commit <message>    - Snapshot compile current work onto active ledger.\n` +
                `$ git branch <name>       - Fork a virtual timeline branch.\n` +
                `$ deploy                  - Trigger production build pack & verify live routing.\n` +
                `---------------------------------------------------------------------------------\n` +
                `Natural Language Prompts:\n` +
                `Enter standard specifications (e.g. "build a task tracker with status badges" or\n` +
                `"modify navbar on the portfolio to have violet glowing effects") to coordinate your\n` +
                `autonomous multi-agent developer system. Outputs are compiled live in real-time.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      return;
    }

    if (primaryCmd === "create" && parts[1]) {
      const fileName = parts[1];
      const filePath = `workspace/project/${fileName}`;
      const ext = fileName.split(".").pop() || "txt";
      
      const newFile: WorkspaceFile = {
        path: filePath,
        name: fileName,
        content: `<!-- Created inside ${activeProject.name} workspace -->\n<div class="p-6 bg-slate-900 rounded">\n  <h2 class="text-white font-bold">${fileName} Module Ready</h2>\n</div>`,
        language: ext === "tsx" || ext === "ts" ? "tsx" : ext === "html" ? "html" : "css"
      };

      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          // Check if already exists
          if (p.files.some(f => f.path === filePath)) return p;
          return { ...p, files: [...p.files, newFile] };
        }
        return p;
      }));

      setSelectedFilePath(filePath);
      setTerminalLines(prev => [
        ...prev,
        { id: `create-suc-${Date.now()}`, type: "success", text: `[SYSTEM] Successfully initialized space target: ${filePath}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "delete" && parts[1]) {
      const fileName = parts[1];
      const filePath = `workspace/project/${fileName}`;
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return { ...p, files: p.files.filter(f => f.path !== filePath && f.name !== fileName) };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `delete-suc-${Date.now()}`, type: "success", text: `[SYSTEM] Resource removed safely: ${filePath}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "git" && parts[1] === "commit") {
      const commitMsg = parts.slice(2).join(" ") || "Snapshot incremental backup update";
      const newCommit: GitCommit = {
        hash: Math.random().toString(16).slice(2, 9),
        message: commitMsg.replace(/['"]/g, ""),
        author: "nvht2505@gmail.com <TerKix Console>",
        date: new Date().toISOString()
      };

      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            commitHistory: [newCommit, ...p.commitHistory]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `commit-suc-${Date.now()}`, type: "success", text: `[GIT] Created save snapshot commit [${newCommit.hash}]: ${newCommit.message}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "git" && parts[1] === "branch" && parts[2]) {
      const branchName = parts[2];
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          if (p.branches.some(b => b.name === branchName)) return p;
          return {
            ...p,
            branches: [...p.branches, { name: branchName, isCurrent: false }]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        { id: `branch-suc-${Date.now()}`, type: "success", text: `[GIT] Branch initialized successfully: '${branchName}'`, timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    if (primaryCmd === "deploy") {
      setIsProcessing(true);
      
      // Cascade automated build and deploy logs
      setTerminalLines(prev => [
        ...prev,
        { id: `dp-1-${Date.now()}`, type: "system", text: `[DEPLOY] Triggering automated build pipeline pack on current snapshot...`, timestamp: new Date().toLocaleTimeString() },
      ]);

      setTimeout(() => {
        setTerminalLines(prev => [
          ...prev,
          { id: `dp-2-${Date.now()}`, type: "system", text: `[DEPLOY] Executing npm run build: production configuration targets...`, timestamp: new Date().toLocaleTimeString() },
          { id: `dp-3-${Date.now()}`, type: "success", text: `[DEPLOY] Vercel edge runtime bundle generated size: 142KB [Success]`, timestamp: new Date().toLocaleTimeString() },
        ]);

        const randomHash = Math.random().toString(16).slice(2, 9);
        const newDeployment: Deployment = {
          id: `dep-${Date.now()}`,
          provider: "Vercel",
          status: "live",
          url: `https://${activeProject.id}-${randomHash}.vercel.app`,
          branch: activeProject.activeBranch,
          createdAt: new Date().toISOString(),
          commitHash: activeProject.commitHistory[0]?.hash || "a4c28f1"
        };

        setProjects(prev => prev.map(p => {
          if (p.id === activeProject.id) {
            return {
              ...p,
              deployments: [newDeployment, ...p.deployments]
            };
          }
          return p;
        }));

        setTerminalLines(prev => [
          ...prev,
          { id: `dp-4-${Date.now()}`, type: "agent-success", text: `[DEPLOY] Production successfully live: ${newDeployment.url}`, timestamp: new Date().toLocaleTimeString() },
        ]);

        setIsProcessing(false);
      }, 1500);

      return;
    }

    // NATURAL LANGUAGE PROMPTS - EXECUTE GEMINI AGENT STACK OR FALLBACK SIMULATOR
    setIsProcessing(true);
    
    // Animate agents cascading startup logs
    setAgents(prev => prev.map(a => a.id === "planner" ? { ...a, status: "running", lastAction: "Analyzing prompt directives..." } : a));
    
    setTerminalLines(prev => [
      ...prev,
      { id: `gem-1-${Date.now()}`, type: "agent-info", text: `[PLANNER] Analyzing command instructions: "${cleanCmd}"`, timestamp: new Date().toLocaleTimeString(), agent: "Planner" }
    ]);

    try {
      // Directives cascade
      if (thinkingMode) {
        setTerminalLines(prev => [
          ...prev,
          { id: `thinking-trace-1-${Date.now()}`, type: "system", text: `[THINKING PROCESS] Chế độ suy nghĩ bậc cao được kích hoạt. Đang xây dựng cấu trúc logic & quy chuẩn an toàn...`, timestamp: new Date().toLocaleTimeString() }
        ]);
        await new Promise(r => setTimeout(r, 1200));
      }

      const response = await fetch("/api/gemini/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cleanCmd,
          currentFiles: activeProject.files,
          projectContext: {
            name: activeProject.name,
            description: activeProject.description
          },
          activeBranch: activeProject.activeBranch,
          thinkingMode: thinkingMode
        })
      });

      if (!response.ok) {
        throw new Error("Local Gemini server processed with error. Activating offline smart simulator engine.");
      }

      const data = await response.json();
      
      // Store reasoning trace
      if (data.detailedReasoning) {
        setDetailedReasoningText(data.detailedReasoning);
      } else {
        setDetailedReasoningText("");
      }
      
      // Coordinate agent cascade visualization
      executeAgentLogsCascade(data);

    } catch (err: any) {
      console.warn("API Error, utilizing simulator fallback:", err);
      // Run fallback smart simulator so the app is always functional and visually satisfying
      generateSimulatorFallback(cleanCmd);
    }
  };

  // Animate the multi-agent cascade response step-by-step
  const executeAgentLogsCascade = (data: any) => {
    const { agentWorkflow, workspaceChanges, terminalOutput, explanation } = data;
    
    // Clear and execute cascade animation with timeouts
    let timer = 200;

    agentWorkflow.forEach((wf: any, i: number) => {
      setTimeout(() => {
        // Set agent states
        const normalizedRole = wf.agent.toLowerCase();
        setAgents(prev => prev.map(a => {
          if (a.role.toLowerCase() === normalizedRole) {
            return { ...a, status: "running", lastAction: wf.action };
          }
          return { ...a, status: "idle" };
        }));

        setTerminalLines(prev => [
          ...prev,
          {
            id: `wf-step-${Date.now()}-${i}`,
            type: normalizedRole === "debugger" ? "warning" : normalizedRole === "deploy" ? "success" : "agent-info",
            text: `[${wf.agent.toUpperCase()}] ${wf.action} \n--> ${wf.log}`,
            timestamp: new Date().toLocaleTimeString(),
            agent: wf.agent
          }
        ]);
      }, timer);
      timer += 1000;
    });

    // Write terminal logs & apply workspace changes after cascade complete
    setTimeout(() => {
      // Return agents to standby
      setAgents(prev => prev.map(a => ({ ...a, status: "idle", lastAction: "Directives completed successfully." })));

      // Render custom terminal outputs
      if (terminalOutput) {
        setTerminalLines(prev => [
          ...prev,
          {
            id: `term-out-${Date.now()}`,
            type: "system",
            text: terminalOutput,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }

      // Summarize explanation
      setTerminalLines(prev => [
        ...prev,
        {
          id: `expl-${Date.now()}`,
          type: "agent-success",
          text: `[SYSTEM] Agent stack finished the project task: ${explanation}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      // Apply workspace changes to the state
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          let updatedFiles = [...p.files];

          // 1. Process deletions
          if (workspaceChanges.filesToDelete && workspaceChanges.filesToDelete.length > 0) {
            updatedFiles = updatedFiles.filter(f => !workspaceChanges.filesToDelete.includes(f.path) && !workspaceChanges.filesToDelete.includes(f.name));
          }

          // 2. Process edits
          if (workspaceChanges.filesToEdit && workspaceChanges.filesToEdit.length > 0) {
            workspaceChanges.filesToEdit.forEach((ed: any) => {
              const idx = updatedFiles.findIndex(f => f.path === ed.path || f.name === ed.path);
              if (idx !== -1) {
                updatedFiles[idx] = { ...updatedFiles[idx], content: ed.content };
              }
            });
          }

          // 3. Process creations
          if (workspaceChanges.filesToCreate && workspaceChanges.filesToCreate.length > 0) {
            workspaceChanges.filesToCreate.forEach((cr: any) => {
              const idx = updatedFiles.findIndex(f => f.path === cr.path);
              if (idx !== -1) {
                updatedFiles[idx] = {
                  path: cr.path,
                  name: cr.name || cr.path.split("/").pop() || "unnamed",
                  content: cr.content,
                  language: cr.language || "typescript"
                };
              } else {
                updatedFiles.push({
                  path: cr.path,
                  name: cr.name || cr.path.split("/").pop() || "unnamed",
                  content: cr.content,
                  language: cr.language || cr.path.split(".").pop() || "typescript"
                });
              }
            });
          }

          return { ...p, files: updatedFiles };
        }
        return p;
      }));

      setIsProcessing(false);
    }, timer);
  };

  // Generate simulated offline actions when keys are absent
  const generateSimulatorFallback = (prompt: string) => {
    // Generate a beautiful landing page template or change style based on keywords
    const isSaaSPrompt = prompt.toLowerCase().includes("saas") || prompt.toLowerCase().includes("landing") || prompt.toLowerCase().includes("bento");
    const isRetroPrompt = prompt.toLowerCase().includes("retro") || prompt.toLowerCase().includes("violet") || prompt.toLowerCase().includes("glow") || prompt.toLowerCase().includes("neon");
    const isComponent = prompt.toLowerCase().includes("navbar") || prompt.toLowerCase().includes("button") || prompt.toLowerCase().includes("hero");

    if (thinkingMode) {
      const reasoningSnippet = 
        `### [BẢN PHÂN TÍCH SUY NGHĨ KHUYẾN KHÍCH TƯ DUY BẬC CAO (OFFLINE)]\n` +
        `**Yêu cầu xử lý:** "${prompt}"\n\n` +
        `#### 1. Mô hình hóa Thẩm mỹ & Giao diện (Designer Agent)\n` +
        `- Phác thảo mật độ tương phản: Áp dụng màu nền Dark Slate sâu và bo tròn card.\n` +
        `- Cân đối kích thước touch targets tối thiểu 44px phục vụ tối đa cho mobile.\n\n` +
        `#### 2. Kế hoạch Scaffolding & Type Safety (Builder Agent)\n` +
        `- Khai báo cấu trúc tệp an toàn, nạp liên hoàn tailwind css components.\n` +
        `- Viết mã nguồn hoàn chỉnh không chứa comment rỗng làm rào cản.`;
      setDetailedReasoningText(reasoningSnippet);
    } else {
      setDetailedReasoningText("");
    }

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "builder" ? { ...a, status: "running", lastAction: "Simulating file generation..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-2-${Date.now()}`, type: "agent-info", text: `[BUILDER] Scaffold target created. Injecting customized components...`, timestamp: new Date().toLocaleTimeString(), agent: "Builder" }
      ]);
    }, 600);

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "designer" ? { ...a, status: "running", lastAction: "Refining visual layouts and colors..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-3-${Date.now()}`, type: "agent-success", text: `[DESIGNER] Visual mesh calculated. Beautiful high-contrast themes mapped inside index.html.`, timestamp: new Date().toLocaleTimeString(), agent: "Designer" }
      ]);
    }, 1200);

    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === "debugger" ? { ...a, status: "running", lastAction: "Checking TypeScript warnings..." } : a));
      setTerminalLines(prev => [
        ...prev,
        { id: `sim-4-${Date.now()}`, type: "warning", text: `[DEBUGGER] Source code validated. 0 errors, 1 styling warning successfully patched.`, timestamp: new Date().toLocaleTimeString(), agent: "Debugger" }
      ]);
    }, 1800);

    setTimeout(() => {
      // Default fallback workspace code
      let simulatedHtml = activeProject.files.find(f => f.name === "index.html")?.content || "";
      
      if (isRetroPrompt) {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Glowing Developer Site</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0c10] text-[#c5c6c7] font-mono p-8 min-h-screen">
  <div class="max-w-4xl mx-auto border-2 border-[#66fcf1] p-8 rounded-lg shadow-2xl shadow-[#66fcf1]/20">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-[#202830] pb-6 mb-6">
      <h1 class="text-3xl font-black tracking-widest text-[#66fcf1] uppercase animate-pulse">⚡ RETRO GLOW_</h1>
      <span class="px-2.5 py-1 text-xs bg-[#1f2833] text-[#45f3ff] rounded border border-[#66fcf1]/30">VIOLET MODE</span>
    </header>
    
    <!-- Hero Block -->
    <div class="p-6 bg-[#1f2833]/80 rounded border border-[#66fcf1]/20 mb-8">
      <p class="text-xs text-[#66fcf1]/60 mb-2">// DIRECTIVE RECEIVED FROM AGENT TERMINAL</p>
      <h2 class="text-2xl font-bold text-white mb-4">"${prompt}"</h2>
      <p class="text-sm text-gray-400">
        This retro dark theme has been customized client-side to render beautiful borders, high-contrast neon highlights, and monospace telemetry modules.
      </p>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-black/60 rounded border border-purple-500/30">
        <span class="text-xs text-purple-400 font-bold">[01] VIOLET AMBIENCE</span>
        <p class="text-xs text-gray-400 mt-1">Deep high-contrast indigo shadows render a professional Cyberpunk terminal experience.</p>
      </div>
      <div class="p-4 bg-black/60 rounded border border-[#66fcf1]/30">
        <span class="text-xs text-[#66fcf1] font-bold">[02] INTUITIVE AUTONOMY</span>
        <p class="text-xs text-gray-400 mt-1">The designer mapped and deployed layout shifts dynamically in 18ms compile window.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
      } else if (isSaaSPrompt || isComponent) {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Modern Bento Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0D1117] text-[#E6EDF3] font-sans p-6">
  <div class="max-w-5xl mx-auto">
    <!-- Navbar -->
    <header class="flex justify-between items-center py-4 border-b border-[#30363D] mb-12">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">S</div>
        <span class="text-lg font-bold tracking-tight text-white">SaaS Flow</span>
      </div>
      <span class="text-xs text-[#8B949E]">Status: Active</span>
    </header>

    <!-- Hero -->
    <div class="text-center py-12 mb-10">
      <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
        Beautiful Bento Feature Grid Grid Layout
      </h1>
      <p class="text-[#8B949E] max-w-xl mx-auto text-sm md:text-base">
        Generated for: "${prompt}" - Designed dynamically with optimized flex layout matrices.
      </p>
    </div>

    <!-- Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 p-6 rounded-xl bg-[#161B22] border border-[#30363D] relative overflow-hidden">
        <span class="text-xs text-indigo-400 font-mono font-bold">CORE VALUE</span>
        <h3 class="text-xl font-bold text-white mt-1 mb-2">Simulated Multi-Agent Synapse</h3>
        <p class="text-xs text-[#8B949E]">All 6 agents mapped requirements locally. Files have been injected smoothly.</p>
      </div>
      <div class="p-6 rounded-xl bg-[#161B22] border border-[#30363D]">
        <span class="text-xs text-green-400 font-mono font-bold">INTEGRATED WORKSPACE</span>
        <h3 class="text-xl font-bold text-white mt-1 mb-2">Instant Reload</h3>
        <p class="text-xs text-[#8B949E]">Preview browser reflects local cache parameters in real-time.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
      } else {
        simulatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TerKix Software Output</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0D1117] text-[#E6EDF3] p-10 font-sans">
  <div class="max-w-2xl mx-auto border border-[#30363D] bg-[#161B22] p-8 rounded-xl shadow-2xl">
    <h1 class="text-2xl font-bold text-white mb-2">Active Sandbox Terminal Live</h1>
    <p class="text-xs text-[#58A6FF] font-mono mb-6">$ terkix command execute --success</p>
    
    <div class="p-4 bg-black/40 border border-[#30363D] rounded-lg mb-6">
      <p class="text-xs text-gray-400">Directive:</p>
      <p class="text-sm font-semibold text-white">"${prompt}"</p>
    </div>
    <ul class="space-y-2 text-xs text-gray-400">
      <li>&bull; File "workspace/project/index.html" was updated with fresh styling.</li>
      <li>&bull; Workspace file system regenerated with standard assets.</li>
      <li>&bull; Compiled successfully under TerKix development environments.</li>
    </ul>
  </div>
</body>
</html>`;
      }

      // Commit changes to state
      setProjects(prev => prev.map(p => {
        if (p.id === activeProject.id) {
          const files = p.files.map(f => {
            if (f.name === "index.html") {
              return { ...f, content: simulatedHtml };
            }
            return f;
          });
          
          return {
            ...p,
            files,
            commitHistory: [
              {
                hash: Math.random().toString(16).slice(2, 9),
                message: `AI sync: ${prompt.slice(0, 32)}...`,
                author: "Sarah Designer Agent",
                date: new Date().toISOString()
              },
              ...p.commitHistory
            ]
          };
        }
        return p;
      }));

      setTerminalLines(prev => [
        ...prev,
        {
          id: `sim-out-${Date.now()}`,
          type: "agent-success",
          text: `[SYSTEM] Task complete. Simulating successful compile environment logs.\nindex.html generated with beautiful tailwind code styling.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      setAgents(prev => prev.map(a => ({ ...a, status: "idle", lastAction: "Standby." })));
      setIsProcessing(false);
    }, 2400);
  };

  // Create workspace file manually
  const handleCreateFileManually = () => {
    const pathInput = prompt("Enter new file path relative to workspace (e.g. workspace/project/src/Navbar.tsx):");
    if (!pathInput) return;
    const name = pathInput.split("/").pop() || "unnamed";
    
    const newF: WorkspaceFile = {
      path: pathInput,
      name,
      content: `// New file ${name} - TerKix Terminal OS`,
      language: pathInput.endsWith(".html") ? "html" : pathInput.endsWith(".css") ? "css" : "tsx"
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        if (p.files.some(f => f.path === pathInput)) return p;
        return { ...p, files: [...p.files, newF] };
      }
      return p;
    }));

    setSelectedFilePath(pathInput);
  };

  // Save manual edits
  const handleSaveEditedCode = () => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          files: p.files.map(f => f.path === selectedFilePath ? { ...f, content: editedCode } : f)
        };
      }
      return p;
    }));
    
    setIsEditingFile(false);
    
    setTerminalLines(prev => [
      ...prev,
      {
        id: `edit-line-${Date.now()}`,
        type: "success",
        text: `[SYSTEM] Content backup and manual edits saved successfully for '${selectedFilePath}'`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Add workspace
  const handleCreateNewWorkspace = (name: string, description: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const newProj: Project = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      status: "active",
      activeBranch: "main",
      branches: [{ name: "main", isCurrent: true }],
      commitHistory: [
        {
          hash: Math.random().toString(16).slice(2, 9),
          message: "Boilerplate workspace compiled successfully",
          author: "TerKix Planner Agent",
          date: new Date().toISOString()
        }
      ],
      deployments: [],
      files: [
        {
          path: "workspace/project/index.html",
          name: "index.html",
          language: "html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0D1117] text-[#E6EDF3] p-10 font-sans">
  <div class="max-w-2xl mx-auto border border-[#30363D] bg-[#161B22] p-8 rounded-xl">
    <h1 class="text-3xl font-black text-white mb-2">${name}</h1>
    <p class="text-xs text-[#58A6FF] font-mono mb-4">Workspace Root: ${id}</p>
    <p class="text-sm text-[#8B949E]">
      ${description || "A clean sandbox development environment waiting for directives."}
    </p>
  </div>
</body>
</html>`
        }
      ]
    };

    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(id);
    
    setTerminalLines(prev => [
      ...prev,
      {
        id: `work-c-${Date.now()}`,
        type: "success",
        text: `[SYSTEM] Created and mounted active workspace root: '/workspace/${id}'`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Delete workspace
  const handleDeleteWorkspace = (id: string) => {
    const remaining = projects.filter(p => p.id !== id);
    if (remaining.length === 0) return;
    setProjects(remaining);
    setActiveProjectId(remaining[0].id);
  };

  const handleSelectProject = (project: Project) => {
    setActiveProjectId(project.id);
  };

  // Active file HTML output extraction for iframe srcDoc
  const indexHtmlCode = activeProject.files.find(f => f.name === "index.html" || f.path.endsWith("index.html"))?.content || "";

  return (
    <div 
      id="terkix-root" 
      ref={terkixRootRef}
      className="w-all-screen w-screen h-screen overflow-hidden max-h-screen relative flex bg-[#030508] text-[#E6EDF3] font-mono select-none"
      style={{ touchAction: "none" }}
    >
      {/* Absolute CRT monitor phosphor raster grid overlay */}
      {crtFilter && (
        <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-pulse" />
      )}



      {/* Modern next-level Dashboard Tab Router Overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-40 bg-[#06080c]/98 backdrop-blur-md flex flex-col p-4 md:p-8 overflow-y-auto selection:bg-[#3FB950]/30 select-text font-sans scroll-smooth"
          >
            {/* Overlay Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#30363D] pb-5 mb-6 gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <img src="/terkix-logo.svg" alt="TerKix logo" className="h-14 w-14 rounded-2xl border border-[#30363D] bg-black/50 shadow-[0_0_30px_rgba(88,166,255,0.18)]" />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="h-2 w-2 rounded-full bg-[#3FB950] animate-pulse"></span>
                    <p className="text-[9px] tracking-widest font-mono uppercase bg-[#3FB950]/10 text-[#3FB950] px-2.5 py-0.5 rounded font-extrabold border border-[#3FB950]/20">
                      TerKix Termux Sandbox Core
                    </p>
                    <span className="text-[9px] tracking-widest font-mono uppercase bg-[#58A6FF]/10 text-[#58A6FF] px-2.5 py-0.5 rounded font-extrabold border border-[#58A6FF]/20">
                      Prompt → Build → Preview → Deploy
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                    <Sliders className="text-[#3FB950]" size={21} /> TERKIX APP COCKPIT
                  </h1>
                  <p className="text-xs text-[#8B949E] mt-0.5 font-medium font-sans">
                    Termux-style shell UI &bull; Active Sandbox Layer Matrix &bull; Realtime Sync Verified
                  </p>
                </div>
              </div>

              {/* Close Action - Highly visible Quay lại/X action */}
              <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end">
                <button
                  onClick={() => setIsNavOpen(false)}
                  className="bg-red-950/80 hover:bg-red-600 border border-red-500 text-red-200 hover:text-white px-4.5 py-2.5 rounded-lg text-xs font-black tracking-wider leading-normal cursor-pointer transition-all duration-150 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.25)] uppercase"
                  title="Nhấn để đóng giao diện menu và quay trở lại màn hình chính CLI."
                >
                  <X size={14} className="text-red-400 group-hover:text-white" /> ĐÓNG MENU & QUAY LẠI ✕
                </button>
              </div>
            </div>

            {/* Multiple Layer Dashboard Next-Gen Bento Architecture */}
            {currentSection === "terminal" ? (
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
              
              {/* LEVEL 1: Left Telemetry Sidebar Column */}
              <div className="xl:col-span-1 flex flex-col gap-4">
                
                {/* Simulated Server Performance Metrics Widget */}
                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col gap-4 shadow">
                  <p className="text-[10px] uppercase font-mono font-black text-[#58A6FF] tracking-wider flex items-center gap-1.5">
                    <Activity size={12} className="text-[#58A6FF]" /> Cloud Matrix Telemetry
                  </p>
                  
                  {/* Performance specs */}
                  <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-[#30363D]/30">
                      <span>Server Engine load</span>
                      <span 
                        className="font-bold underline decoration-dotted transition-colors duration-250 animate-pulse"
                        style={{ color: themeColor === "green" ? "#3FB950" : themeColor === "amber" ? "#D29922" : themeColor === "cyan" ? "#00E5FF" : "#BC8CFF" }}
                      >
                        {(telemetryHistory[telemetryHistory.length - 1]?.cpu || 2.13).toFixed(2)}% ACTIVE
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-[#30363D]/30">
                      <span>Assigned Sandbox Node</span>
                      <span className="text-[#58A6FF] font-bold">Node.js c3000</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-[#30363D]/30">
                      <span>Kernel Ping latency</span>
                      <span className="text-yellow-500 font-bold font-mono">
                        {(telemetryHistory[telemetryHistory.length - 1]?.ping || 1.94).toFixed(2)}ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-[#30363D]/30">
                      <span>Active Timeline Branch</span>
                      <span className="text-purple-400 font-bold truncate max-w-[100px]">{activeProject.activeBranch}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-[#30363D]/30">
                      <span>Total Commands Run</span>
                      <span className="text-white font-extrabold">{totalCommandsRun} events</span>
                    </div>
                  </div>

                  {/* Real-time D3 UI line chart visualization */}
                  <TelemetryD3Chart history={telemetryHistory} themeColor={themeColor} />
                </div>

                {/* Google Contacts sync widget */}
                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-[10px] uppercase font-mono font-black text-[#BC8CFF] tracking-wider flex items-center gap-1.5">
                    <Users size={12} className="text-[#BC8CFF]" /> Google Cloud Active Scopes
                  </p>
                  
                  <div className="p-2.5 rounded bg-black/40 space-y-1.5 text-[10.5px] font-mono">
                    <div className="flex items-center gap-1.5 text-green-400 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      <span>OAUTH SCOPES VALID</span>
                    </div>
                    <p className="text-[#8B949E] text-[9.5px]">
                      &alpha;-Target: contacts.readonly, profile
                    </p>
                    <p className="text-white text-[9.5px] leading-tight">
                      Ledger: <span className="text-[#BC8CFF] font-bold">{activeCollaborators.length} collaborators</span> connected
                    </p>
                  </div>
                </div>

                {/* Scaffolding quick target summary indicator */}
                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col gap-1.5">
                  <p className="text-[10px] uppercase font-mono font-black text-[#D29922] tracking-wider">
                    Core Target Specs
                  </p>
                  <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                    Autonomous developer codes are continuously watching the workspace state. Click deploy inside raw terminal anytime to compile!
                  </p>
                </div>
              </div>

              {/* LEVEL 2: Bento Grid Router Tab Panel inside Bento Architecture */}
              <div className="xl:col-span-2 flex flex-col gap-3.5">
                <p className="text-[10px] uppercase font-mono font-bold text-[#8B949E] tracking-widest pl-1">
                  MODULE ROUTER GRID &bull; QUICK LINK TABS
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Bento Tab 1: Termux Terminal */}
                  <button
                    onClick={() => {
                      setCurrentSection("terminal");
                      setIsNavOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "terminal" 
                        ? "bg-[#0d1612]/90 border-[#3FB950] shadow-sm shadow-[#3FB950]/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-[#3FB950]/10 rounded-lg text-[#3FB950]">
                        <TerminalIcon size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-[#8B949E] border border-slate-700/60 px-1.5 py-0.5 rounded font-extrabold uppercase animate-pulse">
                        Shell Core
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-[#3FB950] transition font-sans text-[11px] leading-tight">Termux CLI shell</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Classic raw monospaced environment and AI triggers</p>
                    </div>
                  </button>

                  {/* Bento Tab 2: System Dashboard */}
                  <button
                    onClick={() => {
                      setCurrentSection("dashboard");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "dashboard" 
                        ? "bg-[#111927]/90 border-[#58A6FF] shadow-sm shadow-[#58A6FF]/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-[#58A6FF]/10 rounded-lg text-[#58A6FF]">
                        <Activity size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-blue-400 border border-blue-900/30 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Telemetry
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-[#58A6FF] transition font-sans text-[11px] leading-tight">Analytics Dashboard</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Visual charts, snapshot monitors, and command logs</p>
                    </div>
                  </button>

                  {/* Bento Tab 3: Visual Code Workspace */}
                  <button
                    onClick={() => {
                      setCurrentSection("files");
                      if (activeProject.files.length > 0 && !selectedFilePath) {
                        setSelectedFilePath(activeProject.files[0].path);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "files" 
                        ? "bg-[#16121b]/95 border-purple-500 shadow-sm shadow-purple-500/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                        <Code size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Editor workspace
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-purple-400 transition font-sans text-[11px] leading-tight">Monaco Code Workbench</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Detailed files playground editor & inline render sandbox</p>
                    </div>
                  </button>

                  {/* Bento Tab 4: Autonomous specialist Swarm */}
                  <button
                    onClick={() => {
                      setCurrentSection("agents");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "agents" 
                        ? "bg-[#1d1510]/95 border-[#F0883E] shadow-sm shadow-[#F0883E]/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-[#F0883E]/10 rounded-lg text-[#F0883E]">
                        <UserCog size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-orange-400 border border-orange-950/40 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Swarm Agent matrix
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-[#F0883E] transition font-sans text-[11px] leading-tight">AI Specialist Swarm</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Edit roles specifications & prompt directives</p>
                    </div>
                  </button>

                  {/* Bento Tab 5: Live Co-Dev Chat Room */}
                  <button
                    onClick={() => {
                      setCurrentSection("chat");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "chat" 
                        ? "bg-[#0b1424]/95 border-blue-500 shadow-sm shadow-blue-500/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                        <MessageSquare size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded font-extrabold uppercase animate-pulse">
                        LIVE CHAT
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-blue-400 transition font-sans text-[11px] leading-tight">Live Co-Dev Chat Room</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Chat, collaborate, debug, and sync tasks with the team</p>
                    </div>
                  </button>

                  {/* Bento Tab 6: Extension plugins registry */}
                  <button
                    onClick={() => {
                      setCurrentSection("plugins");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "plugins" 
                        ? "bg-[#14180d]/95 border-[#A5D63F] shadow-sm shadow-[#A5D63F]/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-[#A5D63F]/10 rounded-lg text-[#A5D63F]">
                        <Puzzle size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-green-300 border border-green-950/40 px-1.5 py-0.5 rounded font-extrabold uppercase font-sans">
                        Plugin SDK
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-[#A5D63F] transition font-sans text-[11px] leading-tight font-semibold">Custom Extensions Registry</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Register CLI commands and premium extension builders</p>
                    </div>
                  </button>

                  {/* Bento Tab 7: Durable Edge Deployments Ledger */}
                  <button
                    onClick={() => {
                      setCurrentSection("deployments");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "deployments" 
                        ? "bg-[#19111c]/95 border-[#BC8CFF] shadow-sm shadow-[#BC8CFF]/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-[#BC8CFF]/10 rounded-lg text-[#BC8CFF]">
                        <Globe size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-fuchsia-400 border border-fuchsia-900/40 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Deployments
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs font-sans">
                      <p className="font-extrabold text-white group-hover:text-[#BC8CFF] transition text-[11px] leading-tight">Durable Release ledger</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans font-normal">Review hosting revisions, live scopes & production URLs</p>
                    </div>
                  </button>

                  {/* Bento Tab 8: Multi-Workspace selector */}
                  <button
                    onClick={() => {
                      setCurrentSection("projects");
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all group relative overflow-hidden h-[88px] cursor-pointer ${
                      currentSection === "projects" 
                        ? "bg-[#131518]/95 border-gray-400 shadow-sm shadow-gray-450/5"
                        : "bg-[#161B22]/40 border-[#30363D] hover:bg-[#1a212d] hover:border-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="p-1.5 bg-slate-500/10 rounded-lg text-slate-400">
                        <FolderGit2 size={14} />
                      </div>
                      <span className="text-[7.5px] font-mono text-gray-400 border border-[#30363D]/60 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Workspaces
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs">
                      <p className="font-extrabold text-white group-hover:text-slate-300 transition font-sans text-[11px] leading-tight">Multi-workspace hub</p>
                      <p className="text-[9.5px] text-[#8B949E] truncate mt-0.5 font-sans">Fork branches, scaffold layers, or switch directories</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* LEVEL 3: Fast Macro Actions Area (Right Column) */}
              <div className="xl:col-span-1 flex flex-col gap-3.5">
                <p className="text-[10px] uppercase font-mono font-bold text-[#8B949E] tracking-widest pl-1">
                  TACTILE MACROS &bull; CORE EVENT PIPES
                </p>

                <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col gap-3 shadow">
                  
                  {/* Macro 1: Workspace Snapshot */}
                  <button
                    onClick={() => {
                      const msg = prompt("Enter Git Snapshot Commit comment:") || "Saved increment compile via overlay";
                      setProjects(prev => prev.map(p => {
                        if (p.id === activeProject.id) {
                          return {
                            ...p,
                            commitHistory: [
                              {
                                hash: Math.random().toString(16).slice(2, 9),
                                message: msg,
                                author: "nvht2505@gmail.com <TerKix Console>",
                                date: new Date().toISOString()
                              },
                              ...p.commitHistory
                            ]
                          };
                        }
                        return p;
                      }));
                      alert("Workspace incremental git snapshot successfully written onto active database ledger!");
                    }}
                    className="w-full py-2 px-3 bg-indigo-650 bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/20 text-indigo-300 rounded-lg text-[11px] font-bold font-mono transition flex items-center justify-between cursor-pointer"
                  >
                    <span>SNAPSHOT DIRECTORY</span>
                    <GitBranch size={13} className="text-[#58A6FF]" />
                  </button>

                  {/* Macro 2: Trigger Sandbox Build */}
                  <button
                    onClick={() => {
                      setCurrentSection("terminal");
                      setIsNavOpen(false);
                      setCommandText("deploy");
                      setTimeout(() => handleCommandSubmit(), 150);
                    }}
                    className="w-full py-2 px-3 bg-[#238636]/25 hover:bg-[#238636]/45 border border-[#3FB950]/20 text-green-300 rounded-lg text-[11px] font-bold font-mono transition flex items-center justify-between cursor-pointer"
                  >
                    <span>COMPILE EDGE BUILD</span>
                    <Globe size={13} className="text-[#3FB950]" />
                  </button>

                  {/* Macro 3: Clean history */}
                  <button
                    onClick={() => {
                      setTerminalLines([]);
                    }}
                    className="w-full py-2 px-3 bg-red-950 bg-red-900/15 hover:bg-red-900/35 border border-red-500/20 text-red-300 rounded-lg text-[11px] font-bold font-mono transition flex items-center justify-between cursor-pointer"
                  >
                    <span>FLUSH SHELL BUFFER</span>
                    <Trash2 size={13} className="text-red-400" />
                  </button>

                  {/* Macro 4: Toggle Legacy Sidebar fallback drawer */}
                  <button
                    onClick={() => {
                      setShowLegacySidebar(prev => !prev);
                    }}
                    className={`w-full py-2 px-3 border rounded-lg text-[11px] font-bold font-mono transition flex items-center justify-between cursor-pointer ${
                      showLegacySidebar 
                        ? "bg-slate-700/30 border-slate-500 text-white" 
                        : "bg-slate-900/40 border-[#30363D] text-[#8B949E] hover:text-white"
                    }`}
                  >
                    <span>LEGACY NAVIGATION MENU</span>
                    <Sliders size={13} />
                  </button>

                  {/* Macro 5: Toggle monitor Scanline CRT look */}
                  <button
                    onClick={() => {
                      setCrtFilter(p => !p);
                    }}
                    className={`w-full py-2 px-3 border rounded-lg text-[11px] font-bold font-mono transition flex items-center justify-between cursor-pointer ${
                      crtFilter 
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow shadow-emerald-500/10" 
                        : "bg-slate-900/40 border-[#30363D] text-[#8B949E] hover:text-white"
                    }`}
                  >
                    <span>CRT DISP SYSTEM {crtFilter ? "ON" : "OFF"}</span>
                    <Cpu size={13} />
                  </button>

                  {/* Macro 6: Free RAM */}
                  <button
                    onClick={() => {
                      alert("WebAssembly heap memory garbage collection ran successfully! 419MB freed.");
                    }}
                    className="w-full py-2 px-3 bg-slate-900/40 hover:bg-slate-800 border border-[#30363D] text-gray-400 rounded-lg text-[11px] font-semibold font-mono transition flex items-center justify-between cursor-pointer"
                  >
                    <span>REBOOT LOCAL MEMORY</span>
                    <RefreshCw size={13} />
                  </button>
                </div>

                <div className="p-3 bg-amber-500/5 text-[#D29922] border border-yellow-500/15 rounded-xl text-[10.5px] font-sans leading-normal">
                  <p className="font-extrabold flex items-center gap-1 mb-0.5">
                    <AlertTriangle size={11} className="shrink-0" /> Fullscreen Viewport Mode:
                  </p>
                  <span>
                    To fit exactly 1 screen like mobile Termux, the sidebars are disabled by default. Tap our AssistiveTouch green button to route between modules instantly.
                  </span>
                </div>
              </div>

            </div>
          ) : (
              /* Selected Sub-page View inside the Overlay */
              <div className="flex-1 flex flex-col min-h-0 gap-4" id="overlay-module-viewport">
                
                {/* Visual Header / Navigation Breadcrumbs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#111622] p-3 rounded-xl border border-[#30363D]/80 font-mono shrink-0 gap-3">
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <button 
                      onClick={() => setCurrentSection("terminal")} 
                      className="px-4.5 py-2 text-[11.5px] font-black text-white hover:text-black bg-[#58A6FF]/15 hover:bg-[#58A6FF] border border-[#58A6FF]/40 rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1.5 leading-none select-none shadow-[0_0_12px_rgba(88,166,255,0.15)]"
                    >
                      <span>&larr; QUAY LẠI TRANG CHỦ MENU</span>
                    </button>
                    <span className="text-gray-600 font-sans">/</span>
                    <span className="text-[11.5px] text-gray-400 font-bold uppercase tracking-wider">
                      Mục hiện tại: <span className="text-[#3FB950] font-extrabold font-mono text-[12px]">{currentSection}</span>
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentSection("terminal");
                      setIsNavOpen(false);
                    }}
                    className="px-4 py-2 text-[11.5px] uppercase font-black text-white hover:text-white bg-red-900/40 hover:bg-red-650 border border-red-500/40 rounded-lg cursor-pointer transition-all duration-150 select-none self-stretch sm:self-auto flex items-center gap-1.5 justify-center shadow-md shadow-red-950/50"
                  >
                    <X size={12} /> ĐÓNG MENU (QUAY LẠI TERMINAL)
                  </button>
                </div>

                {/* Sub-page Render Box */}
                <div className="flex-1 min-h-0 overflow-y-auto" id="overlay-content-holder">
                  {currentSection === "dashboard" && (
                    <DashboardOverview
                      project={activeProject}
                      agents={agents}
                      setCurrentSection={setCurrentSection}
                      onRunPresetCommand={(cmd) => {
                        setCommandText(cmd);
                        setIsNavOpen(false); // Close overlay to let user watch the terminal execute it
                        setCurrentSection("terminal");
                        setTimeout(() => handleCommandSubmit(), 200);
                      }}
                      totalCommandsRun={totalCommandsRun}
                    />
                  )}

                  {currentSection === "projects" && (
                    <ProjectList
                      projects={projects}
                      activeProject={activeProject}
                      onSelectProject={handleSelectProject}
                      onCreateProject={handleCreateNewWorkspace}
                      onDeleteProject={handleDeleteWorkspace}
                    />
                  )}

                  {currentSection === "files" && (
                    <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-[450px] lg:h-full lg:min-h-0" id="visual-editor-workbench">
                      {/* Left file tree explorer */}
                      <div className="lg:w-1/4 bg-[#161B22] rounded-xl border border-[#30363D] p-4 flex flex-col justify-between shrink-0 h-full font-mono text-xs">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-[#30363D] pb-2">
                            <h3 className="text-xs uppercase font-extrabold text-[#E6EDF3] tracking-wider flex items-center gap-1 font-sans">
                              <HardDrive size={13} className="text-[#58A6FF]" /> Active Workspace Files
                            </h3>
                            <button 
                              onClick={handleCreateFileManually}
                              className="text-[11px] font-mono text-[#58A6FF] hover:underline flex items-center gap-0.5 pointer-events-auto cursor-pointer"
                            >
                              <Plus size={11} /> Create
                            </button>
                          </div>
                          
                          {/* Workspace Files Navigation */}
                          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                            {activeProject.files.map((file, i) => {
                              const isSelected = selectedFilePath === file.path;
                              return (
                                <div 
                                  key={i}
                                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition ${
                                    isSelected 
                                      ? "bg-[#0B0D0F] border border-[#30363D] text-[#58A6FF]" 
                                      : "hover:bg-[#30363D]/30 text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <button
                                    onClick={() => setSelectedFilePath(file.path)}
                                    className="flex-1 text-left truncate flex items-center gap-2 pointer-events-auto cursor-pointer"
                                  >
                                    <FileCode2 size={13} className={isSelected ? "text-[#58A6FF]" : "text-gray-500"} />
                                    <span className="truncate">{file.path.replace("workspace/project/", "")}</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove compilation target: ${file.path}?`)) {
                                        setProjects(prev => prev.map(p => {
                                          if (p.id === activeProject.id) {
                                            return { ...p, files: p.files.filter(f => f.path !== file.path) };
                                          }
                                          return p;
                                        }));
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-400 transition p-1"
                                    title="Delete file"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 mt-4 text-[11px] text-[#D29922]">
                          <p className="font-semibold flex items-center gap-1 mb-1 font-sans">
                            <AlertTriangle size={12} /> Prompt refactoring targets:
                          </p>
                          <p className="font-mono text-[10px] leading-relaxed">
                            Type a prompt in the Terminal and checkout how Builder and Designer rewrite workspace files dynamically!
                          </p>
                        </div>
                      </div>

                      {/* Right column editor / Preview split */}
                      <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
                        <div className="flex-1 bg-[#010409] rounded-xl border border-[#30363D] flex flex-col relative overflow-hidden min-h-[350px]">
                          {/* Editor tab controls */}
                          <div className="h-9 border-b border-[#30363D] flex items-center justify-between px-4 bg-[#0d1016] shrink-0">
                            <span className="text-[11px] font-mono text-[#58A6FF] flex items-center gap-1.5 font-bold">
                              <Code size={13} /> {selectedFilePath || "No file selected_"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveEditedCode}
                                className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1 bg-gradient-to-r from-[#238636] to-[#2bac44] rounded text-[10px] font-bold flex items-center gap-1 shadow transition cursor-pointer"
                              >
                                <Save size={10} /> Save Changes
                              </button>
                            </div>
                          </div>

                          {/* Textarea Code Workspace */}
                          <div className="flex-1 relative flex min-h-[250px]">
                            {/* Simulated visual numbers gutter */}
                            <div className="w-10 bg-[#0D1117] border-r border-[#30363D]/40 text-right pr-2 pt-4 text-[10px] font-mono text-gray-600 select-none hidden sm:block leading-relaxed">
                              {Array.from({ length: Math.max(editedCode.split("\n").length, 30) }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                              ))}
                            </div>
                            {/* Source Code text editor body */}
                            <textarea
                              value={editedCode}
                              onChange={(e) => setEditedCode(e.target.value)}
                              className="flex-1 bg-transparent p-4 font-mono text-xs text-slate-100 outline-none resize-none focus:ring-0 leading-relaxed border-none h-full outline-hidden"
                              placeholder="// Code editor canvas ready. Enter custom codebase..."
                            />
                          </div>
                        </div>

                        {/* Sub Live preview sandbox rendered block */}
                        <div className="h-[280px] bg-[#161B22] rounded-xl border border-[#30363D] p-3 flex flex-col shrink-0">
                          <div className="flex justify-between items-center mb-1.5 shrink-0 bg-[#0D1117] p-1 px-3.5 rounded border border-[#30363D]">
                            <span className="text-[10px] font-mono text-white font-bold flex items-center gap-1.5">
                              <PlayCircle size={12} className="text-[#3FB950]" /> Active Sandbox Visual Preview
                            </span>
                            <button
                              onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.open();
                                  win.document.write(indexHtmlCode || `<h1>No HTML Output Found</h1>`);
                                  win.document.close();
                                }
                              }}
                              className="text-[9px] text-[#58A6FF] font-mono border border-blue-500/30 px-1.5 rounded flex items-center gap-1 bg-blue-500/5 hover:bg-blue-500/15 cursor-pointer"
                              title="Open preview in broad window"
                            >
                              <LinkIcon size={9} /> Open External
                            </button>
                          </div>
                          <div className="flex-1 bg-white rounded-lg overflow-hidden relative">
                            {indexHtmlCode ? (
                              <iframe
                                srcDoc={indexHtmlCode}
                                title="Visual sandbox playground inline"
                                sandbox="allow-scripts"
                                className="w-full h-full border-none bg-white font-sans"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center p-4 text-xs text-[#8B949E] bg-slate-900">
                                No HTML view mapping found.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === "agents" && (
                    <div className="space-y-6" id="agents-setup-panel">
                      <div className="p-5 bg-[#161B22] rounded-xl border border-[#30363D]">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-sans">
                          <Sliders className="text-[#3FB950]" size={20} />
                          TerKix AI Agent Architectures
                        </h2>
                        <p className="text-xs text-[#8B949E] font-sans">
                          Configure and monitor autonomous roles inside your compiler sandbox pipeline.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="detailed-agents-setup-grid">
                        {computedAgents.map((ag) => {
                          const isRunning = ag.status === "running";
                          return (
                            <div 
                              key={ag.id} 
                              className={`p-5 rounded-xl border transition-all duration-305 ${
                                isRunning 
                                  ? "bg-[#161B22] border-[#58A6FF] shadow-lg" 
                                  : "bg-[#161B22] border-[#30363D] hover:border-[#8B949E]"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${ag.color} ${isRunning ? "animate-ping" : ""}`} />
                                  <h3 className="font-bold text-white text-sm font-sans">{ag.name}</h3>
                                </div>
                                <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${
                                  isRunning ? "text-yellow-500 border-yellow-500/30 animate-pulse bg-yellow-500/5" : "text-gray-400 border-gray-600 bg-slate-800"
                                }`}>
                                  {isRunning ? "ACTIVE" : "STANDBY"}
                                </span>
                              </div>

                              <p className="text-xs text-gray-400 mb-4 h-12 leading-relaxed font-sans">
                                {ag.description}
                              </p>

                              <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] text-[10px] font-mono">
                                <span className="text-[#8B949E] block mb-1">CURRENT DIRECTIVE:</span>
                                <span className="text-white font-medium">{ag.lastAction}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentSection === "contacts" && (
                    <div id="contacts-rendering-view" className="animate-fade-in">
                      <ContactsManager
                        activeCollaborators={activeCollaborators}
                        onAddCollaborator={handleAddCollaborator}
                        activeProjectName={activeProject.name}
                      />
                    </div>
                  )}

                  {currentSection === "chat" && (
                    <div id="live-chat-cockpit-view" className="animate-fade-in flex flex-col bg-[#070a0f] border border-[#30363D] rounded-xl overflow-hidden shadow h-full max-h-[390px] min-h-[340px]">
                      {/* Active header of Co-Dev Chat - Sleeker & tight */}
                      <div className="py-2.5 px-3.5 border-b border-[#30363D]/65 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 bg-[#0d121c]">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="text-blue-400 font-bold" size={14} />
                          <span className="text-[11px] uppercase font-mono font-black text-white tracking-widest">Kênh phối hợp Co-Dev</span>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          <span className="text-[9px] text-[#8B949E] uppercase font-mono hidden md:inline">Online:</span>
                          {activeCollaborators.map((col, i) => (
                            <span key={i} className="text-[9px] font-mono bg-[#161b22] border border-[#30363D] px-1.5 py-0.5 rounded text-[#58A6FF] flex items-center gap-1 shrink-0">
                              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                              {col.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Message Feed inside Cockpit view - Highly condensed */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[270px] min-h-[220px]">
                        {chatMessages.map(msg => {
                          const isYou = msg.sender.includes("You");
                          return (
                            <div 
                              key={msg.id}
                              className={`flex gap-2.5 text-[11px] leading-relaxed max-w-2xl ${
                                msg.isAgent ? "bg-indigo-950/15 p-2 rounded-lg border border-indigo-500/15" : "p-0.5"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black uppercase text-[9px] shrink-0 select-none ${
                                isYou ? "bg-[#3FB950]/20 text-[#3FB950] border border-[#3FB950]/35" : "bg-slate-800 text-[#58A6FF]"
                              }`}>
                                {msg.sender.substring(0, 2)}
                              </div>
                              <div className="space-y-0.5 flex-1 select-text">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-bold font-mono text-[10px] ${isYou ? "text-[#3FB950]" : "text-zinc-200"}`}>
                                    {msg.sender}
                                  </span>
                                  {msg.role && (
                                    <span className="text-[7.5px] bg-[#161B22] text-[#8b919a] border border-slate-700/50 px-1 py-0.2 rounded uppercase font-mono">
                                      {msg.role}
                                    </span>
                                  )}
                                  <span className="text-[8px] text-[#8B949E]">{msg.timestamp}</span>
                                </div>
                                <p className="text-[#b1bccc] font-sans text-[11px] font-medium leading-tight">{msg.text}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef}></div>
                      </div>

                      {/* Chat box input integrated right inside Cockpit view - Sleek small footer bar */}
                      <div className="p-2 border-t border-[#30363D] bg-slate-900/40 shrink-0">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSendChatMessage();
                              }
                            }}
                            placeholder="Nhập tin nhắn gửi nhóm dev... (Enter)"
                            className="bg-[#090d13] border border-[#30363D] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 flex-1 focus:outline-none focus:border-[#58A6FF] font-sans pointer-events-auto"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSendChatMessage}
                            className="bg-[#3FB950] hover:bg-green-600 text-[#0d1117] px-3 font-extrabold rounded-lg text-[11px] transition shrink-0 cursor-pointer pointer-events-auto flex items-center justify-center gap-1"
                          >
                            <Send size={10} />
                            <span>Gửi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === "plugins" && (
                    <div id="plugins-rendering-view" className="animate-fade-in">
                      <PluginManager
                        plugins={customPlugins}
                        onAddPlugin={handleAddPlugin}
                        onDeletePlugin={handleDeletePlugin}
                        onTogglePlugin={handleTogglePlugin}
                      />
                    </div>
                  )}

                  {currentSection === "deployments" && (
                    <div className="space-y-6" id="deployments-registry-tab">
                      <div className="p-5 bg-[#161B22] rounded-xl border border-[#30363D]">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-sans">
                          <Globe className="text-[#BC8CFF]" size={20} />
                          Durable Deployment Ledger
                        </h2>
                        <p className="text-xs text-[#8B949E] font-sans">
                          Verify hosting builds, active routing channels, static edge bundles, and live revision states.
                        </p>
                      </div>

                      {activeProject.deployments.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed border-[#30363D] rounded-xl bg-[#161B22] text-xs font-sans">
                          <Globe size={32} className="text-[#8B949E] mx-auto mb-3 opacity-40" />
                          <span className="text-white font-bold block mb-1">No Deployed Releases Found</span>
                          <span className="text-[#8B949E]">Deploy using the top button or command 'deploy' in terminal.</span>
                        </div>
                      ) : (
                        <div className="space-y-4 font-mono text-xs">
                          {activeProject.deployments.map((dep, index) => (
                            <div 
                              key={index}
                              className="p-4 rounded-xl border border-[#30363D] bg-[#161B22] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-600 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-[#BC8CFF]/10 text-[#BC8CFF] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {dep.provider} Edge
                                  </span>
                                  <span className="text-white font-bold">{dep.url}</span>
                                </div>
                                <p className="text-[11px] text-[#8B949E]">
                                  Release Branch: <span className="text-[#D29922] font-semibold">{dep.branch}</span> &bull; Revision: <span className="text-[#58A6FF]">{dep.commitHash}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs bg-[#3FB950]/15 text-[#3FB950] px-3 py-1 font-bold rounded-full border border-[#3FB950]/30 animate-pulse">
                                  LIVE ACTIVE
                                </span>
                                <a 
                                  href={dep.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-[#30363D] hover:bg-slate-700 p-2 rounded text-white transition flex items-center gap-1 text-[11px]"
                                >
                                  <ExternalLink size={12} /> Visit Site
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legacy sidebars rendered only if showLegacySidebar is checked */}
      {showLegacySidebar && (
        <nav id="terkix-nav-rail" className="w-16 min-h-screen flex flex-col items-center py-6 border-r border-[#30363D] bg-[#161B22] justify-between z-10 shrink-0 select-text">
          <div className="flex flex-col items-center gap-8 w-full">
            <img src="/terkix-logo.svg" alt="TerKix logo" className="w-11 h-11 rounded-xl border border-[#30363D] bg-black transition transform hover:scale-105 mb-4 shadow-[0_0_18px_rgba(63,185,80,0.25)]" title="TerKix Terminal OS" />
            
            <div className="flex flex-col gap-6 w-full px-2" id="nav-rail-tabs">
              <button
                onClick={() => setCurrentSection("terminal")}
                id="tab-terminal"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "terminal" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Agent Terminal OS"
              >
                <TerminalIcon size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("dashboard")}
                id="tab-dashboard"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "dashboard" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="System Dashboard"
              >
                <Activity size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("projects")}
                id="tab-workspaces"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "projects" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Workspaces Registry"
              >
                <FolderGit2 size={20} />
              </button>
              <button
                onClick={() => {
                  setCurrentSection("files");
                  if (activeProject.files.length > 0 && !selectedFilePath) {
                    setSelectedFilePath(activeProject.files[0].path);
                  }
                }}
                id="tab-editor"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "files" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Source Code Editor"
              >
                <Code size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("agents")}
                id="tab-agents"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "agents" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Agent Architectures"
              >
                <UserCog size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("deployments")}
                id="tab-deployments"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "deployments" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Edge Hosting Deployments"
              >
                <Globe size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("contacts")}
                id="tab-contacts"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "contacts" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Google Contacts & Collaborators"
              >
                <Users size={20} />
              </button>
              <button
                onClick={() => setCurrentSection("plugins")}
                id="tab-plugins"
                className={`p-2.5 rounded-lg text-center cursor-pointer transition relative flex justify-center items-center ${
                  currentSection === "plugins" ? "bg-[#30363D]/60 text-[#58A6FF] border-l-2 border-[#58A6FF]" : "text-[#8B949E] hover:bg-[#30363D]/30 hover:text-white"
                }`}
                title="Premium Plugin Registry"
              >
                <Puzzle size={20} />
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-[#8B949E]">
            <a href="#" className="p-2.5 rounded-lg hover:bg-[#30363D]/40 transition hover:text-white" title="Settings">
              <Settings size={18} />
            </a>
          </div>
        </nav>
      )}

      {showLegacySidebar && (
        <aside id="terkix-sidebar" className="w-[230px] border-r border-[#30363D] bg-[#161B22] flex flex-col justify-between shrink-0 hidden md:flex select-text">
          <div className="flex flex-col border-b border-[#30363D]/60">
            <div className="p-4 font-extrabold text-[10px] uppercase tracking-widest text-[#8B949E] opacity-50 font-mono">
              Active Workspace
            </div>
            <div className="px-3 pb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs justify-between group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2.5 h-2.5 bg-[#3FB950] rounded-full shrink-0"></div>
                  <span className="font-mono text-white truncate font-semibold" title={activeProject.name}>
                    {activeProject.id}
                  </span>
                </div>
                <span className="text-[9px] bg-[#3FB950]/15 text-[#3FB950] px-1 rounded font-bold font-mono">
                  {activeProject.activeBranch}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-[#8B949E]/70 font-mono tracking-wider">Active Agent States</span>
              <div className="space-y-1.5" id="sidebar-agent-states">
                {computedAgents.slice(0, 3).map(ag => {
                  const isWorking = ag.status === "running";
                  return (
                    <div 
                      key={ag.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border border-[#30363D] text-xs font-mono transition-all duration-200 ${
                        isWorking ? "bg-[#30363D]/40 border-[#58A6FF]" : "bg-[#0D1117] opacity-65"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-[#58A6FF] font-semibold">#</span>
                        {ag.role}
                      </span>
                      <span className={`text-[9px] px-1 rounded font-bold ${
                        isWorking ? "text-[#3FB950] bg-[#3FB950]/10 animate-pulse" : "text-[#8B949E] bg-slate-800"
                      }`}>
                        {isWorking ? "BUSY" : "IDLE"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-[#8B949E]/70 font-mono tracking-wider">Files Registry</span>
                <button 
                  onClick={handleCreateFileManually}
                  className="text-[10px] text-[#58A6FF] hover:underline flex items-center gap-0.5"
                  title="Create a file"
                >
                  <Plus size={10} /> Add
                </button>
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-mono text-[#8B949E]">
                <div className="flex items-center gap-1.5 py-1 px-1 font-bold text-[#E6EDF3]">
                  <span>▾</span>
                  <span>workspace/project/</span>
                </div>
                <div className="pl-4 space-y-1 py-1" id="sidebar-files-list">
                  {activeProject.files.map((file, i) => {
                    const isSelected = selectedFilePath === file.path;
                    return (
                      <button
                        key={i}
                        id={`sidebar-file-${i}`}
                        onClick={() => {
                          setSelectedFilePath(file.path);
                          setCurrentSection("files");
                        }}
                        className={`w-full text-left flex items-center gap-2 py-1 px-2 rounded-md truncate transition ${
                          isSelected ? "text-[#58A6FF] bg-[#30363D]/30 border border-[#30363D] font-semibold" : "hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <FileCode2 size={12} className={isSelected ? "text-[#58A6FF]" : "text-[#8B949E]"} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#30363D]/60 bg-[#0D1117] flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#58A6FF]"></span>
              <span>TerKix OS Shell</span>
            </div>
            <span>v1.0.4</span>
          </div>
        </aside>
      )}

      {/* Main Execution View Area */}
      <main className="flex-1 flex flex-col h-screen max-h-screen overflow-hidden bg-black select-text relative">
        
        {/* Clean, high-end professional Top Status Control Bar */}
        <div className="h-9 border-b border-[#21262d] bg-[#0d1017] flex justify-between items-center text-[10.5px] text-[#8b949e] select-none shrink-0 shadow-sm animate-fade-in pr-3">
          
          {/* STATIC FIXED SQUARE HOME BUTTON - Tactile & reactive with a slight scale/bounce transition */}
          <div className="relative h-9 shrink-0 select-none">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: isProcessing ? "#0e1e35" : "#1a4023" }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              onMouseDown={startLongPressTimer}
              onMouseUp={(e) => clearLongPressTimer(e, true)}
              onMouseLeave={(e) => clearLongPressTimer(e, false)}
              onTouchStart={startLongPressTimer}
              onTouchEnd={(e) => {
                e.preventDefault();
                clearLongPressTimer(e, true);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowContext(true);
              }}
              id="iPhone-square-assistive-home"
              className={`h-9 px-5 border-r-2 border-[#3FB950] flex items-center gap-2 cursor-pointer relative font-mono font-black text-[11px] uppercase tracking-wider transition-all duration-150 ${
                isProcessing 
                  ? "bg-[#0c1e36] text-[#58A6FF] border-r-[#58A6FF] shadow-[0_0_15px_rgba(88,166,255,0.55)] animate-pulse" 
                  : "bg-[#142318] border border-[#3FB950] text-[#3FB950] hover:text-[#4ade80] hover:bg-[#1a3822] shadow-[0_0_12px_rgba(63,185,80,0.25)]"
              }`}
              title="Nhấn để mở Menu. Nhấn chuột phải hoặc giữ lâu để mở lối tắt khẩn cấp."
            >
              <Menu size={13} className={`${isProcessing ? "animate-spin text-[#58A6FF]" : "animate-pulse text-[#3FB950]"}`} />
              <span>MENU</span>
              
              {/* Recording Indicator Dot inside the Home button */}
              <span 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isMicActive 
                    ? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" 
                    : "bg-[#3FB950] shadow-[0_0_4px_rgba(63,185,80,0.3)] animate-ping"
                }`} 
                title={isMicActive ? "Microphone active / Đang thu âm" : "Microphone idle / Nhàn rỗi"} 
              />

              {/* Unread live notification badge indicating active session sync & live chat */}
              {activeCollaborators.length > 0 && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
              )}
            </motion.button>

            {/* Quick Context Menu Dropdown */}
            <AnimatePresence>
              {showContext && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40 bg-black/5 md:bg-transparent" 
                    onClick={() => setShowContext(false)} 
                  />
                  {/* Floating Menu Popover */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-9 left-1 w-64 bg-[#0d1117] border-2 border-[#3FB950] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_15px_rgba(63,185,80,0.2)] overflow-hidden font-mono text-[11px] select-none z-50 pointer-events-auto cursor-default"
                  >
                    {/* Header */}
                    <div className="bg-[#161b22] px-3 py-2 border-b border-[#30363D] text-[9.5px] uppercase font-black tracking-wider text-[#58A6FF] flex items-center justify-between">
                      <span>Lối tắt nhanh (Shortcuts)</span>
                      <span className="text-[#3FB950] animate-pulse">tty1 &bull; ready</span>
                    </div>

                    {/* Actions List */}
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setCurrentSection("terminal");
                          setIsNavOpen(false);
                          setShowContext(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#3FB950] hover:text-black transition-all duration-150 text-left text-gray-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <TerminalIcon size={12} className="text-[#3FB950]" />
                          <span className="font-bold">Màn hình Terminal Shell</span>
                        </div>
                        <span className="text-[9px] opacity-60">CLI</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentSection("dashboard");
                          setIsNavOpen(true);
                          setShowContext(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#58A6FF] hover:text-black transition-all duration-150 text-left text-gray-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-[#58A6FF]" />
                          <span className="font-bold">Bảng điều khiển bento</span>
                        </div>
                        <span className="text-[9px] opacity-60">DASHBOARD</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentSection("files");
                          setIsNavOpen(true);
                          setShowContext(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#F0883E] hover:text-black transition-all duration-150 text-left text-gray-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode2 size={12} className="text-[#F0883E]" />
                          <span className="font-bold">Dự án & Tệp tin</span>
                        </div>
                        <span className="text-[9px] opacity-60">FILES</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentSection("chat");
                          setIsNavOpen(true);
                          setShowContext(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-violet-500 hover:text-white transition-all duration-150 text-left text-gray-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={12} className="text-violet-400" />
                          <span className="font-bold">Trò chuyện Co-Dev</span>
                        </div>
                        <span className="text-[9px] opacity-60">CHAT</span>
                      </button>
                    </div>

                    {/* Voice mic toggle control block */}
                    <div className="bg-[#161b22] px-3 py-2.5 border-t border-[#30363D] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-bold text-[9px] text-[#8B949E]">
                        <span>CÀI ĐẶT THOẠI (MICROPHONE)</span>
                        <div className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${isMicActive ? 'bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse' : 'bg-green-400'}`} />
                          <span className="text-[8px] uppercase tracking-tighter">
                            {isMicActive ? "RECORDING" : "IDLE"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={toggleMicrophone}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-bold text-[10px] uppercase transition-all duration-150 cursor-pointer shrink-0 ${
                          isMicActive 
                            ? 'bg-red-950/50 text-red-400 border-red-500/40 hover:bg-red-650 hover:text-white hover:border-red-500' 
                            : 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/25 hover:bg-[#58A6FF] hover:text-black hover:border-transparent'
                        }`}
                      >
                        {isMicActive ? (
                          <>
                            <MicOff size={11} className="animate-bounce" />
                            <span>TẮT MICROPHONE</span>
                          </>
                        ) : (
                          <>
                            <Mic size={11} />
                            <span>BẬT MICROPHONE</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* CRT Scanline Toggle control block */}
                    <div className="bg-[#0c0e12] px-3 py-2 border-t border-[#30363D]/60 flex items-center justify-between">
                      <span className="text-[9.5px] font-medium text-gray-400">Scanline cổ điển (CRT)</span>
                      <button
                        onClick={() => setCrtFilter(!crtFilter)}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-black border transition-all cursor-pointer ${
                          crtFilter 
                            ? 'bg-[#3FB950]/20 text-[#3FB950] border-[#3FB950]/30 hover:bg-[#3FB950]/40' 
                            : 'bg-[#21262d] text-gray-400 border-[#30363D] hover:text-white'
                        }`}
                      >
                        {crtFilter ? "ON" : "OFF"}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex justify-between items-center pl-3">
            {/* Left: Session and Active Node Status */}
            <div className="flex items-center gap-2">
              <img src="/terkix-logo.svg" alt="TerKix" className="h-6 w-6 rounded-md border border-[#30363D] bg-black/60" />
              <span className="hidden md:inline text-[10px] font-black tracking-widest text-white uppercase">TerKix</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3FB950] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3FB950]"></span>
              </span>
              <span className="font-mono font-bold text-white text-[10px] tracking-wide uppercase">TERMUX LIVE</span>
              <span className="text-[#30363D] font-light">/</span>
              <span className="text-[10px] font-mono text-zinc-400">tty1</span>
              <span className="hidden md:inline text-[#30363D] font-light">/</span>
              <span className="hidden md:inline px-1.5 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[9.5px] font-mono text-gray-400">
                project: <span className="text-white font-black">{activeProject.id}</span>
              </span>
            </div>

            {/* Center: Live Terminal Activity Label */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-black/40 border border-[#21262d] rounded-md text-[9.5px] font-mono text-gray-300">
              <TerminalIcon size={10} className="text-[#3FB950] animate-pulse" />
              <span>SHELL SESSION ACTIVE</span>
            </div>

            {/* Right: Telemetry sync and utility controls */}
            <div className="flex items-center gap-2.5 font-mono text-[10px]">
              <span className="hidden sm:inline px-1 py-0.5 rounded bg-[#238636]/10 text-[#3FB950] border border-[#238636]/20 font-bold text-[9px] uppercase">
                Synced
              </span>
              <span className="text-gray-500">
                UTC: {new Date().toISOString().substring(11, 19)}
              </span>
            </div>
          </div>
        </div>

        {/* Section View Router Container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black">
          
          {/* TERMINAL TAB VIEW - ALWAYS ACTIVE BACKGROUND TERMUX */}
          <div className="flex-1 flex flex-col min-h-0" id="terminal-section-layout">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border-b border-[#21262d] bg-[#05070b] text-[10px] font-mono">
                {[
                  { label: "01 COMMAND", text: "Gõ ý tưởng Termux/terminal", color: "text-[#3FB950] border-[#3FB950]/25 bg-[#3FB950]/8" },
                  { label: "02 AGENTS", text: "Planner + Builder xử lý", color: "text-[#58A6FF] border-[#58A6FF]/25 bg-[#58A6FF]/8" },
                  { label: "03 WORKSPACE", text: "Tạo file, preview, chỉnh sửa", color: "text-[#F0883E] border-[#F0883E]/25 bg-[#F0883E]/8" },
                  { label: "04 DEPLOY", text: "Đóng gói & chia sẻ link", color: "text-[#BC8CFF] border-[#BC8CFF]/25 bg-[#BC8CFF]/8" },
                ].map((step) => (
                  <div key={step.label} className={`rounded-xl border px-3 py-2 ${step.color}`}>
                    <div className="font-black tracking-widest">{step.label}</div>
                    <div className="mt-1 text-[#8B949E] normal-case tracking-normal">{step.text}</div>
                  </div>
                ))}
              </div>
              
              {/* Actual Terminal Window */}
              <div className="flex-1 bg-black flex flex-col relative">

                {/* Standard Console Log Viewport with dynamic font scales & retro phosphor theme states */}
                <div 
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    // Detect if user has scrolled away from the bottom (with an 80px buffer)
                    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 80;
                    if (isProcessing && !isAtBottom) {
                      terminalScrollRef.current = false;
                    } else if (isAtBottom) {
                      terminalScrollRef.current = true;
                    }
                  }}
                  className={`flex-1 p-5 font-mono overflow-y-auto space-y-3.5 select-text ${
                    consoleFontSize === "sm" ? "text-[10.5px]" : consoleFontSize === "lg" ? "text-[14.5px]" : "text-[12.5px]"
                  }`}
                >
                    
                    {/* Deep Reasoning Trace Bubble */}
                    {detailedReasoningText && (
                      <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-violet-950/45 to-indigo-950/45 border border-violet-500/30 text-indigo-200 text-[11px] leading-relaxed animate-fade-in font-sans">
                        <div className="flex items-center justify-between border-b border-violet-500/20 pb-2 mb-2 font-bold text-violet-300 pointer-events-auto">
                          <span className="flex items-center gap-1.5 uppercase tracking-wide font-mono">
                            <Cpu size={12} className="text-violet-400 animate-pulse" />
                            Thinking Mode Trace (Tư duy bậc cao)
                          </span>
                          <button 
                            type="button"
                            onClick={() => setDetailedReasoningText("")}
                            className="text-[9px] hover:text-white bg-violet-900/40 border border-violet-500/20 px-1.5 rounded cursor-pointer leading-tight transition"
                          >
                            Close deliberator
                          </button>
                        </div>
                        <p className="whitespace-pre-line text-slate-300 tracking-normal scroll-mt-2 font-mono text-[11px]">{detailedReasoningText}</p>
                      </div>
                    )}

                    {terminalLines.map((line) => {
                      if (line.type === "input") {
                        const targetPrompt = 
                          themeColor === "green" ? "developer@terkix:~$ " : 
                          themeColor === "amber" ? "oracle@amber:~$ " : 
                          themeColor === "cyan" ? "sys@cyan:~$ " : 
                          "matrix@violet:~$ ";
                        
                        const promptColor = 
                          themeColor === "green" ? "text-[#3FB950]" :
                          themeColor === "amber" ? "text-amber-500" :
                          themeColor === "cyan" ? "text-cyan-400" :
                          "text-[#BC8CFF]";

                        return (
                          <div key={line.id} className="flex gap-2.5 items-start">
                            <span className={`${promptColor} font-bold shrink-0`}>{targetPrompt}</span>
                            <span className="text-white font-medium break-all whitespace-pre-wrap">{line.text}</span>
                          </div>
                        );
                      }
                      if (line.type === "agent-info") {
                        return (
                          <div key={line.id} className="p-2.5 rounded-lg bg-[#30363D]/25 border-l-2 border-[#58A6FF] text-[#E6EDF3] block whitespace-pre-line leading-relaxed">
                            <span className="text-[#58A6FF] font-bold uppercase text-[10px] tracking-wider block mb-1">
                              [{line.agent}] Trace Log:
                            </span>
                            {line.text}
                          </div>
                        );
                      }
                      if (line.type === "agent-success") {
                        return (
                          <div key={line.id} className="p-2.5 rounded-lg bg-[#3FB950]/10 border-l-2 border-[#3FB950] text-[#3FB950] block whitespace-pre-line leading-relaxed">
                            <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-1">
                              [{line.agent || "AGENT STACK"} SUCCESS]
                            </span>
                            {line.text}
                          </div>
                        );
                      }
                      if (line.type === "success") {
                        return (
                          <div key={line.id} className="text-[#3FB950] font-medium leading-relaxed bg-[#3FB950]/5 p-2 rounded border border-[#3FB950]/20 whitespace-pre-line">
                            {line.text}
                          </div>
                        );
                      }
                      if (line.type === "warning") {
                        return (
                          <div key={line.id} className="text-[#D29922] font-medium bg-[#D29922]/5 p-2.5 rounded border border-[#D29922]/20 leading-relaxed font-sans flex gap-2">
                            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#D29922]" />
                            <span>{line.text}</span>
                          </div>
                        );
                      }
                      if (line.type === "danger") {
                        return (
                          <div key={line.id} className="text-[#F85149] font-bold leading-relaxed bg-[#F85149]/5 p-2 rounded border border-[#F85149]/20 whitespace-pre-line">
                            {line.text}
                          </div>
                        );
                      }
                      
                      const systemTextGlow = 
                        themeColor === "green" ? "text-emerald-300/90" :
                        themeColor === "amber" ? "text-amber-300/90" :
                        themeColor === "cyan" ? "text-cyan-300/90" :
                        "text-fuchsia-300/90";

                      return (
                        <div key={line.id} className={`${systemTextGlow} font-normal leading-relaxed whitespace-pre-wrap`}>
                          {line.text}
                        </div>
                      );
                    })}

                    {/* Typing stream thinking indicators */}
                    {isProcessing && (
                      <div className="flex gap-2.5 items-center text-[#58A6FF] font-bold py-1">
                        <span className="animate-pulse bg-[#58A6FF]/20 px-2 py-0.5 rounded text-[10px]">AI RUNNING</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#58A6FF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-[#58A6FF] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-[#58A6FF] rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}

                    <div ref={terminalEndRef}></div>
                  </div>

                  {/* Authentic Termux Virtual Keyboard bar accessory panel */}
                <div className="flex items-center justify-between border-t border-[#13171e] bg-[#070a0e] px-3 py-1.5 gap-1.5 select-none overflow-x-auto shrink-0" id="termux-virtual-keyboard">
                  <div className="flex gap-1">
                    {["ESC", "TAB", "CTRL", "ALT", "-", "+", "CLEAR"].map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleTermKeyAction(k)}
                        className="px-2.5 py-1 font-mono text-[10px] font-bold bg-[#141921] border border-[#2a303b] text-slate-300 hover:text-white rounded-md cursor-pointer select-none active:bg-neutral-850 hover:border-slate-500 active:scale-95 transition pointer-events-auto"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 pr-1 shrink-0">
                    {["PGUP", "PGDN"].map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleTermKeyAction(k)}
                        className="px-2 py-1 font-mono text-[9px] font-bold bg-[#141921] border border-[#2a303b] text-gray-400 rounded-md cursor-pointer hover:text-white select-none active:scale-95 transition pointer-events-auto"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fully Integrated Termux Command Console Input field of Termux */}
                <form
                  onSubmit={handleCommandSubmit}
                  className="h-11 border-t border-[#1b212c] px-3.5 flex items-center gap-2.5 bg-[#02050a] shrink-0 focus-within:bg-[#03070f] focus-within:border-[#3FB950]/55 transition-all duration-150"
                >
                  <span className="text-emerald-400 font-extrabold font-mono text-[12.5px] select-none tracking-tight animate-pulse">~ $</span>
                  <input
                    type="text"
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Nhập lệnh hoặc yêu cầu tự động chỉnh sửa ứng dụng..."
                    className="bg-transparent border-none outline-none flex-1 font-mono text-[11.5px] md:text-[12px] font-bold text-white placeholder-gray-600 focus:ring-0 select-text leading-relaxed tracking-wide"
                    autoFocus
                  />
                  
                  {/* Thinking brain trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setThinkingMode(!thinkingMode);
                      if (!thinkingMode) {
                        setDetailedReasoningText("Thinking Mode activated (Tư duy sâu). Custom requirements decompose triggers live inside isolated agent stacks.");
                      } else {
                        setDetailedReasoningText("");
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-sans font-bold rounded border transition flex items-center gap-1 cursor-pointer select-none pointer-events-auto ${
                      thinkingMode 
                        ? "bg-violet-950/40 border-violet-500 text-violet-300 shadow font-extrabold animate-pulse" 
                        : "bg-[#0b1017] border-[#202730] text-gray-400 hover:text-white"
                    }`}
                    title="Activate agent reasoning paths"
                  >
                    <Cpu size={11} className={thinkingMode ? "text-violet-400 rotate-180" : "text-gray-500"} />
                    <span className="hidden sm:inline">reasoning {thinkingMode ? "on" : "off"}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="p-1 px-3 text-[#0D1117] font-bold text-xs font-sans rounded bg-[#3FB950] hover:bg-green-500 transition flex items-center gap-1 cursor-pointer shrink-0 pointer-events-auto"
                  >
                    <span>run</span>
                    <Send size={10} />
                  </button>
                </form>
              </div>

            </div>



        </div>
      </main>
    </div>
  );
}
