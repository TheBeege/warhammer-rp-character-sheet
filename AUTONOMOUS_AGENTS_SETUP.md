# Autonomous Claude Agents Setup Guide

This document explains how to set up and deploy the autonomous Claude agent system that monitors Linear issues and implements features automatically.

## System Overview

The autonomous agent system operates as follows:

### Stepwise Sequence of Events

1. **Trigger**: GitHub Actions runs every 30 minutes via cron schedule
2. **Initialization**: Agent orchestrator loads configuration and environment variables
3. **Issue Discovery**: Fetches current "Todo" issues from Linear via GraphQL API
4. **Issue Processing**: For each unprocessed issue:
   - Creates a new git branch (`feature/[issue-id]-[title]`)
   - Selects appropriate Claude agent based on complexity
   - Posts progress comment to Linear issue
   - Calls Claude API with specialized prompt
   - Parses Claude's response and applies code changes
   - Commits changes with descriptive message
   - Posts completion comment to Linear issue
5. **Pull Request**: If changes were made, creates a PR for review
6. **State Tracking**: Records processed issues to avoid duplicates

### Agent Specialization

- **Planner**: Creates detailed implementation plans and task breakdowns
- **Senior Developer**: Handles complex implementations requiring architectural decisions
- **Developer**: Implements straightforward features following existing patterns  
- **Verifier**: Ensures implementations meet requirements and quality standards

## Local Setup

### Prerequisites

- Node.js 16+ 
- Git repository with Linear integration
- Anthropic API access (Claude Max plan or API credits)
- Linear API access

### Step 1: Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in `.env`:
   ```bash
   # Get from https://console.anthropic.com/
   CLAUDE_API_KEY=your_claude_api_key_here
   
   # Get from https://linear.app/settings/api  
   LINEAR_API_KEY=your_linear_api_key_here
   
   # Your GitHub personal access token (for local testing)
   GITHUB_TOKEN=your_github_token_here
   ```

### Step 2: Test Local Execution

```bash
# Test the agent system locally
npm run github:orchestrate

# Or test individual components
npm run agents:explain     # Learn about agent roles
npm run agents:workflow    # Create a workflow plan
```

## GitHub Actions Deployment

### Step 1: Repository Secrets

Configure these secrets in your GitHub repository settings:

1. Go to `Settings > Secrets and variables > Actions`
2. Add the following repository secrets:

| Secret Name | Value | Source |
|-------------|-------|---------|
| `CLAUDE_API_KEY` | Your Anthropic API key | https://console.anthropic.com/ |
| `LINEAR_API_KEY` | Your Linear API key | https://linear.app/settings/api |

Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### Step 2: Workflow Configuration

The workflow is already configured in `.github/workflows/autonomous-agents.yml`:

- **Schedule**: Runs every 30 minutes (`*/30 * * * *`)
- **Manual trigger**: Can be triggered manually via GitHub UI
- **Webhook support**: Can be triggered by Linear webhooks (future enhancement)

### Step 3: Enable GitHub Actions

1. Go to your repository's `Actions` tab
2. Enable GitHub Actions if not already enabled
3. The workflow will automatically start running on schedule

## API Key Requirements

### Anthropic (Claude) API

- **Max Plan Users**: Should have API access included
- **API Key Location**: https://console.anthropic.com/
- **Format**: Direct API key (not Claude Code CLI token)
- **Usage**: Direct API calls to `https://api.anthropic.com/v1/messages`

### Linear API

- **Key Location**: https://linear.app/settings/api
- **Format**: Personal API key
- **Usage**: GraphQL queries to `https://api.linear.app/graphql`
- **Permissions**: Read issues, create comments

### GitHub API

- **Local Testing**: Personal access token with repo permissions
- **GitHub Actions**: Automatically provided as `GITHUB_TOKEN`

## Architecture Details

### File Structure

```
agents/
├── config/
│   └── agents.json          # Agent configurations and models
├── prompts/
│   ├── planner_prompt.md    # Planning agent instructions
│   ├── senior_dev_prompt.md # Senior developer instructions
│   ├── developer_prompt.md  # Developer instructions
│   └── verifier_prompt.md   # Verification instructions
├── scripts/
│   ├── simple-agent.js      # Local development tools
│   └── github-orchestrator.js # Main orchestration logic
└── logs/                    # Runtime logs (gitignored)
```

### Data Flow

1. **Linear Issues** → GraphQL API → Issue list
2. **Issue Selection** → Complexity analysis → Agent assignment
3. **Agent Execution** → Claude API → Implementation instructions
4. **Code Changes** → Git operations → Branch/commit
5. **Progress Updates** → Linear comments → Pull request

### State Management

The orchestrator maintains state to prevent duplicate processing:

- **Processed Issues**: List of issue IDs already handled
- **Active Workflows**: Currently running implementations
- **Last Check**: Timestamp of last execution

## Monitoring and Debugging

### Local Debugging

```bash
# Run with detailed logging
npm run github:orchestrate

# Check agent configurations
npm run agents:explain

# View recent logs
ls -la agents/logs/
```

### GitHub Actions Monitoring

1. Go to `Actions` tab in your repository
2. Select the "Autonomous Claude Agents" workflow
3. View execution logs and any errors
4. Check Linear for progress comments

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Claude API error: 400` | Invalid API key or insufficient credits | Verify API key from console.anthropic.com |
| `Linear API error: 400` | Invalid GraphQL query or auth | Check Linear API key format |
| `Branch already exists` | Previous run didn't clean up | Delete existing feature branches |
| `Permission denied` | Insufficient GitHub permissions | Check GITHUB_TOKEN permissions |

## Security Considerations

- **API Keys**: Never commit API keys to the repository
- **Permissions**: Use minimal required permissions for each service
- **Branch Protection**: Consider protecting main branch to require PR reviews
- **Audit Trail**: All changes are tracked via git commits and Linear comments

## Customization

### Adjusting Schedule

Edit `.github/workflows/autonomous-agents.yml`:

```yaml
schedule:
  - cron: '*/15 * * * *'  # Every 15 minutes
  - cron: '0 9-17 * * 1-5'  # Business hours only
```

### Agent Behavior

Modify agent prompts in `agents/prompts/` to change:
- Coding style preferences
- Testing requirements
- Documentation standards
- Review criteria

### Issue Filtering

Edit the GraphQL query in `github-orchestrator.js` to filter by:
- Priority levels
- Specific labels
- Team assignments
- Project memberships

## Credits

This implementation is based on concepts from [John Rush's article on AI-driven development](https://www.john-rush.com/posts/ai-20250701.html).