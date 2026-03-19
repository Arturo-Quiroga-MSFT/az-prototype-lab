import React from 'react';
import { Play, RefreshCw, FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { api } from '../../services/api';

export default function DesignStage() {
  const project = useProjectStore((s) => s.project);
  const addLog = useProjectStore((s) => s.addLog);
  const [loading, setLoading] = React.useState(false);
  const [designOutput, setDesignOutput] = React.useState<string>('');
  const [prompt, setPrompt] = React.useState('');

  const handleDesign = async () => {
    setLoading(true);
    addLog({ agent: 'Architect', message: 'Starting design phase...' });
    try {
      const result = await api.design({ cwd: project.cwd });
      if (result.success) {
        setDesignOutput(result.stdout);
        addLog({ agent: 'Architect', message: 'Design complete — architecture generated.' });
      } else {
        addLog({ agent: 'Architect', message: `Design failed: ${result.stderr}` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Design</h2>
          <p className="text-sm text-gray-400">
            AI agents generate your architecture. Review and iterate on the
            design.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary flex items-center gap-2"
            disabled={loading}
            onClick={handleDesign}
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {loading ? 'Designing...' : 'Run Design'}
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
        {/* Left — conversation / prompt */}
        <div className="card flex flex-col overflow-hidden">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Design Conversation
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 text-sm text-gray-300">
            {designOutput ? (
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {designOutput}
              </pre>
            ) : (
              <p className="text-gray-500 italic">
                Run the design phase to see the AI-generated architecture here.
              </p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Ask the architect to adjust the design..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="btn-secondary" disabled>
              Send
            </button>
          </div>
        </div>

        {/* Right — architecture diagram placeholder */}
        <div className="card flex flex-col items-center justify-center overflow-hidden">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Architecture Diagram
          </h3>
          {designOutput ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-gray-600" />
                <p className="mt-2 text-sm text-gray-400">
                  Design output captured. Diagram visualization coming soon.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <FileText size={48} className="mx-auto opacity-30" />
              <p className="mt-2 text-sm">
                Architecture diagram will render here after design runs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
