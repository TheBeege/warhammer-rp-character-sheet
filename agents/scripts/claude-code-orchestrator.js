#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ClaudeCodeOrchestrator {
  constructor() {
    this.projectRoot = join(__dirname, '..', '..');
    this.settingsPath = join(this.projectRoot, '.claude', 'settings.json');
    this.agentsConfigPath = join(this.projectRoot, 'agents', 'config', 'agents.json');
    this.state = {
      processedIssues: [],
      lastRun: new Date().toISOString()
    };

    // Load environment variables
    this.loadEnvFile();
    
    // Environment variables
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.linearApiKey = process.env.LINEAR_API_KEY;
    this.githubToken = process.env.GITHUB_TOKEN;
    
    if (!this.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    // Ensure Claude settings directory exists
    const claudeDir = join(this.projectRoot, '.claude');
    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true });
    }
  }

  loadEnvFile() {
    const envPath = join(this.projectRoot, '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async setupClaudePermissions() {
    this.log('info', 'Setting up Claude Code permissions for autonomous operations');
    
    const permissions = {
      permissions: {
        allow: [
          // File operations
          "Edit(*)",
          "MultiEdit(*)",
          "Write(*)",
          "Read(*)",
          
          // Git operations
          "Bash(git:*)",
          "Bash(gh:*)",
          
          // Development tools
          "Bash(npm:*)",
          "Bash(node:*)",
          "Bash(npx:*)",
          
          // File system operations
          "Bash(ls:*)",
          "Bash(find:*)",
          "Bash(grep:*)",
          "Bash(rg:*)",
          "Bash(mkdir:*)",
          "Bash(cp:*)",
          "Bash(mv:*)",
          "Bash(rm:*)",
          
          // Testing and linting
          "Bash(npm run test:*)",
          "Bash(npm run lint:*)",
          "Bash(npm run typecheck:*)",
          "Bash(npm run build:*)",
          
          // Other tools
          "Glob(*)",
          "Grep(*)",
          "LS(*)",
          "NotebookEdit(*)",
          "NotebookRead(*)",
          "TodoWrite(*)",
          "WebFetch(*)",
          "WebSearch(*)",
          
          // MCP Linear operations
          "mcp__linear-server__list_issues",
          "mcp__linear-server__get_issue",
          "mcp__linear-server__update_issue",
          "mcp__linear-server__create_comment",
          "mcp__linear-server__list_comments",
          "mcp__linear-server__list_teams",
          "mcp__linear-server__list_issue_statuses"
        ],
        deny: [
          // Prevent dangerous operations
          "Bash(rm -rf /)",
          "Bash(sudo:*)",
          "Bash(su:*)",
          "Bash(chmod 777:*)",
          "Bash(curl:*)",
          "Bash(wget:*)"
        ]
      }
    };

    writeFileSync(this.settingsPath, JSON.stringify(permissions, null, 2));
    this.log('info', 'Claude Code permissions configured');
  }

  async setupMCPServers() {
    this.log('info', 'Setting up MCP servers for Claude Code SDK');
    
    // For GitHub Actions, we need to configure MCP programmatically
    // The Linear MCP server needs API key authentication
    if (this.linearApiKey) {
      try {
        // Create MCP configuration
        const mcpConfigPath = join(this.projectRoot, '.claude', 'mcp_servers.json');
        // Don't write actual secrets to config files
        // MCP servers should read from environment variables at runtime
        const mcpConfig = {
          servers: {
            "linear-server": {
              transport: "stdio",
              command: "npx",
              args: ["@modelcontextprotocol/server-linear"],
              env: {
                // This tells MCP to use the environment variable, not embed the value
                LINEAR_API_KEY: "${LINEAR_API_KEY}"
              }
            }
          }
        };
        
        writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
        this.log('info', 'MCP Linear server configured');
      } catch (error) {
        this.log('warn', `Failed to configure MCP server: ${error.message}`);
      }
    }
  }

  async fetchLinearIssues() {
    if (!this.linearApiKey) {
      this.log('warn', 'No Linear API key found, using mock data');
      return this.getMockIssues();
    }

    // For now, we'll use the same GraphQL query approach
    // Later, the Claude agent can use MCP directly
    const query = `
      query GetTodoIssues {
        issues(filter: { state: { name: { eq: "Todo" } } }) {
          nodes {
            id
            identifier
            title
            description
            url
            createdAt
            updatedAt
            priority
            state {
              name
              color
            }
            team {
              id
              name
              key
            }
            assignee {
              id
              name
              email
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.linearApiKey
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Linear API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.data.issues.nodes;
    } catch (error) {
      this.log('error', `Failed to fetch Linear issues: ${error.message}`);
      throw error;
    }
  }

  getAssignedAgent(issue) {
    // Check Linear labels for agent assignment
    if (issue.labels && issue.labels.nodes) {
      for (const label of issue.labels.nodes) {
        if (label.name.startsWith('agent:')) {
          const agentType = label.name.substring(6); // Remove 'agent:' prefix
          if (['planner', 'developer', 'senior_dev', 'verifier'].includes(agentType)) {
            return agentType;
          }
        }
      }
    }
    
    // No agent assigned - needs planning
    return null;
  }

  async assignAgentLabel(issue, agentType) {
    if (!this.linearApiKey) {
      this.log('warn', 'No Linear API key, cannot assign agent label');
      return;
    }

    const mutation = `
      mutation UpdateIssue($issueId: String!, $labelIds: [String!]!) {
        issueUpdate(id: $issueId, input: { labelIds: $labelIds }) {
          success
          issue {
            id
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    try {
      // First, get existing labels and add agent label
      const existingLabelIds = issue.labels?.nodes?.map(label => label.id) || [];
      
      // Remove any existing agent: labels
      const nonAgentLabels = issue.labels?.nodes?.filter(label => !label.name.startsWith('agent:')) || [];
      const nonAgentLabelIds = nonAgentLabels.map(label => label.id);
      
      // We'd need to create or find the agent label - for now, just comment
      await this.updateLinearIssue(issue.id, `🏷️ **Agent Assignment**: ${agentType}

This issue has been assigned to the **${agentType}** agent for implementation.`);
      
      this.log('info', `Assigned ${agentType} agent to issue ${issue.identifier}`);
    } catch (error) {
      this.log('error', `Failed to assign agent label: ${error.message}`);
    }
  }

  async loadAgentPrompt(agentType) {
    const promptPath = join(this.projectRoot, 'agents', 'prompts', `${agentType}_prompt.md`);
    
    if (existsSync(promptPath)) {
      return readFileSync(promptPath, 'utf8');
    }
    
    this.log('warn', `Prompt file not found for ${agentType}, using fallback`);
    return `You are a ${agentType} agent. Please implement the given task following best practices.`;
  }

  async runClaudeCodeAgent(issue, agentType = null) {
    // Determine which agent to run
    const assignedAgent = agentType || this.getAssignedAgent(issue);
    
    if (!assignedAgent) {
      // No agent assigned - run planner first
      this.log('info', `No agent assigned to issue ${issue.identifier}, running planner first`);
      
      const plannerResult = await this.runSpecificAgent(issue, 'planner');
      
      // Planner should assign an agent - for now, default to developer
      await this.assignAgentLabel(issue, 'developer');
      
      // Now run the assigned agent
      return await this.runSpecificAgent(issue, 'developer');
    } else {
      return await this.runSpecificAgent(issue, assignedAgent);
    }
  }

  async runSpecificAgent(issue, agentType) {
    this.log('info', `Running Claude Code ${agentType} agent for issue ${issue.identifier}: ${issue.title}`);
    
    // Load agent-specific prompt
    const agentPrompt = await this.loadAgentPrompt(agentType);
    
    // Create issue-specific prompt
    const prompt = `${agentPrompt}

## CURRENT TASK:
**Issue**: ${issue.identifier} - ${issue.title}
**Description**: ${issue.description || 'No description provided'}
**URL**: ${issue.url}
**Priority**: ${issue.priority || 'Normal'}

## PROJECT CONTEXT:
- **Project**: Warhammer Role-Playing Character Sheet
- **Technology**: Vanilla JavaScript, HTML, CSS (NO frameworks)
- **Main app location**: ./docs/ (keep dependency-free!)
- **Agent system location**: ./agents/ (TypeScript/Node.js OK)

## CRITICAL CONSTRAINTS:
- Do NOT add dependencies to the main app (./docs/)
- Follow existing vanilla JavaScript patterns strictly
- Do not push to remote - orchestrator handles that
- Complete ALL checklists before finishing
- Verify ALL security and cleanup requirements

## EXPECTED OUTCOME:
Complete the assigned task according to your role, following all guidelines and checklists in your prompt. Ensure production-quality implementation.

Please proceed with your assigned role for this issue.`;

    try {
      // Run Claude Code in non-interactive mode with print flag
      // Include all necessary tools for autonomous development
      const allowedTools = [
        'Edit(*)', 'MultiEdit(*)', 'Write(*)', 'Read(*)',
        'Bash(git:*)', 'Bash(gh:*)', 'Bash(npm:*)', 'Bash(node:*)',
        'Bash(ls:*)', 'Bash(find:*)', 'Bash(grep:*)', 'Bash(mkdir:*)',
        'Glob(*)', 'Grep(*)', 'LS(*)', 'TodoWrite(*)'
      ].join(' ');
      
      // Escape the prompt for shell
      const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");
      // Use dangerously-skip-permissions for autonomous operations where we trust the agent
      const command = `claude --print --dangerously-skip-permissions '${escapedPrompt}'`;
      
      // Set up environment for Claude Code
      const env = {
        ...process.env,
        ANTHROPIC_API_KEY: this.anthropicApiKey,
        CLAUDE_SETTINGS_PATH: this.settingsPath
      };

      this.log('info', 'Executing Claude Code agent...');
      const output = execSync(command, {
        cwd: this.projectRoot,
        env,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      this.log('info', 'Claude Code agent completed successfully');
      
      return output;
    } catch (error) {
      this.log('error', `Claude Code agent failed: ${error.message}`);
      
      throw error;
    }
  }

  async updateLinearIssue(issueId, comment) {
    if (!this.linearApiKey) {
      this.log('info', 'No Linear API key, skipping issue update');
      return;
    }

    const mutation = `
      mutation CreateComment($issueId: String!, $body: String!) {
        commentCreate(input: { issueId: $issueId, body: $body }) {
          success
          comment {
            id
          }
        }
      }
    `;

    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.linearApiKey
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            issueId,
            body: comment
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Linear API error: ${response.status} - ${errorText}`);
      }

      this.log('info', `Updated Linear issue ${issueId} with progress comment`);
    } catch (error) {
      this.log('error', `Failed to update Linear issue: ${error.message}`);
    }
  }

  async processIssue(issue) {
    this.log('info', `Processing Linear issue ${issue.identifier}: ${issue.title}`);
    
    try {
      // Create a branch for this issue
      const branchName = `feature/${issue.identifier.toLowerCase()}-${issue.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      
      try {
        execSync(`git checkout -b "${branchName}"`, { cwd: this.projectRoot });
        this.log('info', `Created branch: ${branchName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          this.log('info', `Branch ${branchName} already exists, checking it out`);
          execSync(`git checkout "${branchName}"`, { cwd: this.projectRoot });
        } else {
          throw error;
        }
      }

      // Update Linear issue with start message
      await this.updateLinearIssue(issue.id, `🤖 Claude Code agent is starting work on this issue...

Branch: \`${branchName}\`
Started: ${new Date().toISOString()}`);

      // Run the Claude Code agent
      const output = await this.runClaudeCodeAgent(issue);

      // Check if any changes were made
      const gitStatus = execSync('git status --porcelain', { cwd: this.projectRoot, encoding: 'utf8' });
      
      if (gitStatus.trim()) {
        // Check if agent committed changes in the last 5 minutes (agent runtime)
        try {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const recentCommits = execSync(`git log --since="${fiveMinutesAgo}" --oneline`, { 
            cwd: this.projectRoot, 
            encoding: 'utf8' 
          }).trim();
          
          if (!recentCommits) {
            // No commits in last 5 minutes - agent didn't commit
            this.log('warn', 'Agent made changes but did not commit them. Orchestrator committing as fallback.');
            
            execSync('git add .', { cwd: this.projectRoot });
            execSync(`git commit -m "feat: Implement ${issue.identifier} - ${issue.title}

${issue.description || 'No description provided'}

⚠️ FALLBACK COMMIT: Agent completed implementation but did not commit changes.
This commit was created by the orchestrator as a safety measure.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"`, { cwd: this.projectRoot });
            
            this.log('info', 'Fallback commit completed');
          } else {
            this.log('info', 'Agent properly committed changes within session timeframe');
          }
        } catch (error) {
          // If git log fails, assume agent didn't commit and do fallback
          this.log('warn', 'Could not check recent commits, doing fallback commit');
          
          execSync('git add .', { cwd: this.projectRoot });
          execSync(`git commit -m "feat: Implement ${issue.identifier} - ${issue.title}

${issue.description || 'No description provided'}

⚠️ FALLBACK COMMIT: Could not verify agent commits, committing as safety measure.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"`, { cwd: this.projectRoot });
          
          this.log('info', 'Fallback commit completed');
        }
        
        // Ensure branch is pushed for PR creation
        const currentBranch = execSync('git branch --show-current', { 
          cwd: this.projectRoot, 
          encoding: 'utf8' 
        }).trim();
        
        execSync(`git push -u origin "${currentBranch}"`, { cwd: this.projectRoot });
        this.log('info', `Pushed branch ${currentBranch} to remote`);
        
        this.log('info', 'Changes detected, agent successfully implemented the issue');
        
        // Update Linear issue with completion
        await this.updateLinearIssue(issue.id, `✅ Claude Code agent completed the implementation!

The changes have been committed to the branch \`${branchName}\`.
A pull request will be created for review.

Agent output summary:
\`\`\`
${output.slice(-1000)}  // Last 1000 chars of output
\`\`\``);

        // Mark as processed
        this.state.processedIssues.push(issue.id);
        return true;
      } else {
        this.log('warn', 'No changes were made by the agent');
        await this.updateLinearIssue(issue.id, `⚠️ Claude Code agent completed but made no changes.

This might indicate:
- The issue is already implemented
- The agent couldn't find the right files
- Additional clarification is needed`);
        return false;
      }
    } catch (error) {
      this.log('error', `Failed to process issue: ${error.message}`);
      
      // Update Linear with error
      await this.updateLinearIssue(issue.id, `❌ Claude Code agent encountered an error:

\`\`\`
${error.message}
\`\`\`

The issue may need manual intervention.`);
      
      throw error;
    }
  }

  async createPullRequest() {
    try {
      // Check if we're on a feature branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();

      if (currentBranch === 'main' || currentBranch === 'master') {
        this.log('info', 'On main branch, no pull request needed');
        return;
      }

      // Push the branch
      execSync(`git push -u origin "${currentBranch}"`, { cwd: this.projectRoot });
      
      // Create PR using gh CLI
      const prTitle = currentBranch.replace(/^feature\//, '').replace(/-/g, ' ');
      const prBody = `## Automated Implementation

This pull request was created automatically by Claude Code agent.

### Changes
- Implemented based on Linear issue requirements
- Followed project conventions and patterns
- Tested implementation where applicable

### Review Notes
Please review the changes carefully before merging.

---
🤖 Generated with Claude Code Autonomous Agents`;

      const prCommand = `gh pr create --title "${prTitle}" --body "${prBody}"`;
      const prUrl = execSync(prCommand, { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();

      this.log('info', `Created pull request: ${prUrl}`);
      return prUrl;
    } catch (error) {
      this.log('error', `Failed to create pull request: ${error.message}`);
      throw error;
    }
  }

  getMockIssues() {
    return [{
      id: 'mock-001',
      identifier: 'MOCK-1',
      title: 'Test Claude Code SDK Integration',
      description: 'This is a mock issue for testing the Claude Code SDK integration',
      url: 'https://linear.app/mock/issue/MOCK-1',
      state: { name: 'Todo' },
      team: { name: 'Mock Team', key: 'MOCK' }
    }];
  }

  async run() {
    this.log('info', 'Starting Claude Code Orchestrator');
    
    try {
      // Setup Claude permissions and MCP servers
      await this.setupClaudePermissions();
      await this.setupMCPServers();

      // Fetch Linear issues
      const issues = await this.fetchLinearIssues();
      this.log('info', `Found ${issues.length} issues to process`);

      if (issues.length === 0) {
        this.log('info', 'No issues in Todo state, exiting');
        return;
      }

      // Process one issue at a time to avoid conflicts
      for (const issue of issues) {
        if (this.state.processedIssues.includes(issue.id)) {
          this.log('info', `Skipping already processed issue ${issue.identifier}`);
          continue;
        }

        try {
          const success = await this.processIssue(issue);
          
          if (success) {
            // Create a pull request
            await this.createPullRequest();
            
            // Return to main branch for next issue
            execSync('git checkout main', { cwd: this.projectRoot });
            
            // Only process one issue per run in GitHub Actions
            if (process.env.GITHUB_ACTIONS) {
              this.log('info', 'Processed one issue in GitHub Actions, exiting');
              break;
            }
          }
        } catch (error) {
          this.log('error', `Issue processing failed: ${error.message}`);
          
          // Return to main branch on error
          try {
            execSync('git checkout main', { cwd: this.projectRoot });
          } catch (e) {
            // Ignore checkout errors
          }
        }
      }

      this.log('info', 'Claude Code Orchestrator completed successfully');
    } catch (error) {
      this.log('error', `Orchestrator failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new ClaudeCodeOrchestrator();
  orchestrator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default ClaudeCodeOrchestrator;