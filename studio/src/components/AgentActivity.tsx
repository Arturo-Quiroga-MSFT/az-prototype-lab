import { Bot, Trash2 } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

export default function AgentActivity() {
  const logs = useProjectStore((s) => s.logs);
  const clearLogs = useProjectStore((s) => s.clearLogs);

  return (
    <div className="flex h-full flex-col px-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Agent Activity
        </h3>
        <button
          onClick={clearLogs}
          className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          title="Clear logs"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="mt-1 flex-1 overflow-y-auto space-y-1">
        {logs.length === 0 && (
          <p className="text-xs italic text-gray-600">
            Agent activity will appear here as you run pipeline stages.
          </p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <Bot size={12} className="mt-0.5 shrink-0 text-azure-400" />
            <span className="font-medium text-azure-300">{log.agent}:</span>
            <span className="text-gray-400">{log.message}</span>
            <span className="ml-auto shrink-0 text-gray-600">
              {log.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
