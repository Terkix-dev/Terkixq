/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from "../types";

export const PRESET_PROJECTS: Project[] = [
  {
    id: "sass-launchpad",
    name: "SaaS Rocket Space",
    description: "A conversion-optimized SaaS Landing Page with a Bento modern feature grid, pricing structures, and active analytics graphs.",
    createdAt: "2026-06-01T10:00:00Z",
    status: "active",
    activeBranch: "main",
    branches: [
      { name: "main", isCurrent: true },
      { name: "feature-pricing", isCurrent: false },
      { name: "dev-analytics", isCurrent: false }
    ],
    commitHistory: [
      {
        hash: "a4c28f1",
        message: "Refactor feature grid grid-cols and improve high-contrast responsiveness",
        author: "Alex Builder Agent",
        date: "2026-06-06T18:24:00Z"
      },
      {
        hash: "7e9b0c4",
        message: "Add interactive Pricing section with annual/monthly billing toggle",
        author: "Sarah Designer Agent",
        date: "2026-06-04T12:15:00Z"
      },
      {
        hash: "1d0f5e3",
        message: "Initial repository commit and boilerplate boilerplate configurations",
        author: "RKix Planner Agent",
        date: "2026-06-01T10:05:00Z"
      }
    ],
    deployments: [
      {
        id: "dep-1",
        provider: "Vercel",
        status: "live",
        url: "https://rocket-space.vercel.app",
        branch: "main",
        createdAt: "2026-06-06T18:45:00Z",
        commitHash: "a4c28f1"
      },
      {
        id: "dep-2",
        provider: "Railway",
        status: "rolled_back",
        url: "https://rocket-space.railway.app",
        branch: "feature-pricing",
        createdAt: "2026-06-04T12:30:00Z",
        commitHash: "7e9b0c4"
      }
    ],
    files: [
      {
        path: "workspace/project/index.html",
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rocket Space SaaS</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0D1117] text-[#E6EDF3] font-sans antialiased">
  <!-- Navbar -->
  <header class="border-b border-[#30363D] bg-[#161B22] px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#58A6FF] to-[#3FB950] flex items-center justify-center text-white font-extrabold text-sm shadow">R</div>
      <span class="text-lg font-bold tracking-tight text-white">RocketSpace</span>
    </div>
    <nav class="hidden md:flex items-center gap-6 text-sm text-[#8B949E]">
      <a href="#features" class="hover:text-white transition">Features</a>
      <a href="#pricing" class="hover:text-white transition">Pricing</a>
      <a href="#analytics" class="hover:text-white transition">Analytics</a>
    </nav>
    <button class="bg-[#58A6FF] hover:bg-blue-600 text-slate-900 font-semibold px-4 py-1.5 rounded-md text-sm transition">
      Launch Free
    </button>
  </header>

  <!-- Hero -->
  <section class="max-w-5xl mx-auto px-6 py-20 text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-[#58A6FF] rounded-full text-xs font-medium border border-[#58A6FF]/20 mb-6">
      <span class="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse"></span>
      Supercharged AI-Native Automation
    </div>
    <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-none max-w-3xl mx-auto mb-6">
      Deploy Applications in <span class="bg-gradient-to-r from-[#58A6FF] to-[#3FB950] bg-clip-text text-transparent">Seconds</span> Using Natural Language.
    </h1>
    <p class="text-base md:text-lg text-[#8B949E] max-w-xl mx-auto mb-8">
      RocketSpace coordinate multi-agent system teams that build, scaffold, test, and host software. Just describe it, we run it live.
    </p>
    <div class="flex items-center justify-center gap-4">
      <input type="text" placeholder="What are we building today?" class="w-80 px-4 py-2.5 rounded-lg border border-[#30363D] bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF] text-sm" />
      <button class="bg-[#3FB950] hover:bg-green-600 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm transition">
        Execute AI
      </button>
    </div>
  </section>

  <!-- Bento Bento Feature Grid -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-12 border-t border-[#30363D] mb-12">
    <h2 class="text-2xl font-bold text-white text-center mb-10">Bento Engineered Modules</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="p-6 bg-[#161B22] rounded-xl border border-[#30363D] md:col-span-2">
        <div class="text-[#58A6FF] text-xs font-mono mb-2">[01] AI Orchestrator</div>
        <h3 class="text-lg font-bold text-white mb-2">Simulated Multi-Agent Synapse</h3>
        <p class="text-sm text-[#8B949E]">
          Planner, Builder, Designer, and Debugger agents negotiate system requirements client-side using customized state machines for fast and secure compilation.
        </p>
        <div class="mt-6 h-28 rounded-lg bg-[#0D1117] border border-[#30363D] p-3 font-mono text-[11px] text-[#3FB950] overflow-hidden">
          <p class="text-slate-500">// Terminal Agent Stream Active</p>
          <p class="mt-1">&gt; Planner: Analyzing SaaS requirements...</p>
          <p class="text-[#58A6FF]">&gt; Builder: Scaffolded 'workspace/project/src/Navbar.tsx' [Success]</p>
          <p class="text-[#D29922]">&gt; Debugger: 0 Warnings, TypeScript compiled.</p>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="p-6 bg-[#161B22] rounded-xl border border-[#30363D]">
        <div class="text-[#3FB950] text-xs font-mono mb-2">[02] Git Engine</div>
        <h3 class="text-lg font-bold text-white mb-2">Branch-Level Snapshots</h3>
        <p class="text-sm text-[#8B949E]">
          Roll back configurations with atomic checkpoints. Instantly view logs, branch maps, and differences.
        </p>
        <div class="mt-4 flex flex-col gap-2">
          <div class="px-2 py-1.5 rounded bg-blue-500/10 border border-[#58A6FF]/20 text-xs text-[#58A6FF] font-mono">
            * (main) a4c28f1: Refactor grid
          </div>
          <div class="px-2 py-1.5 rounded bg-slate-800/40 border border-[#30363D] text-xs text-[#8B949E] font-mono">
            o (feature) 7e9b0c4: Pricing Section
          </div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`
      },
      {
        path: "workspace/project/src/components/FeatureGrid.tsx",
        name: "FeatureGrid.tsx",
        language: "tsx",
        content: `import React from 'react';

export default function FeatureGrid() {
  const features = [
    { id: '1', title: 'Autonomous Planner', desc: 'Analyzes parameters, creates markdown plans, and builds tasks.' },
    { id: '2', title: 'Builder Engine', desc: 'Scaffolds complete files, packages, indices, and asset matrices.' },
    { id: '3', title: 'Pris Designer', desc: 'Adds high-fidelity interactive elements, modern layout, and fonts.' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {features.map(f => (
        <div key={f.id} id={\`feat-\${f.id}\`} className="p-5 rounded-lg border border-[#30363D] bg-[#161B22] hover:border-[#58A6FF] transition">
          <h4 className="text-white font-bold text-base mb-1">{f.title}</h4>
          <p className="text-xs text-[#8B949E]">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}`
      },
      {
        path: "workspace/project/src/App.tsx",
        name: "App.tsx",
        language: "tsx",
        content: `import React from 'react';
import FeatureGrid from './components/FeatureGrid';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-8">
      <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">SaaS Application Module</h2>
      <p class="text-sm text-[#8B949E] mb-6">Generated on branch 'main' with total validation coverage.</p>
      <FeatureGrid />
    </div>
  );
}`
      }
    ]
  },
  {
    id: "personal-portfolio",
    name: "Minimalist Dev Portfolio",
    description: "A gorgeous retro-inspired dark portfolio featuring project card grids, terminal typing animations, and custom contact overlays.",
    createdAt: "2026-06-03T09:00:00Z",
    status: "active",
    activeBranch: "main",
    branches: [
      { name: "main", isCurrent: true },
      { name: "dev", isCurrent: false }
    ],
    commitHistory: [
      {
        hash: "e2b09c5",
        message: "Add retro CRT scanning line glow effects and customize scrollbars",
        author: "Sarah Designer Agent",
        date: "2026-06-05T15:10:00Z"
      },
      {
        hash: "cd8b1f0",
        message: "Scaffold visual timeline and custom interactive resume cards",
        author: "Alex Builder Agent",
        date: "2026-06-03T11:40:00Z"
      }
    ],
    deployments: [
      {
        id: "dep-3",
        provider: "Cloudflare",
        status: "live",
        url: "https://retro-dev.pages.dev",
        branch: "main",
        createdAt: "2026-06-05T15:30:00Z",
        commitHash: "e2b09c5"
      }
    ],
    files: [
      {
        path: "workspace/project/index.html",
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Minimalist Terminal Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .crt::after {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      z-index: 100;
      background-size: 100% 4px, 6px 100%;
      pointer-events: none;
    }
  </style>
</head>
<body class="bg-[#0B0D0F] text-[#4AF626] font-mono antialiased min-h-screen relative p-6 crt h-full">
  <div class="max-w-3xl mx-auto border border-[#4AF626]/40 rounded bg-[#0E1215] p-6 shadow-2xl shadow-green-500/5">
    <!-- Header -->
    <header class="border-b border-[#4AF626]/30 pb-4 mb-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-black uppercase tracking-wider">SYSTEM: DEV-PORTFOLIO</h1>
        <span class="text-xs bg-[#4AF626]/10 px-2 py-0.5 rounded border border-[#4AF626]/30">LIVE RUNNING</span>
      </div>
      <p class="text-xs text-green-500/60 mt-1">Compiled in 14ms via RKix Terminal OS</p>
    </header>

    <!-- Bio Section -->
    <section class="mb-8">
      <h2 class="text-lg font-bold border-b border-[#4AF626]/20 pb-1 mb-3">&gt; WHO_AM_I</h2>
      <p class="text-sm leading-relaxed text-[#4AF626]/90">
        Greetings. I am an AI-augmented software developer crafting automation software, hyper-scaled distributed services, and terminal layouts that run fully autonomous builds.
      </p>
    </section>

    <!-- Project Timeline -->
    <section class="mb-8">
      <h2 class="text-lg font-bold border-b border-[#4AF626]/20 pb-1 mb-3">&gt; ACTIVE_PROJECTS</h2>
      <div class="space-y-4">
        <div class="p-4 border border-[#4AF626]/20 rounded bg-[#0A0D0F]">
          <div class="flex justify-between text-xs font-bold text-white mb-1">
            <span>[01] DEEP-SEARCH NETWORK</span>
            <span>2026</span>
          </div>
          <p class="text-xs text-green-500/70">An intelligent agent mesh optimizing documentation retrieval queries over distributed database shards.</p>
        </div>
        <div class="p-4 border border-[#4AF626]/20 rounded bg-[#0A0D0F]">
          <div class="flex justify-between text-xs font-bold text-white mb-1">
            <span>[02] RKix KERNEL-FLOW</span>
            <span>2025</span>
          </div>
          <p class="text-xs text-green-500/70">A beautiful custom terminal emulation shell rendering high-speed local developer sandboxes.</p>
        </div>
      </div>
    </section>

    <!-- Console Controller -->
    <footer class="border-t border-[#4AF626]/20 pt-4 flex justify-between items-center text-xs text-green-500/50">
      <span>REFRESH_RATE: 60HZ</span>
      <span>SECURE_SHELL_ACTIVE</span>
    </footer>
  </div>
</body>
</html>`
      }
    ]
  }
];
