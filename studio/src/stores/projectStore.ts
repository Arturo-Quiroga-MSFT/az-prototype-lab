import { create } from 'zustand';

export interface ProjectConfig {
  name: string;
  description: string;
  location: string;
  iacTool: string;
  aiProvider: string;
  environment: string;
  template: string;
  cwd: string;
  initialized: boolean;
}

export interface LogEntry {
  agent: string;
  message: string;
  timestamp: string;
}

interface ProjectState {
  project: ProjectConfig;
  setProject: (partial: Partial<ProjectConfig>) => void;

  showAgentPanel: boolean;
  toggleAgentPanel: () => void;

  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    name: '',
    description: '',
    location: 'eastus',
    iacTool: 'terraform',
    aiProvider: 'copilot',
    environment: 'dev',
    template: '',
    cwd: '',
    initialized: false,
  },
  setProject: (partial) =>
    set((state) => ({ project: { ...state.project, ...partial } })),

  showAgentPanel: true,
  toggleAgentPanel: () =>
    set((state) => ({ showAgentPanel: !state.showAgentPanel })),

  logs: [],
  addLog: (entry) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...entry,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    })),
  clearLogs: () => set({ logs: [] }),
}));
