/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";
import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

interface WorkspaceFilePayload {
  path: string;
  name?: string;
  content: string;
  language?: string;
}

interface ProjectContextPayload {
  name?: string;
  description?: string;
}

interface GeminiCommandRequest {
  command?: string;
  currentFiles?: WorkspaceFilePayload[];
  projectContext?: ProjectContextPayload;
  activeBranch?: string;
  thinkingMode?: boolean;
}

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "TerKix Terminal OS",
    geminiModel: GEMINI_MODEL,
  });
});

// Lazy initializer for Google GenAI client.
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via the Secrets panel in AI Studio settings.");
    }

    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  return aiClient;
}

function normalizeFiles(files: unknown): WorkspaceFilePayload[] {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.filter((file): file is WorkspaceFilePayload =>
    typeof file?.path === "string" && typeof file?.content === "string"
  );
}

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(unfenced);
}

// REST route for Terminal command processing with Gemini Agent orchestrating.
app.post("/api/gemini/command", async (req, res) => {
  try {
    const { command, currentFiles, projectContext, activeBranch, thinkingMode } = req.body as GeminiCommandRequest;
    const cleanCommand = command?.trim();

    if (!cleanCommand) {
      return res.status(400).json({ error: "Command is required" });
    }

    const ai = getGenAI();
    const normalizedFiles = normalizeFiles(currentFiles);

    // Construct the context representing the current virtual project directory structure and code bases.
    const filesContext = normalizedFiles.length > 0
      ? normalizedFiles.map((file) => `\n--- File: ${file.path} ---\nLanguage: ${file.language || "text"}\nContent:\n${file.content}`).join("\n\n")
      : "[The workspace is currently empty. No files exist yet.]";

    const systemInstruction = `You are the core TerKix Terminal OS agent, directing a multi-agent software development terminal.
You receive:
1. A natural language command or terminal prompt from the developer (e.g. "build an online resume website", "create navbar.tsx", "edit homepage.tsx", "deploy production").
2. The current list of virtual files inside the active workspace directory.
3. The current project metadata (name, description, active branch).

${thinkingMode ? "WARNING: THINKING MODE IS ENABLED. You must spend extra energy pondering architectural choices, trade-offs, potential type conflicts, design principles, and step-by-step logic. You must explain your internal deliberations and planning in detail inside the 'detailedReasoning' response field." : "Thinking Mode is idle."}

Your goal is to parse this input and simulate the response of a highly professional coding agent stack consisting of:
- Planner: Requirement analyst, breaks down the prompt into subtasks, plans scaffolding.
- Builder: Writes high-quality code files (HTML, CSS, beautiful tailwind-styled React modules or scripts).
- Designer: Adds pristine visual touches, layout pacing, tailwind colors, buttons, grid structure, animations.
- Debugger: Validates correctness, points out TypeScript types, adds lint hints.
- Deploy: Simulates build output, artifact bundling, and cloud service links.
- Research: Explains documentation, searches appropriate modules.

You MUST always return a JSON object sticking strictly to the response schema.
Provide a realistic developer workflow inside "agentWorkflow" with detailed logs of what different agents did.
Provide "workspaceChanges" containing:
- filesToCreate: Array of new files. ALWAYS include the fully fleshed out code content (e.g., beautiful Tailwind HTML layouts, React components or style configurations). Avoid placeholders! Provide complete source code!
- filesToEdit: Array of files that are modified, containing the full updated complete content of each file.
- filesToDelete: Array of file paths to remove if specifically requested.

Keep paths starting with "workspace/project/..." to align with the isolated workspace structure, e.g., "workspace/project/index.html" or "workspace/project/src/components/Navbar.tsx".

In "terminalOutput", simulate realistic bash/log terminals (e.g., "$ npx tailwindcss -i src/index.css -o dist/output.css", "Build completed successfully", "Deployed artifacts verified").
In "explanation", generate a human-friendly overview of your agents' execution logs.
In "detailedReasoning", if requested (thinkingMode is true), write a comprehensive, elite, step-by-step thinking process explaining architectural trade-offs, file split analysis, and key logic insights in standard Markdown format. If thinkingMode is false, keep it brief or empty.

IMPORTANT: Act as a real developer-centric Operating System. Be extremely literal and intelligent and write real, beautiful HTML/CSS/component files instead of dummy texts. Make sure to style them beautifully with rich standard Tailwind classes.`;

    const userPrompt = `
*** ACTIVE PROJECT CONTEXT ***
Project Name: ${projectContext?.name || "TerKix Sandbox"}
Description: ${projectContext?.description || "A clean development workspace"}
Active Branch: ${activeBranch || "main"}
THINKING_MODE_ACTIVE: ${thinkingMode ? "TRUE" : "FALSE"}

*** ACTIVE WORKSPACE DIRECTORY AND FILES ***
${filesContext}

*** DEVELOPER INPUT COMMAND ***
${cleanCommand}

Generate the agent workflow, workspace updates, detailed reasoning (if thinking mode is true), and terminal outputs. Make sure to generate detailed, fully-written file contents without leaving any comment-based placeholders (e.g., do not write "// code goes here", write the real complete code).
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commandParsed: {
              type: Type.OBJECT,
              properties: {
                intent: {
                  type: Type.STRING,
                  description: "Categorize input intent: create_project, create_file, edit_file, delete_file, deploy, git_command, general_query",
                },
                target: {
                  type: Type.STRING,
                  description: "The specific filename, branch name, or folder path targeted, if applicable.",
                },
              },
              required: ["intent", "target"],
            },
            agentWorkflow: {
              type: Type.ARRAY,
              description: "The step-by-step collaboration trace of agents participating in solving the command.",
              items: {
                type: Type.OBJECT,
                properties: {
                  agent: { type: Type.STRING, description: "Role name, e.g. Planner, Builder, Designer, Debugger, Deploy, Research" },
                  action: { type: Type.STRING, description: "Action text e.g. Scaffolding structure, Refining CSS layout" },
                  log: { type: Type.STRING, description: "Log details representing thoughts or actual work files processed" },
                },
                required: ["agent", "action", "log"],
              },
            },
            workspaceChanges: {
              type: Type.OBJECT,
              properties: {
                filesToCreate: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      path: { type: Type.STRING, description: "The full path starting with 'workspace/project/'" },
                      name: { type: Type.STRING },
                      content: { type: Type.STRING, description: "The COMPLETE, functional file code" },
                      language: { type: Type.STRING, description: "e.g. html, css, tsx, js, json, md" },
                    },
                    required: ["path", "name", "content", "language"],
                  },
                },
                filesToEdit: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      path: { type: Type.STRING, description: "Path of existing file to update" },
                      content: { type: Type.STRING, description: "The updated FULL contents of the file" },
                    },
                    required: ["path", "content"],
                  },
                },
                filesToDelete: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["filesToCreate", "filesToEdit", "filesToDelete"],
            },
            terminalOutput: {
              type: Type.STRING,
              description: "Simulated text to append to the system command prompt, with color tags or standard console structure.",
            },
            explanation: {
              type: Type.STRING,
              description: "A summary explaining the actions taken in a polite, professional developer voice.",
            },
            detailedReasoning: {
              type: Type.STRING,
              description: "Comprehensive multi-agent thinking, architectural debate, and planning process when thinkingMode is active (in Vietnamese or English matching user language).",
            },
          },
          required: ["commandParsed", "agentWorkflow", "workspaceChanges", "terminalOutput", "explanation"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    return res.json(parseGeminiJson(resultText));
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred while communicating with the AI Core.";
    console.error("Gemini Command processing failed:", error);
    return res.status(500).json({ error: message });
  }
});

// Configure Vite middleware or static file hosting.
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TerKix Terminal OS server booted successfully on port ${PORT} using ${GEMINI_MODEL}`);
  });
}

startServer();
