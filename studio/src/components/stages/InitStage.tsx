import React from 'react';
import { Play, FolderOpen, FolderSearch, ChevronRight, Home, ArrowUp } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { api } from '../../services/api';

// ─── Directory Browser Modal ────────────────────────────────────

function BrowseModal({
  onSelect,
  onClose,
}: {
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  const [currentPath, setCurrentPath] = React.useState('');
  const [folders, setFolders] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadDir = React.useCallback(async (dir?: string) => {
    setLoading(true);
    setError('');
    const result = await api.browse(dir);
    if (result.success && result.path) {
      setCurrentPath(result.path);
      setFolders(result.folders ?? []);
    } else {
      setError(String((result as unknown as Record<string, unknown>).error ?? 'Failed to list directory'));
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { loadDir(); }, [loadDir]);

  const goUp = () => {
    const parent = currentPath.replace(/\/[^/]+$/, '') || '/';
    loadDir(parent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[540px] max-h-[70vh] flex flex-col rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Select Directory</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        {/* Current path + navigation */}
        <div className="flex items-center gap-1 border-b border-gray-800 px-4 py-2">
          <button onClick={() => loadDir('/')} className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white" title="Root">
            <Home size={14} />
          </button>
          <button onClick={goUp} className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white" title="Go up">
            <ArrowUp size={14} />
          </button>
          <span className="ml-1 flex-1 truncate text-xs text-gray-300 font-mono">{currentPath}</span>
        </div>

        {/* Folder list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading && <p className="px-2 text-xs text-gray-500">Loading...</p>}
          {error && <p className="px-2 text-xs text-red-400">{error}</p>}
          {!loading && folders.length === 0 && !error && (
            <p className="px-2 text-xs text-gray-500 italic">No subdirectories</p>
          )}
          {folders.map((name) => (
            <button
              key={name}
              onDoubleClick={() => loadDir(`${currentPath}/${name}`)}
              onClick={() => loadDir(`${currentPath}/${name}`)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-800"
            >
              <FolderOpen size={14} className="shrink-0 text-azure-400" />
              <span className="truncate">{name}</span>
              <ChevronRight size={12} className="ml-auto shrink-0 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3">
          <span className="text-xs text-gray-500 truncate max-w-[300px]">{currentPath}</span>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs" onClick={onClose}>Cancel</button>
            <button className="btn-primary text-xs" onClick={() => { onSelect(currentPath); onClose(); }}>Select</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Init Stage ─────────────────────────────────────────────────

export default function InitStage() {
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
  const addLog = useProjectStore((s) => s.addLog);
  const [loading, setLoading] = React.useState(false);
  const [showBrowse, setShowBrowse] = React.useState(false);
  const [openPath, setOpenPath] = React.useState('');
  const [openLoading, setOpenLoading] = React.useState(false);

  const handleInit = async () => {
    if (!project.name) return;
    setLoading(true);
    addLog({ agent: 'System', message: `Initializing project "${project.name}"...` });
    try {
      const result = await api.init({
        name: project.name,
        location: project.location,
        iacTool: project.iacTool,
        aiProvider: project.aiProvider,
        environment: project.environment,
        template: project.template || undefined,
        cwd: project.cwd || undefined,
      });
      if (result.success) {
        if (result.projectDir) {
          setProject({ cwd: result.projectDir, initialized: true });
          addLog({ agent: 'System', message: `Project initialized successfully. Working directory set to ${result.projectDir}` });
        } else {
          setProject({ initialized: true });
          addLog({ agent: 'System', message: 'Project initialized successfully.' });
        }
      } else {
        addLog({ agent: 'System', message: `Init failed: ${result.stderr}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async () => {
    if (!openPath) return;
    setOpenLoading(true);
    addLog({ agent: 'System', message: `Opening project from ${openPath}...` });
    const result = await api.openProject(openPath);
    if (result.success && result.project) {
      setProject({
        name: result.project.name || '',
        location: result.project.location || 'eastus',
        iacTool: result.project.iacTool || 'terraform',
        aiProvider: result.project.aiProvider || 'copilot',
        environment: result.project.environment || 'dev',
        cwd: result.projectDir || openPath,
        initialized: true,
      });
      addLog({ agent: 'System', message: `Opened project "${result.project.name}" from ${result.projectDir}` });
    } else {
      addLog({ agent: 'System', message: `Open failed: ${result.error || result.stderr}` });
    }
    setOpenLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {showBrowse && (
        <BrowseModal
          onSelect={(p) => setProject({ cwd: p })}
          onClose={() => setShowBrowse(false)}
        />
      )}

      {/* ── Open Existing Project ─────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-white">Open Existing Project</h2>
        <p className="mt-1 text-sm text-gray-400">
          Point to a directory that already contains a{' '}
          <code className="rounded bg-gray-800 px-1 text-azure-300">prototype.yaml</code>{' '}
          to resume working on it.
        </p>
      </div>

      <div className="card">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="/path/to/existing-project"
            value={openPath}
            onChange={(e) => setOpenPath(e.target.value)}
          />
          <button
            className="btn-secondary flex items-center gap-1"
            onClick={() => {
              setShowBrowse(true);
              // After modal closes, sync openPath with selected
              const unsub = useProjectStore.subscribe((s) => {
                if (s.project.cwd && s.project.cwd !== openPath) {
                  setOpenPath(s.project.cwd);
                  unsub();
                }
              });
            }}
          >
            <FolderOpen size={14} />
            Browse
          </button>
          <button
            className="btn-primary flex items-center gap-1"
            disabled={!openPath || openLoading}
            onClick={handleOpenProject}
          >
            <FolderSearch size={14} />
            {openLoading ? 'Opening...' : 'Open'}
          </button>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs font-medium text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      {/* ── Initialize New Project ────────────────────────── */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Initialize New Project</h2>
          {project.initialized && (
            <span className="rounded-full bg-green-900/40 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-700/50">
              Project Loaded
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-400">
          Configure the basics for your Azure prototype, then run{' '}
          <code className="rounded bg-gray-800 px-1 text-azure-300">
            az prototype init
          </code>
          .
        </p>
      </div>

      <div className="card space-y-4">
        {/* Name */}
        <div>
          <label className="label">Project Name</label>
          <input
            className="input"
            placeholder="my-azure-app"
            value={project.name}
            onChange={(e) => setProject({ name: e.target.value })}
          />
        </div>

        {/* Description — stored locally, used during design phase */}
        <div>
          <label className="label">
            Description{' '}
            <span className="font-normal text-gray-500">(used in Design phase)</span>
          </label>
          <textarea
            className="input min-h-[80px]"
            placeholder="A web application with Azure Functions backend and Cosmos DB..."
            value={project.description}
            onChange={(e) => setProject({ description: e.target.value })}
          />
        </div>

        {/* Azure Region */}
        <div>
          <label className="label">Azure Region</label>
          <select
            className="input"
            value={project.location}
            onChange={(e) => setProject({ location: e.target.value })}
          >
            <option value="eastus">East US</option>
            <option value="eastus2">East US 2</option>
            <option value="westus2">West US 2</option>
            <option value="westus3">West US 3</option>
            <option value="centralus">Central US</option>
            <option value="northeurope">North Europe</option>
            <option value="westeurope">West Europe</option>
            <option value="southeastasia">Southeast Asia</option>
            <option value="australiaeast">Australia East</option>
            <option value="uksouth">UK South</option>
          </select>
        </div>

        {/* IaC Tool */}
        <div>
          <label className="label">Infrastructure-as-Code Tool</label>
          <select
            className="input"
            value={project.iacTool}
            onChange={(e) => setProject({ iacTool: e.target.value })}
          >
            <option value="terraform">Terraform</option>
            <option value="bicep">Bicep</option>
          </select>
        </div>

        {/* AI Provider */}
        <div>
          <label className="label">AI Provider</label>
          <select
            className="input"
            value={project.aiProvider}
            onChange={(e) => setProject({ aiProvider: e.target.value })}
          >
            <option value="copilot">Copilot</option>
            <option value="github-models">GitHub Models</option>
            <option value="azure-openai">Azure OpenAI</option>
          </select>
        </div>

        {/* Environment */}
        <div>
          <label className="label">Target Environment</label>
          <select
            className="input"
            value={project.environment}
            onChange={(e) => setProject({ environment: e.target.value })}
          >
            <option value="dev">Development</option>
            <option value="staging">Staging</option>
            <option value="prod">Production</option>
          </select>
        </div>

        {/* Template */}
        <div>
          <label className="label">
            Project Template{' '}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <select
            className="input"
            value={project.template}
            onChange={(e) => setProject({ template: e.target.value })}
          >
            <option value="">None — blank project</option>
            <option value="web-app">Web App</option>
            <option value="data-pipeline">Data Pipeline</option>
            <option value="ai-app">AI App</option>
            <option value="microservices">Microservices</option>
            <option value="serverless-api">Serverless API</option>
          </select>
        </div>

        {/* Working directory */}
        <div>
          <label className="label">Working Directory</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="/path/to/project"
              value={project.cwd}
              onChange={(e) => setProject({ cwd: e.target.value })}
            />
            <button
              className="btn-secondary flex items-center gap-1"
              onClick={() => setShowBrowse(true)}
            >
              <FolderOpen size={14} />
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        className="btn-primary flex items-center gap-2"
        disabled={!project.name || loading || project.initialized}
        onClick={handleInit}
      >
        <Play size={16} />
        {loading ? 'Initializing...' : project.initialized ? 'Already Initialized' : 'Initialize Project'}
      </button>
    </div>
  );
}
