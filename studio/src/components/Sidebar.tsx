import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Settings,
  PenTool,
  Hammer,
  Rocket,
  Bot,
  ChevronDown,
  ChevronRight,
  PanelBottom,
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

const stages = [
  { path: '/init', label: 'Init', icon: Settings, step: 1 },
  { path: '/design', label: 'Design', icon: PenTool, step: 2 },
  { path: '/build', label: 'Build', icon: Hammer, step: 3 },
  { path: '/deploy', label: 'Deploy', icon: Rocket, step: 4 },
] as const;

const agents = [
  { name: 'Architect', role: 'Designs infrastructure' },
  { name: 'Security Reviewer', role: 'Scans for vulnerabilities' },
  { name: 'Cost Analyst', role: 'Estimates Azure costs' },
  { name: 'DevOps Engineer', role: 'Builds CI/CD pipelines' },
  { name: 'Code Generator', role: 'Scaffolds application code' },
  { name: 'Documentation Writer', role: 'Generates docs & specs' },
  { name: 'Compliance Checker', role: 'Validates governance rules' },
  { name: 'Test Engineer', role: 'Generates test cases' },
  { name: 'Deployment Manager', role: 'Orchestrates rollout' },
  { name: 'Network Planner', role: 'Designs connectivity' },
  { name: 'Data Engineer', role: 'Plans data architecture' },
];

export default function Sidebar() {
  const location = useLocation();
  const toggleAgentPanel = useProjectStore((s) => s.toggleAgentPanel);
  const showAgentPanel = useProjectStore((s) => s.showAgentPanel);
  const [agentsOpen, setAgentsOpen] = React.useState(true);

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-700 bg-gray-900/80">
      {/* Stage navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Pipeline Stages
        </p>
        {stages.map(({ path, label, icon: Icon, step }) => {
          const active = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                active
                  ? 'bg-azure-600/20 text-azure-300 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                {step}
              </span>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Agents panel */}
      <div className="border-t border-gray-700 p-3">
        <button
          onClick={() => setAgentsOpen(!agentsOpen)}
          className="flex w-full items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-300"
        >
          {agentsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          AI Agents ({agents.length})
        </button>
        {agentsOpen && (
          <ul className="mt-2 space-y-1">
            {agents.map((a) => (
              <li
                key={a.name}
                className="flex items-center gap-2 rounded px-2 py-1 text-xs text-gray-400"
              >
                <Bot size={12} className="shrink-0 text-azure-400" />
                <span className="truncate" title={a.role}>
                  {a.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Toggle agent activity panel */}
      <div className="border-t border-gray-700 p-2">
        <button
          onClick={toggleAgentPanel}
          className="flex w-full items-center justify-center gap-1 rounded py-1 text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          <PanelBottom size={14} />
          {showAgentPanel ? 'Hide' : 'Show'} Activity
        </button>
      </div>
    </aside>
  );
}
