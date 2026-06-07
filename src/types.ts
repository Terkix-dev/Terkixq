/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorkspaceFile {
  path: string; // unique relative path e.g. "workspace/project/src/App.tsx"
  name: string;
  content: string;
  language: string;
}

export type AgentRole = 'Planner' | 'Builder' | 'Designer' | 'Debugger' | 'Deploy' | 'Research';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastAction: string;
  color: string;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'success' | 'danger' | 'warning' | 'agent-info' | 'agent-success';
  text: string;
  agent?: AgentRole;
  timestamp: string;
}

export interface Deployment {
  id: string;
  provider: 'Vercel' | 'Cloudflare' | 'Netlify' | 'Railway';
  status: 'building' | 'live' | 'failed' | 'rolled_back';
  url: string;
  branch: string;
  createdAt: string;
  commitHash: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'archived';
  files: WorkspaceFile[];
  activeBranch: string;
  branches: GitBranch[];
  commitHistory: GitCommit[];
  deployments: Deployment[];
}
