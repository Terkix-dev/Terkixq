/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Layers, 
  FileCode2, 
  Calendar, 
  Play,
  Check
} from "lucide-react";
import { Project } from "../types";

interface ProjectListProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (p: Project) => void;
  onCreateProject: (name: string, description: string) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectList({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}: ProjectListProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProject(newName, newDesc);
    setNewName("");
    setNewDesc("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6" id="projects-manager-container">
      {/* Header section with add button */}
      <div className="flex justify-between items-center bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="text-[#58A6FF]" size={20} />
            Workspace Registry
          </h2>
          <p className="text-xs text-[#8B949E]">
            Isolated environments running independent branch timelines and active file systems.
          </p>
        </div>
        <button
          id="btn-create-workspace"
          onClick={() => setShowAddModal(prev => !prev)}
          className="bg-[#58A6FF] hover:bg-blue-600 text-[#0D1117] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition shrink-0"
        >
          <Plus size={14} />
          Create Space
        </button>
      </div>

      {/* Creation form */}
      {showAddModal && (
        <form onSubmit={handleSubmit} className="p-5 bg-[#161B22] rounded-xl border border-[#30363D] space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white font-mono">_NEW_ISOLATED_WORKSPACE_MANIFEST</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-[#8B949E] mb-1">WORKSPACE_NAME</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. personal-portfolio"
                required
                className="w-full text-xs font-mono px-3 py-2 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8B949E] mb-1">PROJECT_SUMMARY</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="A high-level requirement brief for Planner Agent..."
                rows={2}
                className="w-full text-xs font-mono px-3 py-2 border border-[#30363D] rounded-lg bg-[#0D1117] text-white focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 border border-[#30363D] hover:bg-[#161B22] text-[#8B949E] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#3FB950] hover:bg-green-600 text-[#0D1117] font-bold rounded-lg transition"
            >
              Initialize Workspace
            </button>
          </div>
        </form>
      )}

      {/* Workspace List cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="workspaces-grid">
        {projects.map((proj) => {
          const isActive = proj.id === activeProject.id;
          const filesCount = proj.files.length;
          const locCount = proj.files.reduce((sum, f) => sum + f.content.split("\n").length, 0);

          return (
            <div
              key={proj.id}
              id={`workspace-card-${proj.id}`}
              className={`p-5 rounded-xl border transition duration-300 flex flex-col justify-between ${
                isActive 
                  ? "bg-[#161B22] border-[#58A6FF] ring-1 ring-[#58A6FF]/40 shadow-lg" 
                  : "bg-[#161B22] border-[#30363D] hover:border-[#8B949E]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-blue-500/10 text-[#58A6FF]" : "bg-slate-800 text-[#8B949E]"}`}>
                      <FileCode2 size={16} />
                    </div>
                    <h3 className="font-bold text-white text-sm tracking-tight">{proj.name}</h3>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] bg-[#3FB950]/15 text-[#3FB950] px-2 py-0.5 border border-[#3FB950]/30 rounded-full font-mono font-bold">
                      <Check size={10} /> ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectProject(proj)}
                      className="text-[10px] bg-slate-800 hover:bg-[#30363D] text-[#8B949E] hover:text-white px-2 py-1 rounded transition font-mono"
                    >
                      MOUNT SPACE
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#8B949E] line-clamp-2 h-8">
                  {proj.description || "No project description provided."}
                </p>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#8B949E] pt-2 border-t border-[#30363D]/40">
                  <span className="flex items-center gap-1">
                    <Layers size={12} className="text-[#58A6FF]" />
                    {filesCount} Files
                  </span>
                  <span>&bull;</span>
                  <span>{locCount} Lines of Code</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#30363D]/30 text-xs">
                <div className="text-[10px] font-mono text-[#8B949E]">
                  Branch: <span className="text-[#D29922] font-semibold">{proj.activeBranch}</span>
                </div>
                {!isActive && projects.length > 1 && (
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="text-[#F85149] hover:bg-red-500/10 p-1.5 rounded transition"
                    title="Delete workspace"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
