import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { loadEnvFile, getRequiredEnv } from './env.js';
import { Logger } from './logger.js';

/**
 * Shared agent execution logic used by both simple-agent and orchestrator
 */
export class AgentRunner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.settingsPath = join(projectRoot, '.claude', 'settings.json');
    
    // Load environment variables
    loadEnvFile(projectRoot);
    this.anthropicApiKey = getRequiredEnv('ANTHROPIC_API_KEY');
  }

  /**
   * Load agent-specific prompt
   * @param {string} agentType - The agent type (planner, developer, senior_dev, verifier)
   * @returns {string} The agent prompt content
   */
  loadAgentPrompt(agentType) {
    const promptPath = join(this.projectRoot, 'agents', 'prompts', `${agentType}_prompt.md`);
    
    if (existsSync(promptPath)) {
      return readFileSync(promptPath, 'utf8');
    }
    
    Logger.warn(`Prompt file not found for ${agentType}, using fallback`);
    return `You are a ${agentType} agent. Please implement the given task following best practices.`;
  }

  /**
   * Create issue-specific prompt for orchestrator
   * @param {string} agentType - The agent type
   * @param {Object} issue - Linear issue object
   * @returns {string} Complete prompt for the agent
   */
  createIssuePrompt(agentType, issue) {
    const agentPrompt = this.loadAgentPrompt(agentType);
    
    return `${agentPrompt}

## CURRENT TASK:
**Issue**: ${issue.identifier} - ${issue.title}
**Description**: ${issue.description || 'No description provided'}
**URL**: ${issue.url}
**Priority**: ${issue.priority || 'Normal'}

Please proceed with your assigned role for this issue.`;
  }

  /**
   * Create task-specific prompt for simple testing
   * @param {string} agentType - The agent type
   * @param {string} task - Task description
   * @param {Object} context - Additional context
   * @returns {string} Complete prompt for the agent
   */
  createTaskPrompt(agentType, task, context = {}) {
    const agentPrompt = this.loadAgentPrompt(agentType);
    
    return `${agentPrompt}

## Your Current Task:
${task}

## Additional Context:
${JSON.stringify(context, null, 2)}

Remember: Stay in character as a ${agentType}. Focus on your specialized responsibilities.`;
  }

  /**
   * Execute a Claude Code agent with the given prompt
   * @param {string} prompt - The complete prompt to send to Claude
   * @returns {Promise<string>} Agent output
   */
  async executeAgent(prompt) {
    try {
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

      Logger.info('Executing Claude Code agent...');
      const output = execSync(command, {
        cwd: this.projectRoot,
        env,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      Logger.info('Claude Code agent completed successfully');
      return output;
    } catch (error) {
      Logger.error(`Claude Code agent failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run an agent for a specific Linear issue (used by orchestrator)
   * @param {string} agentType - The agent type
   * @param {Object} issue - Linear issue object
   * @returns {Promise<string>} Agent output
   */
  async runAgentForIssue(agentType, issue) {
    Logger.info(`Running Claude Code ${agentType} agent for issue ${issue.identifier}: ${issue.title}`);
    
    const prompt = this.createIssuePrompt(agentType, issue);
    return await this.executeAgent(prompt);
  }

  /**
   * Run an agent for a specific task (used by simple-agent for testing)
   * @param {string} agentType - The agent type
   * @param {string} task - Task description
   * @param {Object} context - Additional context
   * @returns {Promise<string>} Agent output
   */
  async runAgentForTask(agentType, task, context = {}) {
    Logger.info(`Running Claude Code ${agentType} agent for task: ${task}`);
    
    const prompt = this.createTaskPrompt(agentType, task, context);
    return await this.executeAgent(prompt);
  }
}