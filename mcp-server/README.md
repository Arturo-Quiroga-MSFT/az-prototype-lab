---
title: "az prototype MCP Server"
description: "MCP server wrapping az prototype CLI commands as tools for Claude Desktop, GitHub Copilot, and other MCP clients"
author: Arturo Quiroga
ms.date: 2026-03-19
ms.topic: reference
---

## Overview

This MCP server exposes the `az prototype` Azure CLI extension as 16 tools that any MCP-compatible client can invoke. It follows the same architecture pattern as the [Azure Architecture Diagram Builder MCP server](https://github.com/Arturo-Quiroga-MSFT/azure-architecture-diagram-builder/tree/main/mcp-server).

```text
MCP Client (Claude Desktop, GitHub Copilot, etc.)
        │
        │  stdio (JSON-RPC)
        ▼
  az-prototype-mcp server
        │
        │  child_process (az CLI)
        ▼
  az prototype extension (11 AI agents)
```

## Tools

| # | Tool | Description |
|---|---|---|
| 1 | `prototype_check_prerequisites` | Verify az CLI and prototype extension are installed |
| 2 | `prototype_init` | Initialize a new prototype project |
| 3 | `prototype_design` | Run design phase with context or artifacts |
| 4 | `prototype_build` | Generate IaC and application code |
| 5 | `prototype_deploy_preview` | Dry-run / what-if preview |
| 6 | `prototype_deploy_stage` | Deploy a specific stage to Azure |
| 7 | `prototype_status` | Show project status (JSON) |
| 8 | `prototype_analyze_costs` | Estimate costs at S/M/L t-shirt sizes |
| 9 | `prototype_analyze_error` | Diagnose errors (text, logs, screenshots) |
| 10 | `prototype_generate_docs` | Generate documentation |
| 11 | `prototype_generate_speckit` | Generate spec-kit bundle |
| 12 | `prototype_generate_backlog` | Generate and push backlog items |
| 13 | `prototype_config_show` | Show project configuration |
| 14 | `prototype_config_set` | Set a configuration value |
| 15 | `prototype_agent_list` | List all agents (built-in and custom) |
| 16 | `prototype_agent_test` | Test an agent with a prompt |

## Prerequisites

* Azure CLI 2.50+ (`az --version`)
* az prototype extension (`az extension add --name prototype`)
* Node.js 20+ (LTS)
* GitHub Copilot license (Business or Enterprise) for the `copilot` AI provider

## Setup

```bash
cd mcp-server
npm install
npm run build
```

## Usage

### Start the server directly

```bash
npm start
# or
node dist/index.js
```

### Configure in Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "az-prototype": {
      "command": "node",
      "args": ["/absolute/path/to/az-prototype-lab/mcp-server/dist/index.js"]
    }
  }
}
```

### Configure in VS Code (GitHub Copilot)

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "az-prototype": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-server/dist/index.js"]
    }
  }
}
```

## Development

```bash
# Watch mode (recompiles on save)
npm run dev

# In another terminal, test with the MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Using Both MCP Servers Together

For the full visual prototype experience, configure both this server and the [Azure Diagram Builder MCP server](https://github.com/Arturo-Quiroga-MSFT/azure-architecture-diagram-builder/tree/main/mcp-server) in your MCP client:

```json
{
  "mcpServers": {
    "az-prototype": {
      "command": "node",
      "args": ["/path/to/az-prototype-lab/mcp-server/dist/index.js"]
    },
    "azure-diagram-builder": {
      "command": "node",
      "args": ["/path/to/azure-architecture-diagram-builder/mcp-server/dist/index.js"]
    }
  }
}
```

This enables workflows like:

1. Use `prototype_init` + `prototype_design` to generate architecture
2. Use `render_diagram` from the diagram builder to visualize it
3. Use `validate_architecture` from the diagram builder for WAF checks
4. Use `prototype_build` + `prototype_deploy_stage` to deploy
5. Use `prototype_analyze_costs` for cost estimates and `estimate_costs` from the diagram builder for live pricing comparison
