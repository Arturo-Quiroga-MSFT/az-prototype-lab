import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AgentActivity from './AgentActivity';
import { useProjectStore } from '../stores/projectStore';

export default function Layout() {
  const showAgentPanel = useProjectStore((s) => s.showAgentPanel);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚀</span>
          <h1 className="text-sm font-semibold tracking-wide text-white">
            az prototype Studio
          </h1>
        </div>
        <span className="text-xs text-gray-400">
          Azure rapid-prototyping workbench
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom panel — agent activity */}
      {showAgentPanel && (
        <div className="h-56 shrink-0 border-t border-gray-700 bg-gray-900">
          <AgentActivity />
        </div>
      )}
    </div>
  );
}
