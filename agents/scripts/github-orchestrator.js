#!/usr/bin/env node

/**
 * GitHub Actions Claude Agent Orchestrator
 * Runs autonomous Claude agents in GitHub Actions environment
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GitHubOrchestrator {
  constructor() {
    this.baseDir = join(__dirname, '..');
    this.projectRoot = join(this.baseDir, '..');
    this.config = JSON.parse(readFileSync(join(this.baseDir, 'config/agents.json'), 'utf8'));
    
    // Load .env file if it exists
    // Note: We chose not to use the dotenv library to keep dependencies minimal
    // for this project which aims to have no dependencies for the main web app
    this.loadEnvFile();
    
    // Environment variables
    this.claudeApiKey = process.env.ANTHROPIC_API_KEY;
    this.linearApiKey = process.env.LINEAR_API_KEY;
    this.githubToken = process.env.GITHUB_TOKEN;
    
    if (!this.claudeApiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
  }

  loadEnvFile() {
    const envPath = join(this.projectRoot, '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
      }
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  async callClaudeAPI(prompt, model = 'claude-3-5-sonnet-20241022', temperature = 0.3) {
    this.log(`Calling Claude API with model ${model}`);
    
    const payload = {
      model: model,
      max_tokens: 4000,
      temperature: temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      this.log(`Claude API call failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async getLinearIssues() {
    if (!this.linearApiKey) {
      this.log('No Linear API key provided, using mock data for testing');
      return [
        {
          id: 'WAR-11',
          identifier: 'WAR-11',
          title: 'Finish implementing editable table component',
          status: { name: 'Todo' },
          priority: { name: 'High' },
          description: 'The editable table component currently is incomplete. Maintaining the row template and adding new rows works; however, editing text values and persistence to storage is not yet implemented.',
          url: 'https://linear.app/warhammer-character-sheet/issue/WAR-11'
        }
      ];
    }

    try {
      const query = `
        query {
          issues(filter: { state: { name: { eq: "Todo" } } }) {
            nodes {
              id
              identifier
              title
              description
              url
              priority
              state {
                name
              }
              team {
                name
              }
            }
          }
        }
      `;

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
      this.log(`Error fetching Linear issues: ${error.message}`, 'error');
      return [];
    }
  }

  async updateLinearIssue(issueId, comment) {
    if (!this.linearApiKey) {
      this.log(`Would update Linear issue ${issueId} with: ${comment}`);
      return;
    }

    try {
      const mutation = `
        mutation {
          commentCreate(input: {
            issueId: "${issueId}"
            body: "${comment}"
          }) {
            success
          }
        }
      `;

      await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.linearApiKey
        },
        body: JSON.stringify({ query: mutation })
      });

      this.log(`Updated Linear issue ${issueId} with progress comment`);
    } catch (error) {
      this.log(`Failed to update Linear issue: ${error.message}`, 'error');
    }
  }

  createBranch(issueId, title) {
    const branchName = `feature/${issueId.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    try {
      execSync(`git checkout -b "${branchName}"`, { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      this.log(`Created branch: ${branchName}`);
      return branchName;
    } catch (error) {
      this.log(`Failed to create branch: ${error.message}`, 'error');
      return null;
    }
  }

  async executeClaudeAgent(agentType, task, context = {}) {
    this.log(`Executing Claude ${agentType} agent for: ${task}`);
    
    const agent = this.config.agents[agentType];
    const promptTemplate = readFileSync(
      join(this.baseDir, 'prompts', agent.prompt_template), 
      'utf8'
    );

    const fullPrompt = `${promptTemplate}

## Current Task:
${task}

## Context:
${JSON.stringify(context, null, 2)}

## Environment Information:
- You are running in GitHub Actions
- You have access to the full repository
- You can create files, modify code, and commit changes
- Working directory: ${this.projectRoot}
- Current branch: ${context.branch || 'main'}

## Instructions:
1. Analyze the current codebase to understand existing patterns
2. Implement the requested feature following existing conventions
3. Create or modify files as needed
4. Provide specific file paths and code changes
5. Focus on your role as ${agent.role}

Please provide your implementation as structured output with clear file operations.`;

    try {
      const response = await this.callClaudeAPI(fullPrompt, agent.model, agent.temperature);
      
      // Parse and execute the Claude response
      await this.executeClaudeInstructions(response, context);
      
      return response;
    } catch (error) {
      this.log(`Claude agent execution failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async executeClaudeInstructions(instructions, context) {
    // This is a simplified implementation
    // In practice, you'd need more sophisticated parsing of Claude's responses
    this.log('Executing Claude instructions...');
    
    // For now, just create a placeholder implementation
    const issueId = context.issue?.identifier || 'unknown';
    const timestamp = new Date().toISOString();
    
    const implementationFile = join(this.projectRoot, 'CLAUDE_IMPLEMENTATION.md');
    const content = `# Claude Agent Implementation

**Issue**: ${issueId}
**Timestamp**: ${timestamp}
**Agent**: ${context.agentType}

## Instructions Received:
${instructions}

## Implementation Status:
This is a placeholder implementation. The Claude agent would normally:
1. Analyze the existing codebase
2. Make specific code changes
3. Create/modify files as needed
4. Commit changes with descriptive messages

Next step: Integrate actual code execution based on Claude's structured output.
`;

    writeFileSync(implementationFile, content);
    
    // Commit the changes
    try {
      execSync('git add .', { cwd: this.projectRoot });
      execSync(`git commit -m "🤖 Claude agent implementation for ${issueId}

${instructions.substring(0, 200)}...

🤖 Generated with Claude ${context.agentType} agent
Co-Authored-By: Claude <noreply@anthropic.com>"`, { 
        cwd: this.projectRoot 
      });
      
      this.log('Committed changes successfully');
    } catch (error) {
      this.log(`Failed to commit: ${error.message}`, 'error');
    }
  }

  selectAgent(issue) {
    const title = issue.title.toLowerCase();
    const description = (issue.description || '').toLowerCase();
    
    // Simple heuristics for agent selection
    if (title.includes('plan') || description.includes('design')) {
      return 'planner';
    }
    
    if (title.includes('complex') || issue.priority?.name === 'High') {
      return 'senior_developer';
    }
    
    return 'developer';
  }

  async processIssue(issue) {
    this.log(`Processing Linear issue ${issue.identifier}: ${issue.title}`);
    
    // Create branch for this issue
    const branch = this.createBranch(issue.identifier, issue.title);
    if (!branch) return;

    // Select appropriate Claude agent
    const agentType = this.selectAgent(issue);
    this.log(`Selected ${agentType} agent for this issue`);

    // Update Linear with progress
    await this.updateLinearIssue(issue.id, 
      `🤖 Claude ${agentType} agent started working on this issue.\n\nBranch: \`${branch}\``
    );

    try {
      // Execute Claude agent
      const result = await this.executeClaudeAgent(agentType, 
        `Implement ${issue.title} (${issue.identifier})`, 
        { issue, branch, agentType }
      );

      // Update Linear with completion
      await this.updateLinearIssue(issue.id, 
        `✅ Claude ${agentType} agent completed implementation.\n\nCheck the pull request for review.`
      );

      this.log(`Successfully processed issue ${issue.identifier}`);
      return true;
    } catch (error) {
      // Update Linear with error
      await this.updateLinearIssue(issue.id, 
        `❌ Claude agent encountered an error: ${error.message}\n\nWill retry in next cycle.`
      );
      
      this.log(`Failed to process issue ${issue.identifier}: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    this.log('Starting Claude Agent Orchestrator in GitHub Actions');
    
    try {
      // Get current Linear issues
      const issues = await this.getLinearIssues();
      this.log(`Found ${issues.length} issues to process`);
      
      // Filter for Todo issues
      const todoIssues = issues.filter(issue => 
        issue.status?.name === 'Todo' || issue.state?.name === 'Todo'
      );
      
      if (todoIssues.length === 0) {
        this.log('No Todo issues found, nothing to process');
        return;
      }
      
      // Process the first issue (to avoid overwhelming the system)
      const issue = todoIssues[0];
      const success = await this.processIssue(issue);
      
      if (success) {
        this.log('Issue processed successfully');
      } else {
        this.log('Issue processing failed');
        process.exit(1);
      }
      
    } catch (error) {
      this.log(`Orchestrator failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new GitHubOrchestrator();
  orchestrator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}