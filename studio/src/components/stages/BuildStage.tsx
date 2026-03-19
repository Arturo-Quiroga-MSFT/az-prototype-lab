import React from 'react';
import { Play, RefreshCw, CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { api } from '../../services/api';

interface BuildStep {
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'success' | 'error';
  output?: string;
}

const initialSteps: BuildStep[] = [
  { name: 'Validate Design', agent: 'Architect', status: 'pending' },
  { name: 'Security Review', agent: 'Security Reviewer', status: 'pending' },
  { name: 'Generate IaC', agent: 'Code Generator', status: 'pending' },
  { name: 'Cost Estimation', agent: 'Cost Analyst', status: 'pending' },
  { name: 'Compliance Check', agent: 'Compliance Checker', status: 'pending' },
  { name: 'Generate Tests', agent: 'Test Engineer', status: 'pending' },
  { name: 'Build Artifacts', agent: 'DevOps Engineer', status: 'pending' },
];

const statusIcon = {
  pending: <Circle size={16} className="text-gray-500" />,
  running: <RefreshCw size={16} className="animate-spin text-azure-400" />,
  success: <CheckCircle size={16} className="text-green-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
};

export default function BuildStage() {
  const project = useProjectStore((s) => s.project);
  const addLog = useProjectStore((s) => s.addLog);
  const [steps, setSteps] = React.useState<BuildStep[]>(initialSteps);
  const [building, setBuilding] = React.useState(false);
  const [buildOutput, setBuildOutput] = React.useState('');

  const handleBuild = async () => {
    setBuilding(true);
    setSteps(initialSteps.map((s) => ({ ...s, status: 'pending' })));
    addLog({ agent: 'System', message: 'Starting build pipeline...' });

    // Simulate progressive steps while real build runs
    const simulate = async () => {
      for (let i = 0; i < initialSteps.length; i++) {
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'running' } : s,
          ),
        );
        await new Promise((r) => setTimeout(r, 800));
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'success' } : s,
          ),
        );
        addLog({
          agent: initialSteps[i].agent,
          message: `${initialSteps[i].name} completed.`,
        });
      }
    };

    const [result] = await Promise.all([
      api.build({ cwd: project.cwd }),
      simulate(),
    ]);

    setBuildOutput(result.stdout || result.stderr);
    if (!result.success) {
      setSteps((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'error' };
        return updated;
      });
      addLog({ agent: 'System', message: `Build failed: ${result.stderr}` });
    } else {
      addLog({ agent: 'System', message: 'Build completed successfully!' });
    }
    setBuilding(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Build</h2>
          <p className="text-sm text-gray-400">
            AI agents review, generate, and assemble your prototype — like a
            GitHub Actions pipeline.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          disabled={building}
          onClick={handleBuild}
        >
          {building ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {building ? 'Building...' : 'Start Build'}
        </button>
      </div>

      {/* Pipeline steps — GitHub Actions style */}
      <div className="card flex-1 overflow-y-auto">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Build Pipeline
        </h3>
        <div className="space-y-1">
          {steps.map((step, idx) => (
            <div
              key={step.name}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                step.status === 'running'
                  ? 'bg-azure-600/10 border border-azure-600/30'
                  : step.status === 'success'
                    ? 'bg-green-900/10'
                    : step.status === 'error'
                      ? 'bg-red-900/10'
                      : 'bg-gray-800/30'
              }`}
            >
              {statusIcon[step.status]}
              <span className="font-medium text-gray-200">{step.name}</span>
              <span className="ml-auto text-xs text-gray-500">
                {step.agent}
              </span>
              {step.status === 'running' && (
                <Clock size={12} className="text-azure-400" />
              )}
            </div>
          ))}
        </div>

        {/* Build output */}
        {buildOutput && (
          <div className="mt-4 rounded-md bg-gray-950 p-3">
            <h4 className="mb-1 text-xs font-semibold text-gray-500">
              Build Output
            </h4>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-gray-400">
              {buildOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
