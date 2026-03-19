Rapid Azure Prototyping with GitHub Copilot

Displace competing generative AI tools like Claude Code, Cursor, and others in enterprise accounts with GitHub Copilot while improving customer experience and driving ACR.

Quick Links
🖥️ GitHub Repo: https://github.com/Azure/az-prototype
✉️ Customer Invite Email Template (click to open, then click download): 'az prototype' - Customer Announcement.msg
🆘 Need Help (via Teams)? joshuadavis@microsoft.com 
🎉 Want to join the internal chat (ask questions, stay up to date on releases, etc.)? Ping Joshua and just ask to be added.

Overview
az prototype is an Azure CLI extension that empowers customers to rapidly build functional Azure prototypes using AI-driven agent teams — powered by their existing GitHub Copilot licenses.
Think of it as an enterprise-grade, Azure-native alternative to tools like Claude Code, Cursor, Replit, and Base44 — but instead of building throwaway prototypes on third-party platforms, customers design, build, and deploy directly on Azure with full infrastructure-as-code, governance policies, and production-readiness baked in.

Currently in public preview. Stable release targeted for end of March 2026.

Why This Matters for Your Accounts

We're seeing a pattern across accounts: business leaders prototype with competing products, hand it to IT, and IT spends months re-architecting for Azure. That handoff is where deals stall and competitors gain footholds. az prototype eliminates that gap.
During a recent demo, Armanino's Managing Director offered to co-develop the tool with Microsoft:


"I love all of that…I love that whole thing we’re talking about…That’s pretty phenomenal. OK, when do we get it?
This is totally cool…our goal is we want to solve clients’ problems by taking that SDLC process and crunching it down from 6-8 months into a handful of weeks…
Commercially, this is such a cool story. We’re super interested."



That's a customer volunteering to partner with us on a tool because they see it solving a real commercial problem.

What It Delivers

Empowers customers to rapidly build Azure-native prototypes with GitHub Copilot 
Drives GitHub Copilot adoption and usage 
Displaces Claude Code and Cursor within customer accounts 
Accelerates AI-based development and agentic workloads 
Improves security posture, compliance, and stability of cloud applications 

What It Solves

"This would cut our UAT requests significantly. Can we contribute?" — Microsoft CSU Corp 
Empowers customers to adopt generative AI development and build their own prototypes, enabling technical sellers to engage at deeper levels in customer conversations, thus improving the insight-to-value ratio 
Shortens long development and deployment cycles that create unnecessary friction and delay ACR 
Positions GitHub Copilot as the only AI coding tool with a Microsoft-native workflow that produces enterprise-grade artifacts for all stakeholders in the SDLC — developers, infrastructure, security, and cost 
Generates compliant workloads with governance policies based on the Azure Well-Architected Framework, Azure Architecture Center, and Azure Advisor, improving workload availability and customer security postures 

How to Position with Your Customers

GHCP Expansion — Every customer who adopts az prototype is a Copilot seat. Requires GitHub Copilot Business or Enterprise. 
Azure ACR — Every prototype deploys real Azure resources. Prototypes that go to production become recurring ACR. 
Competitive Displacement — Direct answer to Claude Code, Cursor, and Replit. Customers prototype natively on Azure instead of third-party platforms. 
HoK Synergy — Designed to complement and accelerate existing Hands-on-Keyboard engagements. 
What It Ships With

Capability	Details

Built-in AI Agents	10+ specialized agents — architect, Terraform, Bicep, app developer, QA, security reviewer, cost analyst, and more
IaC Support	Terraform and Bicep with standards enforcement, dependency management, and compliant module composition
Governance	Policies enforced pre-deployment — RBAC, public endpoints, encryption, secrets, and more
Anti-Pattern Detection	Multiple domains including security, networking, monitoring, cost, and completeness
Naming Conventions	ALZ, CAF, Simple, Enterprise, and Custom strategies built in
Documentation	Auto-generates architecture reference, developer guide, deployment guide, cost estimate, and SpecKit artifacts
Backlog Generation	Creates issues directly in GitHub Issues or Azure DevOps
AI Backends	GitHub Copilot, GitHub Models, Azure OpenAI — IP stays in customer tenant
Custom Extensibility	Custom agents via YAML, policy overrides, and MCP server support

A full feature list can be found at: https://github.com/Azure/az-prototype/blob/main/FEATURES.md
Get Started
Install directly from the Azure CLI:
az extension add --name prototype

Additional Resources

Resource	Link
Repo & Quick Start	https://github.com/Azure/az-prototype
Feature Reference	https://github.com/Azure/az-prototype/blob/main/FEATURES.md
Command Reference	https://github.com/Azure/az-prototype/blob/main/COMMANDS.md
Wiki	https://github.com/Azure/az-prototype/wiki

Questions & Pilots
For questions, customer pilots, demos, or contributions, reach out to Joshua Davis (joshuadavis@microsoft.com <joshuadavis@microsoft.com>) directly or log issues in the repo.
