# az-prototype experimentation workspace

Workspace for experimenting with and testing the `az prototype` Azure CLI extension.

## Setup

```bash
# Create and activate the virtual environment
uv venv
source .venv/bin/activate

# Install the az prototype extension (requires Azure CLI)
az extension add --name prototype
```

## Workflow

```bash
az prototype init      # Initialize a new prototype project
az prototype design    # Analyze requirements and generate architecture
az prototype build     # Generate infrastructure and application code
az prototype deploy    # Deploy prototype to Azure
```

## Resources

- [GitHub Repo](https://github.com/Azure/az-prototype)
- [Feature Reference](https://github.com/Azure/az-prototype/blob/main/FEATURES.md)
- [Command Reference](https://github.com/Azure/az-prototype/blob/main/COMMANDS.md)
- [Wiki](https://github.com/Azure/az-prototype/wiki)
