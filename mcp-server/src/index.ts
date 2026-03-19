#!/usr/bin/env node
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * az prototype — MCP Server
 *
 * Wraps the `az prototype` Azure CLI extension as MCP tools so that
 * Claude Desktop, GitHub Copilot, or any MCP-compatible client can
 * orchestrate the full prototype pipeline:
 *
 *   1.  prototype_check_prerequisites — verify az CLI and extension
 *   2.  prototype_init               — initialize a new project
 *   3.  prototype_design             — interactive or context-driven design
 *   4.  prototype_build              — generate IaC and application code
 *   5.  prototype_deploy_preview     — dry-run / what-if preview
 *   6.  prototype_deploy_stage       — deploy a specific stage
 *   7.  prototype_status             — show project status (JSON)
 *   8.  prototype_analyze_costs      — estimate Azure costs (S/M/L)
 *   9.  prototype_analyze_error      — diagnose errors with QA agent
 *  10.  prototype_generate_docs      — generate documentation
 *  11.  prototype_generate_speckit   — generate spec-kit bundle
 *  12.  prototype_generate_backlog   — generate backlog items
 *  13.  prototype_config_show        — show project configuration
 *  14.  prototype_config_set         — set a configuration value
 *  15.  prototype_agent_list         — list all agents
 *  16.  prototype_agent_test         — test an agent with a prompt
 *
 * Transport: stdio (JSON-RPC over stdin/stdout)
 *
 * Usage:
 *   node dist/index.js          # start server (stdio)
 *   npx az-prototype-mcp        # via npx
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { runPrototype, checkPrerequisites } from './cliExecutor.js';

// ── Server initialization ──────────────────────────────────────────────

const server = new McpServer({
  name: 'az-prototype',
  version: '1.0.0',
});

// ── Tool 1: prototype_check_prerequisites ──────────────────────────────

server.tool(
  'prototype_check_prerequisites',
  'Check if Azure CLI and the az prototype extension are installed and available. Returns version information for both. Run this first to verify the environment is ready.',
  {},
  async () => {
    const result = await checkPrerequisites();
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ── Tool 2: prototype_init ─────────────────────────────────────────────

server.tool(
  'prototype_init',
  'Initialize a new az prototype project. Creates project scaffolding, configuration file (prototype.yaml), and optionally authenticates with GitHub. This is the first step in the pipeline.',
  {
    name: z.string().describe('Name of the prototype project'),
    location: z.string().describe('Azure region for resource deployment (e.g. eastus, westus2, westeurope)'),
    iacTool: z
      .enum(['terraform', 'bicep'])
      .optional()
      .describe('Infrastructure-as-code tool preference (default: terraform)'),
    aiProvider: z
      .enum(['copilot', 'github-models', 'azure-openai'])
      .optional()
      .describe('AI provider for agent interactions (default: copilot). azure-openai skips GitHub auth.'),
    environment: z
      .enum(['dev', 'staging', 'prod'])
      .optional()
      .describe('Target environment (default: dev)'),
    model: z
      .string()
      .optional()
      .describe('AI model to use (default: claude-sonnet-4.5 for copilot, gpt-4o for others)'),
    template: z
      .enum(['web-app', 'data-pipeline', 'ai-app', 'microservices', 'serverless-api'])
      .optional()
      .describe('Project template to use for pre-configured service topology'),
    outputDir: z
      .string()
      .optional()
      .describe('Output directory for project files (default: current directory)'),
  },
  async ({ name, location, iacTool, aiProvider, environment, model, template, outputDir }) => {
    const args = ['init', '--name', name, '--location', location];
    if (iacTool) args.push('--iac-tool', iacTool);
    if (aiProvider) args.push('--ai-provider', aiProvider);
    if (environment) args.push('--environment', environment);
    if (model) args.push('--model', model);
    if (template) args.push('--template', template);
    if (outputDir) args.push('--output-dir', outputDir);

    const result = await runPrototype(args, outputDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
              project: { name, location, iacTool: iacTool ?? 'terraform', environment: environment ?? 'dev' },
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 3: prototype_design ───────────────────────────────────────────

server.tool(
  'prototype_design',
  'Run the design phase of az prototype. Analyzes requirements and generates architecture design. Can provide context as free text and/or point to an artifacts directory containing requirement documents (PDF, DOCX, PPTX, images). Use --skip-discovery to generate architecture from existing discovery state.',
  {
    context: z
      .string()
      .optional()
      .describe('Additional context or requirements as free text (e.g. "Build a web app with Redis caching and Entra ID auth")'),
    artifactsDir: z
      .string()
      .optional()
      .describe('Path to directory containing requirement documents, diagrams, or other artifacts'),
    skipDiscovery: z
      .boolean()
      .optional()
      .describe('Skip discovery conversation and generate architecture from existing state (default: false)'),
    reset: z
      .boolean()
      .optional()
      .describe('Reset design state and start fresh (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ context, artifactsDir, skipDiscovery, reset, projectDir }) => {
    const args = ['design'];
    if (context) args.push('--context', context);
    if (artifactsDir) args.push('--artifacts', artifactsDir);
    if (skipDiscovery) args.push('--skip-discovery');
    if (reset) args.push('--reset');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 4: prototype_build ────────────────────────────────────────────

server.tool(
  'prototype_build',
  'Generate infrastructure and application code from the architecture design. Produces Terraform/Bicep modules, application code, database scripts, and documentation organized into dependency-ordered deployment stages. Use --auto-accept to skip interactive policy resolution (for CI/CD).',
  {
    scope: z
      .enum(['all', 'infra', 'apps', 'db', 'docs'])
      .optional()
      .describe('What to build (default: all)'),
    dryRun: z
      .boolean()
      .optional()
      .describe('Preview what would be generated without writing files (default: false)'),
    autoAccept: z
      .boolean()
      .optional()
      .describe('Auto-accept all governance recommendations without prompting (default: false). Use for CI/CD.'),
    reset: z
      .boolean()
      .optional()
      .describe('Clear existing build state and start fresh (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ scope, dryRun, autoAccept, reset, projectDir }) => {
    const args = ['build'];
    if (scope) args.push('--scope', scope);
    if (dryRun) args.push('--dry-run');
    if (autoAccept) args.push('--auto-accept');
    if (reset) args.push('--reset');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 5: prototype_deploy_preview ───────────────────────────────────

server.tool(
  'prototype_deploy_preview',
  'Preview deployment without executing. Runs terraform plan / Bicep what-if for all stages or a specific stage. Shows what resources would be created, modified, or deleted.',
  {
    stage: z
      .number()
      .optional()
      .describe('Specific stage number to preview (omit for all stages)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ stage, projectDir }) => {
    const args = ['deploy', '--dry-run'];
    if (stage !== undefined) args.push('--stage', String(stage));

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
              stage: stage ?? 'all',
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 6: prototype_deploy_stage ─────────────────────────────────────

server.tool(
  'prototype_deploy_stage',
  'Deploy a specific stage to Azure (non-interactive). Runs preflight checks, then executes the deployment for the given stage number. Use prototype_deploy_preview first to see the plan.',
  {
    stage: z.number().describe('Stage number to deploy'),
    subscription: z
      .string()
      .optional()
      .describe('Azure subscription ID to deploy to'),
    force: z
      .boolean()
      .optional()
      .describe('Force full deployment, ignoring change tracking (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ stage, subscription, force, projectDir }) => {
    const args = ['deploy', '--stage', String(stage)];
    if (subscription) args.push('--subscription', subscription);
    if (force) args.push('--force');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
              stage,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 7: prototype_status ───────────────────────────────────────────

server.tool(
  'prototype_status',
  'Show current project status across all stages (design, build, deploy). Returns structured JSON with stage progress, file changes, and deployment history.',
  {
    detailed: z
      .boolean()
      .optional()
      .describe('Show expanded per-stage details (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ detailed, projectDir }) => {
    const args = ['status', '--json'];
    if (detailed) args.push('--detailed');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: result.json
            ? JSON.stringify(result.json, null, 2)
            : JSON.stringify({ success: result.success, output: result.stdout || result.stderr }, null, 2),
        },
      ],
    };
  },
);

// ── Tool 8: prototype_analyze_costs ────────────────────────────────────

server.tool(
  'prototype_analyze_costs',
  'Estimate Azure costs at Small/Medium/Large t-shirt sizes using the Azure Retail Prices API. Analyzes the current architecture design and produces a cost report. Results are cached unless the design changes.',
  {
    outputFormat: z
      .enum(['json', 'markdown', 'table'])
      .optional()
      .describe('Output format for the cost report (default: json)'),
    refresh: z
      .boolean()
      .optional()
      .describe('Force fresh analysis, bypassing cached results (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ outputFormat, refresh, projectDir }) => {
    const args = ['analyze', 'costs', '--output-format', outputFormat ?? 'json'];
    if (refresh) args.push('--refresh');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: result.json
            ? JSON.stringify(result.json, null, 2)
            : JSON.stringify({ success: result.success, output: result.stdout || result.stderr }, null, 2),
        },
      ],
    };
  },
);

// ── Tool 9: prototype_analyze_error ────────────────────────────────────

server.tool(
  'prototype_analyze_error',
  'Analyze an error and get a root cause diagnosis with fix instructions and redeployment commands. Accepts an inline error string, path to a log file, or path to a screenshot image (PNG/JPG/GIF — uses vision AI).',
  {
    input: z
      .string()
      .describe('Error input: inline error string, path to a log file, or path to a screenshot image'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ input, projectDir }) => {
    const args = ['analyze', 'error', '--input', input];

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 10: prototype_generate_docs ───────────────────────────────────

server.tool(
  'prototype_generate_docs',
  'Generate documentation from templates. Produces Architecture, Deployment, Development, Configuration, As-Built, and Cost Estimate documents populated with project configuration.',
  {
    path: z
      .string()
      .optional()
      .describe('Output directory for generated documents (default: ./docs/)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ path, projectDir }) => {
    const args = ['generate', 'docs'];
    if (path) args.push('--path', path);

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 11: prototype_generate_speckit ────────────────────────────────

server.tool(
  'prototype_generate_speckit',
  'Generate the spec-kit documentation bundle. Creates a self-contained package of documentation templates with a manifest.json for all project deliverables.',
  {
    path: z
      .string()
      .optional()
      .describe('Output directory for the spec-kit bundle (default: ./concept/.specify/)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ path, projectDir }) => {
    const args = ['generate', 'speckit'];
    if (path) args.push('--path', path);

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 12: prototype_generate_backlog ────────────────────────────────

server.tool(
  'prototype_generate_backlog',
  'Generate a structured backlog from the architecture design and push work items to GitHub Issues or Azure DevOps. Uses --quick mode for non-interactive generate-confirm-push workflow.',
  {
    provider: z
      .enum(['github', 'devops'])
      .optional()
      .describe('Backlog provider: github for GitHub Issues, devops for Azure DevOps work items'),
    org: z
      .string()
      .optional()
      .describe('Organization or owner name (GitHub org/user or Azure DevOps org)'),
    project: z
      .string()
      .optional()
      .describe('Project name (Azure DevOps project or GitHub repo)'),
    quick: z
      .boolean()
      .optional()
      .describe('Skip interactive session — generate, confirm, and push (default: false)'),
    refresh: z
      .boolean()
      .optional()
      .describe('Force fresh AI generation, bypassing cached items (default: false)'),
    outputFormat: z
      .enum(['json', 'markdown', 'table'])
      .optional()
      .describe('Output format (default: markdown)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ provider, org, project, quick, refresh, outputFormat, projectDir }) => {
    const args = ['generate', 'backlog'];
    if (provider) args.push('--provider', provider);
    if (org) args.push('--org', org);
    if (project) args.push('--project', project);
    if (quick) args.push('--quick');
    if (refresh) args.push('--refresh');
    if (outputFormat) args.push('--output-format', outputFormat);

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 13: prototype_config_show ─────────────────────────────────────

server.tool(
  'prototype_config_show',
  'Display current project configuration from prototype.yaml. Secret values (API keys, subscription IDs) are masked.',
  {
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ projectDir }) => {
    const result = await runPrototype(['config', 'show'], projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 14: prototype_config_set ──────────────────────────────────────

server.tool(
  'prototype_config_set',
  'Set a configuration value in prototype.yaml. Uses dot-separated key paths (e.g. ai.provider, naming.strategy, project.location).',
  {
    key: z.string().describe('Configuration key (dot-separated path, e.g. ai.provider, naming.strategy)'),
    value: z.string().describe('Configuration value to set'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ key, value, projectDir }) => {
    const result = await runPrototype(['config', 'set', '--key', key, '--value', value], projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              output: result.stdout || result.stderr,
              key,
              value,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Tool 15: prototype_agent_list ──────────────────────────────────────

server.tool(
  'prototype_agent_list',
  'List all available agents (built-in and custom). Shows agent names, descriptions, capabilities, and source. 11 built-in agents cover architecture, IaC, app code, security, QA, cost, docs, and project management.',
  {
    detailed: z
      .boolean()
      .optional()
      .describe('Show expanded capability details for each agent (default: false)'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ detailed, projectDir }) => {
    const args = ['agent', 'list', '--json'];
    if (detailed) args.push('--detailed');

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: result.json
            ? JSON.stringify(result.json, null, 2)
            : JSON.stringify({ success: result.success, output: result.stdout || result.stderr }, null, 2),
        },
      ],
    };
  },
);

// ── Tool 16: prototype_agent_test ──────────────────────────────────────

server.tool(
  'prototype_agent_test',
  'Send a test prompt to any agent and display the response. Useful for validating agent behavior after creation or configuration changes. Requires a configured AI provider.',
  {
    agentName: z.string().describe('Name of the agent to test (e.g. cloud-architect, qa-engineer, biz-analyst)'),
    prompt: z
      .string()
      .optional()
      .describe('Test prompt to send (default: "Briefly introduce yourself and describe your capabilities")'),
    projectDir: z
      .string()
      .optional()
      .describe('Project directory containing prototype.yaml (default: current directory)'),
  },
  async ({ agentName, prompt, projectDir }) => {
    const args = ['agent', 'test', '--name', agentName];
    if (prompt) args.push('--prompt', prompt);

    const result = await runPrototype(args, projectDir);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              success: result.success,
              agent: agentName,
              output: result.stdout || result.stderr,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Start server ───────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is running — stdio transport handles the lifecycle
}

main().catch((err) => {
  console.error('az-prototype MCP server fatal error:', err);
  process.exit(1);
});
