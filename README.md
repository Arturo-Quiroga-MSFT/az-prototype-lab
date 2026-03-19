# az-prototype experimentation workspace

A hands-on lab for exploring, testing, and demonstrating [`az prototype`](https://github.com/Azure/az-prototype), the Azure CLI extension that turns ideas into deployed Azure prototypes using AI-driven agent teams.

> Built for Partner Solution Architects (PSAs) who want to accelerate partner engagements with rapid Azure prototyping powered by GitHub Copilot.

## How az prototype Works

The tool condenses the Innovation Factory's 12-stage methodology into four re-entrant commands. Each stage can be revisited to refine architecture or regenerate code without starting over.

```mermaid
flowchart LR
    A["<b>init</b><br/>Project scaffolding<br/>Config & auth"] --> B["<b>design</b><br/>AI discovery<br/>Architecture generation"]
    B --> C["<b>build</b><br/>IaC & app code<br/>Policy enforcement"]
    C --> D["<b>deploy</b><br/>Preflight checks<br/>Staged deployment"]
    D -.->|"refine"| B
    C -.->|"regenerate"| C

    style A fill:#0078D4,color:#fff,stroke:#005A9E
    style B fill:#50E6FF,color:#000,stroke:#0078D4
    style C fill:#00B294,color:#fff,stroke:#008272
    style D fill:#FFB900,color:#000,stroke:#E6A700
```

## Multi-Agent Architecture

Eleven specialized agents collaborate across the pipeline, each handling a distinct aspect of prototype generation.

```mermaid
graph TB
    subgraph Discovery["Discovery & Design"]
        BA["🔍 biz-analyst<br/>Requirements gap analysis"]
        CA["🏗️ cloud-architect<br/>Architecture & service selection"]
    end

    subgraph Generation["Code Generation"]
        TF["⚙️ terraform-agent<br/>Terraform IaC"]
        BP["⚙️ bicep-agent<br/>Bicep templates"]
        AD["💻 app-developer<br/>Application code"]
    end

    subgraph Quality["Quality & Security"]
        SR["🔒 security-reviewer<br/>IaC security scanning"]
        QA["🧪 qa-engineer<br/>Error diagnosis & vision"]
        MA["📊 monitoring-agent<br/>Observability config"]
    end

    subgraph Delivery["Analysis & Delivery"]
        CO["💰 cost-analyst<br/>S/M/L cost estimates"]
        DA["📄 doc-agent<br/>Documentation"]
        PM["📋 project-manager<br/>Backlog & scope"]
    end

    BA --> CA
    CA --> TF & BP & AD
    TF & BP & AD --> SR & QA & MA
    SR & QA & MA --> CO & DA & PM

    style Discovery fill:#E8F4FD,stroke:#0078D4
    style Generation fill:#E8FDF4,stroke:#00B294
    style Quality fill:#FFF4E8,stroke:#FFB900
    style Delivery fill:#F4E8FD,stroke:#8764B8
```

## What Gets Generated

A single run through the pipeline produces a complete set of production-ready artifacts.

```mermaid
mindmap
  root((az prototype<br/>output))
    Infrastructure
      Terraform or Bicep modules
      Staged deployment scripts
      Cross-stage dependency wiring
      Naming convention enforcement
    Application
      API and Function code
      Container definitions
      Configuration externalization
      Managed identity integration
    Governance
      58 policy rules enforced
      33 anti-pattern checks
      RBAC and encryption validation
      Security scan results
    Documentation
      Architecture reference
      Deployment guide
      Developer guide
      Cost estimates at S/M/L
      Backlog with user stories
```

## Getting Started

### Prerequisites

| Requirement | Details |
|---|---|
| Azure CLI 2.50+ | `az --version` to confirm |
| Azure subscription | With deployment permissions |
| GitHub CLI (`gh`) | Installed and authenticated |
| GitHub Copilot license | Business or Enterprise |
| Terraform or Bicep | Your preferred IaC tool |

### Setup

```bash
# Clone this repo
git clone https://github.com/Arturo-Quiroga-MSFT/az-prototype-lab.git
cd az-prototype-lab

# Create and activate the virtual environment
uv venv
source .venv/bin/activate

# Install the az prototype extension
az extension add --name prototype
```

### Quick Start

```bash
# Initialize a new prototype project
az prototype init --name my-poc --location eastus

# Run interactive design (AI agents ask clarifying questions)
az prototype design

# Generate infrastructure and application code
az prototype build

# Deploy to Azure with preflight checks
az prototype deploy
```

## Guides

| Guide | Description |
|---|---|
| [PSA Enablement Guide](guides/psa-enablement-guide.md) | 12 use cases for Partner Solution Architects, from live demos to custom agent workshops. Covers technology briefings, Architecture Design Sessions, PoCs, CI/CD integration, and more. |

## Command Reference (Quick View)

```mermaid
graph LR
    subgraph Core["Core Pipeline"]
        init["az prototype init"]
        design["az prototype design"]
        build["az prototype build"]
        deploy["az prototype deploy"]
        status["az prototype status"]
    end

    subgraph Analysis["Analysis"]
        err["az prototype analyze error"]
        cost["az prototype analyze costs"]
    end

    subgraph Generate["Artifacts"]
        docs["az prototype generate docs"]
        spec["az prototype generate speckit"]
        blog["az prototype generate backlog"]
    end

    subgraph Agents["Agent Management"]
        alist["az prototype agent list"]
        aadd["az prototype agent add"]
        atest["az prototype agent test"]
        aexport["az prototype agent export"]
    end

    subgraph Config["Configuration"]
        cinit["az prototype config init"]
        cshow["az prototype config show"]
        cset["az prototype config set"]
    end

    style Core fill:#0078D4,color:#fff,stroke:#005A9E
    style Analysis fill:#FFB900,color:#000,stroke:#E6A700
    style Generate fill:#00B294,color:#fff,stroke:#008272
    style Agents fill:#8764B8,color:#fff,stroke:#6B4F9E
    style Config fill:#50E6FF,color:#000,stroke:#0078D4
```

## Resources

| Resource | Link |
|---|---|
| az prototype repo | [github.com/Azure/az-prototype](https://github.com/Azure/az-prototype) |
| Feature reference | [FEATURES.md](https://github.com/Azure/az-prototype/blob/main/FEATURES.md) |
| Command reference | [COMMANDS.md](https://github.com/Azure/az-prototype/blob/main/COMMANDS.md) |
| Wiki | [github.com/Azure/az-prototype/wiki](https://github.com/Azure/az-prototype/wiki) |
| Issues and bugs | [github.com/Azure/az-prototype/issues](https://github.com/Azure/az-prototype/issues) |
