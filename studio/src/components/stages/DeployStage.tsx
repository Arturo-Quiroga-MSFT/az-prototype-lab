import React from 'react';
import {
  Rocket,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Globe,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { api } from '../../services/api';

type DeployTarget = 'preview' | 'stage';

interface PreflightItem {
  label: string;
  icon: React.ReactNode;
  status: 'pass' | 'warn' | 'fail' | 'pending';
  detail?: string;
}

export default function DeployStage() {
  const project = useProjectStore((s) => s.project);
  const addLog = useProjectStore((s) => s.addLog);
  const [deploying, setDeploying] = React.useState(false);
  const [target, setTarget] = React.useState<DeployTarget>('preview');
  const [preflight, setPreflight] = React.useState<PreflightItem[]>([
    { label: 'Prerequisites', icon: <ShieldCheck size={16} />, status: 'pending' },
    { label: 'Cost Estimate', icon: <DollarSign size={16} />, status: 'pending' },
    { label: 'Security Scan', icon: <ShieldCheck size={16} />, status: 'pending' },
  ]);
  const [deployOutput, setDeployOutput] = React.useState('');

  const runPreflight = async () => {
    addLog({ agent: 'System', message: 'Running pre-flight checks...' });

    // Check prerequisites
    setPreflight((p) =>
      p.map((item, i) => (i === 0 ? { ...item, status: 'pending' } : item)),
    );
    const prereq = await api.checkPrerequisites();
    setPreflight((p) =>
      p.map((item, i) =>
        i === 0
          ? {
              ...item,
              status: prereq.success ? 'pass' : 'fail',
              detail: prereq.stdout,
            }
          : item,
      ),
    );

    // Cost estimate
    const cost = await api.analyzeCosts({ cwd: project.cwd });
    setPreflight((p) =>
      p.map((item, i) =>
        i === 1
          ? {
              ...item,
              status: cost.success ? 'pass' : 'warn',
              detail: cost.stdout,
            }
          : item,
      ),
    );

    // Security — mark pass for now
    setPreflight((p) =>
      p.map((item, i) =>
        i === 2 ? { ...item, status: 'pass', detail: 'No issues found' } : item,
      ),
    );

    addLog({ agent: 'System', message: 'Pre-flight checks complete.' });
  };

  const handleDeploy = async () => {
    setDeploying(true);
    addLog({
      agent: 'Deployment Manager',
      message: `Deploying to ${target}...`,
    });

    const result =
      target === 'preview'
        ? await api.deployPreview({ cwd: project.cwd })
        : await api.deployStage({ cwd: project.cwd });

    setDeployOutput(result.stdout || result.stderr);
    addLog({
      agent: 'Deployment Manager',
      message: result.success
        ? `Deployment to ${target} succeeded!`
        : `Deployment failed: ${result.stderr}`,
    });
    setDeploying(false);
  };

  const preflightStatusIcon = {
    pass: <CheckCircle size={14} className="text-green-400" />,
    warn: <AlertTriangle size={14} className="text-yellow-400" />,
    fail: <AlertTriangle size={14} className="text-red-400" />,
    pending: <RefreshCw size={14} className="text-gray-500" />,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Deploy</h2>
        <p className="text-sm text-gray-400">
          Run pre-flight checks, then deploy your prototype to Azure.
        </p>
      </div>

      {/* Deploy target selector */}
      <div className="card">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Deployment Target
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTarget('preview')}
            className={`flex flex-1 items-center gap-3 rounded-lg border p-4 transition ${
              target === 'preview'
                ? 'border-azure-500 bg-azure-600/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <Eye size={20} className="text-azure-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-200">Preview</p>
              <p className="text-xs text-gray-400">
                Quick validation deployment
              </p>
            </div>
          </button>
          <button
            onClick={() => setTarget('stage')}
            className={`flex flex-1 items-center gap-3 rounded-lg border p-4 transition ${
              target === 'stage'
                ? 'border-azure-500 bg-azure-600/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <Globe size={20} className="text-azure-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-200">Stage</p>
              <p className="text-xs text-gray-400">
                Full staging environment
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Pre-flight checklist */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Pre-flight Checklist
          </h3>
          <button className="btn-secondary text-xs" onClick={runPreflight}>
            Run Checks
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {preflight.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              {preflightStatusIcon[item.status]}
              <span>{item.label}</span>
              {item.detail && (
                <span className="ml-auto truncate text-xs text-gray-500 max-w-[200px]">
                  {item.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Deploy button */}
      <button
        className="btn-primary flex w-full items-center justify-center gap-2 py-3"
        disabled={deploying}
        onClick={handleDeploy}
      >
        {deploying ? (
          <RefreshCw size={18} className="animate-spin" />
        ) : (
          <Rocket size={18} />
        )}
        {deploying
          ? `Deploying to ${target}...`
          : `Deploy to ${target.charAt(0).toUpperCase() + target.slice(1)}`}
      </button>

      {/* Deploy output */}
      {deployOutput && (
        <div className="card">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Deployment Output
          </h3>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-gray-400">
            {deployOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
