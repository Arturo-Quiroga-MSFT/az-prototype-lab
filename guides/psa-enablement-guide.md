---
title: "az prototype: PSA Enablement Guide"
description: "Practical guide for Partner Solution Architects to adopt az prototype across partner engagements, from basic demos to advanced production workflows"
author: Arturo Quiroga
ms.date: 2026-03-19
ms.topic: tutorial
keywords:
  - az prototype
  - PSA
  - partner solution architect
  - Azure CLI
  - rapid prototyping
  - GitHub Copilot
estimated_reading_time: 20
---

## What Is az prototype?

`az prototype` is an Azure CLI extension that turns ideas into deployed Azure prototypes through four commands: `init`, `design`, `build`, and `deploy`. It uses AI-driven agent teams (powered by GitHub Copilot, GitHub Models, or Azure OpenAI) to handle architecture design, infrastructure-as-code generation, application scaffolding, security review, cost estimation, and deployment, all in a single, re-entrant pipeline.

Think of it as an enterprise-grade, Azure-native alternative to tools like Claude Code, Cursor, and Replit. Instead of building throwaway prototypes on third-party platforms, partners design, build, and deploy directly on Azure with infrastructure-as-code, governance policies, and production readiness baked in.

Under the hood, 11 specialized agents collaborate across the pipeline:

| Agent | Role |
|---|---|
| cloud-architect | Architecture design and Azure service selection |
| biz-analyst | Requirements gap analysis and interactive discovery |
| terraform-agent | Terraform IaC generation |
| bicep-agent | Bicep template generation |
| app-developer | Application code generation (APIs, Functions, containers) |
| security-reviewer | Pre-deployment IaC security scanning |
| monitoring-agent | Observability and alert configuration |
| qa-engineer | Error diagnosis from logs, strings, or screenshots |
| cost-analyst | Azure cost estimation at S/M/L t-shirt sizes |
| doc-agent | Project and deployment documentation |
| project-manager | Backlog generation, scope management, escalation |

The tool also ships with 58 governance policy rules, 33 anti-pattern checks, 5 workload templates, and 25 Azure service knowledge files. Every stage enforces compliance with the Azure Well-Architected Framework automatically.

> [!NOTE]
> `az prototype` is currently in public preview, built and maintained by [Joshua Davis](https://github.com/a11smiles/) at Microsoft. It originates from the Innovation Factory, an internal program that delivers rapid prototypes for Microsoft enterprise customers.

## Why This Matters for PSAs

Partners prototype with competing tools like Claude Code, Cursor, and Replit, then hand off to IT teams who spend months re-architecting for Azure. That handoff is where deals stall and competitors gain footholds. `az prototype` eliminates that gap by generating Azure-native, governance-compliant prototypes directly from requirements.

Every prototype you run with a partner:

* Requires a GitHub Copilot Business or Enterprise license (seat growth)
* Deploys real Azure resources (ACR generation)
* Displaces third-party AI coding tools (competitive positioning)
* Produces enterprise-grade IaC, documentation, and backlog artifacts (production readiness)

## Prerequisites

Before any engagement, verify these are in place:

| Requirement | Details |
|---|---|
| Azure CLI 2.50+ | `az --version` to confirm |
| Azure subscription | With appropriate deployment permissions |
| GitHub CLI (`gh`) | Installed and authenticated (`gh auth status`) |
| GitHub Copilot license | Business or Enterprise (required for the `copilot` AI provider) |
| Terraform or Bicep | Whichever IaC tool you plan to use |

Install the extension:

```bash
az extension add --name prototype
```

> [!NOTE]
> `az prototype` is currently in public preview. Stable release is targeted for end of March 2026. Log bugs at [GitHub Issues](https://github.com/Azure/az-prototype/issues).

## The Core Workflow

Every engagement follows the same four-command pipeline:

```text
init  -->  design  -->  build  -->  deploy
```

Each stage is re-entrant. You can return to `design` after deployment to refine architecture, or re-run `build` to regenerate specific components. This makes the tool safe for iterative sessions with partners.

---

## Basic Use Cases

Start here. These scenarios require minimal preparation and deliver immediate value in partner conversations.

### Use Case 1: Live Demo in a Technology Briefing

**When:** You're presenting Azure capabilities and want to show the art of the possible.

**Goal:** In under 15 minutes, go from a verbal description to a deployed architecture with IaC, governance policies, and cost estimates.

**Steps:**

```bash
# 1. Initialize the project
az prototype init --name partner-demo --location eastus

# 2. Run interactive design (the biz-analyst agent will ask clarifying questions)
az prototype design

# 3. Generate all code
az prototype build

# 4. Preview costs without deploying
az prototype analyze costs
```

**What to highlight for the partner:**

* The AI-driven discovery conversation catches missing requirements and unstated assumptions
* Governance policies are enforced automatically (RBAC, encryption, no public endpoints)
* Cost estimates appear at S/M/L t-shirt sizes using live Azure Retail Prices
* All generated code follows Azure Well-Architected Framework patterns

> [!TIP]
> Use `--dry-run` on the build step (`az prototype build --dry-run`) to preview what would be generated without writing files. This is useful when time is tight.

### Use Case 2: Architecture Design Session (ADS)

**When:** You're running a structured ADS with a partner's technical team.

**Goal:** Feed existing requirements artifacts directly into `az prototype` and produce architecture documentation that can be reviewed in real-time.

**Preparation:** Ask the partner to bring their requirements (Word docs, PDFs, PowerPoints, diagrams, screenshots). The tool ingests binary artifacts.

**Steps:**

```bash
# 1. Initialize with the partner's preferred IaC tool
az prototype init --name partner-ads --location westus2 --iac-tool bicep

# 2. Feed artifacts directly into the design phase
az prototype design --artifacts ./partner-requirements/

# 3. Use interactive mode to refine architecture with the partner in the room
az prototype design --interactive

# 4. Check discovery status at any point
az prototype design --status
```

**What to highlight for the partner:**

* Binary artifact ingestion (PDFs, DOCX, PPTX, XLSX, images, screenshots)
* Explicit scope tracking: in-scope, out-of-scope, and deferred items carry through every stage
* The biz-analyst agent surfaces gaps even when artifacts are provided
* Architecture is re-entrant. Refine it across multiple sessions without starting over

> [!IMPORTANT]
> The `--interactive` flag enters a refinement loop after architecture generation. Use this when the partner's team is present and can provide real-time feedback.

### Use Case 3: Quick PoC Kickstart with Templates

**When:** A partner needs a rapid proof of concept for a well-known pattern.

**Goal:** Use a built-in workload template to skip the discovery phase and jump straight to code generation.

Five templates are available:

| Template | Services | When to Use |
|---|---|---|
| `web-app` | Container Apps, SQL, Key Vault, APIM | Standard web application with backend |
| `data-pipeline` | Functions, Cosmos DB, Storage, Event Grid | Event-driven data processing |
| `ai-app` | Container Apps, OpenAI, Cosmos DB, APIM | AI-powered application with conversation history |
| `microservices` | Container Apps (x3), Service Bus, APIM | Multi-service async architecture |
| `serverless-api` | Functions, SQL, Key Vault, APIM | Serverless REST API with auto-pause SQL |

**Steps:**

```bash
# 1. Initialize with a template
az prototype init --name partner-poc --location eastus --template web-app

# 2. Design still runs (adds governance and custom requirements)
az prototype design --context "Add Redis caching layer and integrate with partner's existing Entra ID tenant"

# 3. Build everything
az prototype build

# 4. Deploy to Azure
az prototype deploy
```

> [!TIP]
> Templates are starting points, not constraints. The design phase still runs the full agent team, so governance policies, naming conventions, and anti-pattern checks all apply.

### Use Case 4: Post-Deployment Error Diagnosis

**When:** A deployment fails during a live session (or the partner reports an issue afterward).

**Goal:** Demonstrate the QA-first error routing capability instead of manually debugging.

**Steps:**

```bash
# Analyze an inline error message
az prototype analyze error --input "ResourceNotFound - The Resource was not found"

# Analyze a log file
az prototype analyze error --input ./deploy.log

# Analyze a screenshot of the error
az prototype analyze error --input ./error-screenshot.png
```

The QA engineer agent identifies root cause, proposes a fix, and provides the exact commands to redeploy. Screenshot analysis uses vision/multi-modal AI to read image content.

---

## Intermediate Use Cases

These scenarios require more preparation but deliver deeper value for partners who are evaluating Azure for production workloads.

### Use Case 5: Full End-to-End with Staged Deployment

**When:** Running a hands-on session where the partner wants to see real resources deployed.

**Goal:** Walk through the complete pipeline including interactive deployment with preflight checks and stage-by-stage control.

**Steps:**

```bash
# 1. Initialize
az prototype init --name e2e-demo --location eastus --iac-tool terraform

# 2. Interactive design
az prototype design

# 3. Build with policy enforcement visible
az prototype build

# 4. Preview deployment plan without executing
az prototype deploy --dry-run

# 5. Deploy interactively (preflight checks, stage tracking, slash commands)
az prototype deploy
```

**During the deploy session, use slash commands to demonstrate control:**

| Command | What It Does |
|---|---|
| `/status` | Show deployment status for all stages |
| `/plan N` | Show what-if/terraform plan for stage N |
| `/deploy N` | Deploy a specific stage |
| `/rollback N` | Roll back a deployed stage (reverse order enforced) |
| `/outputs` | Display captured deployment outputs |

> [!NOTE]
> The deploy stage is 100% subprocess-based (terraform/bicep/az CLI). It works even without an AI provider configured. QA error diagnosis degrades gracefully when no AI is available.

### Use Case 6: Generate Partner-Ready Documentation

**When:** The partner needs deliverables beyond code, such as architecture references, deployment guides, and cost estimates.

**Goal:** Produce a complete documentation bundle that the partner can share with their stakeholders.

**Steps:**

```bash
# Generate the full spec-kit bundle (Architecture, Deployment, Development, Configuration, As-Built, Cost)
az prototype generate speckit

# Or generate individual documents
az prototype generate docs

# Generate a structured backlog and push to GitHub Issues
az prototype generate backlog --provider github --org partner-org --project partner-repo

# Or push to Azure DevOps
az prototype generate backlog --provider devops --org partner-org --project partner-project
```

The documentation set includes:

* ARCHITECTURE.md: High-level and detailed architecture diagrams
* DEPLOYMENT.md: Step-by-step deployment guide
* DEVELOPMENT.md: Developer setup and local dev guide
* CONFIGURATION.md: Azure service configuration reference
* AS_BUILT.md: As-built record of delivered solution
* COST_ESTIMATE.md: Cost estimates at t-shirt sizes
* BACKLOG.md: User stories with acceptance criteria and effort estimates

### Use Case 7: Naming Strategy and Governance Customization

**When:** The partner has existing Azure Landing Zone conventions or enterprise naming standards.

**Goal:** Show that `az prototype` conforms to their governance requirements, not the other way around.

**Steps:**

```bash
# Interactive configuration wizard
az prototype config init

# Or set naming strategy directly
az prototype config set --key naming.strategy --value microsoft-caf
az prototype config set --key naming.org --value contoso

# Switch to production landing zone
az prototype config set --key naming.zone_id --value zp
```

Available naming strategies:

| Strategy | Pattern | Example |
|---|---|---|
| `microsoft-alz` (default) | `{zoneid}-{type}-{service}-{env}-{region}` | `zd-rg-api-dev-eus` |
| `microsoft-caf` | `{type}-{org}-{service}-{env}-{region}-{instance}` | `rg-contoso-api-dev-eus-001` |
| `simple` | `{org}-{service}-{type}-{env}` | `contoso-api-rg-dev` |
| `enterprise` | `{type}-{bu}-{org}-{service}-{env}-{region}-{instance}` | `rg-it-contoso-api-dev-eus-001` |
| `custom` | User-defined pattern | Depends on pattern |

---

## Advanced Use Cases

These scenarios target partners with mature Azure practices who need customization, CI/CD integration, or deep governance control.

### Use Case 8: Custom Agent for Partner-Specific Domains

**When:** The partner operates in a regulated industry (healthcare, finance) or has domain-specific requirements that the built-in agents don't cover.

**Goal:** Create a custom agent that encodes domain expertise and integrates into the standard pipeline.

**Steps:**

```bash
# Interactive agent creation (guided walkthrough)
az prototype agent add --name compliance-reviewer

# Or start from an existing built-in as a baseline
az prototype agent add --name healthcare-architect --definition cloud_architect

# Export a built-in agent to customize offline
az prototype agent export --name cloud-architect --output-file ./agents/base-architect.yaml

# Test the custom agent
az prototype agent test --name compliance-reviewer --prompt "Design a HIPAA-compliant data pipeline"

# List all agents (built-in and custom)
az prototype agent list --detailed
```

Custom agent YAML format:

```yaml
name: compliance-reviewer
description: Reviews architecture for healthcare compliance requirements
role: architect
system_prompt: |
  You are a specialized architect for healthcare workloads.
  Enforce HIPAA compliance, PHI data handling, and BAA requirements.
constraints:
  - Must use managed identity
  - Must encrypt all data at rest and in transit
  - Must isolate PHI data in dedicated storage accounts
tools:
  - terraform
  - bicep
```

Agent resolution order: custom > override > built-in. Custom agents take precedence.

### Use Case 9: CI/CD Pipeline Integration

**When:** The partner wants to automate prototype generation in their DevOps workflow.

**Goal:** Demonstrate non-interactive, scriptable usage suitable for pipelines.

```bash
# Non-interactive build with auto-accept for governance defaults
az prototype build --auto-accept

# Deploy a specific stage non-interactively
az prototype deploy --stage 1

# Deploy with service principal authentication
az prototype deploy \
  --service-principal \
  --client-id $ARM_CLIENT_ID \
  --client-secret $ARM_CLIENT_SECRET \
  --tenant-id $ARM_TENANT_ID

# Get machine-readable status for pipeline checks
az prototype status --json
```

> [!WARNING]
> The `--auto-accept` flag automatically accepts all governance recommendations. Use this only in pipelines where governance defaults are trusted, not during interactive partner sessions where you want to demonstrate policy enforcement.

### Use Case 10: Azure OpenAI Provider (No GitHub Copilot Required)

**When:** The partner does not have GitHub Copilot licenses but has Azure OpenAI deployed in their tenant.

**Goal:** Show that `az prototype` works with Azure OpenAI, keeping all IP within the partner's tenant.

```bash
# Initialize with Azure OpenAI (skips GitHub auth entirely)
az prototype init --name partner-app --location eastus --ai-provider azure-openai --model gpt-4o

# Configure Azure OpenAI endpoint
az prototype config set --key ai.provider --value azure-openai
```

This is a strong positioning point: the partner's data and prompts never leave their Azure tenant.

### Use Case 11: MCP Server Integration for Extended Capabilities

**When:** The partner needs agents to interact with external systems (internal APIs, custom tooling, data sources).

**Goal:** Demonstrate the Model Context Protocol plugin system for extending agent capabilities.

`az prototype` supports MCP handlers that own their transport, authentication, and protocol. Handlers can be scoped to specific build phases or agent roles. Custom handlers are loaded from `.prototype/mcp/` Python files at runtime.

Key features:

* JSON-RPC over HTTP, stdio, or custom transport
* Circuit breaker with automatic disable after consecutive failures
* AI-driven and code-driven tool calling
* Lazy connection management with configurable timeouts

### Use Case 12: Knowledge Contribution After Engagements

**When:** You discover a pattern, pitfall, or gap during a partner engagement.

**Goal:** Contribute findings back to the shared knowledge base so future sessions (yours and others') benefit.

```bash
# Interactive contribution
az prototype knowledge contribute

# Quick non-interactive contribution
az prototype knowledge contribute \
  --service cosmos-db \
  --description "RU throughput must be >= 400 for production workloads"

# Preview before submitting
az prototype knowledge contribute \
  --service redis \
  --description "Cache eviction pitfall with volatile-lru policy" \
  --draft
```

> [!TIP]
> Make knowledge contributions a habit after every engagement. The knowledge system currently includes 25 Azure service knowledge files, and community contributions strengthen the tool for everyone.

---

## Engagement Playbook: Quick Reference

| Engagement Type | Use Cases | Time Needed | Key Commands |
|---|---|---|---|
| Technology Briefing | 1, 4 | 15-30 min | `init`, `design`, `analyze costs` |
| Architecture Design Session | 2, 6, 7 | 2-4 hours | `init`, `design --artifacts`, `design --interactive`, `generate speckit` |
| PoC / Hands-on-Keyboard | 3, 5, 6 | Half day | `init --template`, `build`, `deploy`, `generate backlog` |
| Advanced / Custom Workshop | 8, 9, 10, 11 | Full day | `agent add`, `deploy --service-principal`, custom MCP |
| Post-Engagement Follow-up | 12 | 10 min | `knowledge contribute` |

## Competitive Positioning

When partners mention these tools, here is how to position `az prototype`:

| Competing Tool | Positioning |
|---|---|
| Claude Code | `az prototype` produces governance-compliant IaC with Azure-native deployment. Claude Code generates code but has no infrastructure governance, cost analysis, or deployment pipeline. |
| Cursor | Cursor is a general-purpose AI editor. `az prototype` is purpose-built for Azure with 11 specialized agents, policy enforcement, and staged deployments. |
| Replit | Replit prototypes run on Replit infrastructure. `az prototype` deploys directly to the partner's Azure subscription with full IaC and RBAC. |
| Base44 | Similar positioning to Replit. Third-party platform vs. Azure-native with enterprise governance. |

## Resources

| Resource | Link |
|---|---|
| GitHub Repo | <https://github.com/Azure/az-prototype> |
| Feature Reference | <https://github.com/Azure/az-prototype/blob/main/FEATURES.md> |
| Command Reference | <https://github.com/Azure/az-prototype/blob/main/COMMANDS.md> |
| Wiki | <https://github.com/Azure/az-prototype/wiki> |
| Issues / Bugs | <https://github.com/Azure/az-prototype/issues> |
| Internal Chat | Contact joshuadavis@microsoft.com to join |
