import React from 'react';
import { Play, FolderOpen } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { api } from '../../services/api';

export default function InitStage() {
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
  const addLog = useProjectStore((s) => s.addLog);
  const [loading, setLoading] = React.useState(false);

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
      addLog({
        agent: 'System',
        message: result.success
          ? 'Project initialized successfully.'
          : `Init failed: ${result.stderr}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Initialize Project</h2>
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
            <button className="btn-secondary flex items-center gap-1">
              <FolderOpen size={14} />
              Browse
            </button>
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        className="btn-primary flex items-center gap-2"
        disabled={!project.name || loading}
        onClick={handleInit}
      >
        <Play size={16} />
        {loading ? 'Initializing...' : 'Initialize Project'}
      </button>
    </div>
  );
}
