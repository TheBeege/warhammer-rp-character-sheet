#!/usr/bin/env node

/**
 * Multi-Agent Orchestrator
 * Coordinates different AI agents to work on tasks collaboratively
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AgentOrchestrator {
  constructor(configPath = '../config/agents.json') {
    this.baseDir = join(__dirname, '..');
    this.config = this.loadConfig(configPath);
    this.agents = this.config.agents;
    this.workflow = this.config.workflow;
    this.logsDir = join(this.baseDir, 'logs');
    
    // Ensure logs directory exists
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  loadConfig(configPath) {
    const configFile = join(this.baseDir, configPath);
    const configData = readFileSync(configFile, 'utf8');
    return JSON.parse(configData);
  }

  loadPrompt(templateName) {
    const promptFile = join(this.baseDir, 'prompts', templateName);
    return readFileSync(promptFile, 'utf8');
  }

  createGitWorktree(taskName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const worktreeName = `agent-${taskName}-${timestamp}`;
    const worktreePath = join(this.baseDir, '..', '.worktrees', worktreeName);
    
    // Create worktrees directory if it doesn't exist
    const worktreesDir = join(this.baseDir, '..', '.worktrees');
    if (!existsSync(worktreesDir)) {
      mkdirSync(worktreesDir, { recursive: true });
    }
    
    // Create worktree
    try {
      execSync(`git worktree add "${worktreePath}" -b "feature/${taskName}"`, {
        cwd: join(this.baseDir, '..'),
        stdio: 'pipe'
      });
      console.log(`📁 Created worktree: ${worktreeName}`);
    } catch (error) {
      console.warn(`⚠️  Could not create worktree: ${error.message}`);
    }
    
    return worktreePath;
  }

  logInteraction(agentName, task, response) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = join(this.logsDir, `${agentName}-${timestamp}.log`);
    
    const logContent = `Agent: ${agentName}
Task: ${task}
Timestamp: ${timestamp}

Response:
${response}
`;
    
    writeFileSync(logFile, logContent);
  }

  async runAgent(agentType, task, context = null) {
    const agent = this.agents[agentType];
    const promptTemplate = this.loadPrompt(agent.prompt_template);
    
    // Build the full prompt
    let fullPrompt = `${promptTemplate}\n\n## Current Task:\n${task}`;
    
    if (context) {
      fullPrompt += `\n\n## Context:\n${JSON.stringify(context, null, 2)}`;
    }
    
    console.log(`\n🤖 Running ${agent.name} (${agentType})`);
    console.log(`📋 Task: ${task}`);
    console.log(`🌡️  Temperature: ${agent.temperature}`);
    console.log(`🎯 Role: ${agent.role}`);
    
    // Call the actual AI API
    const response = await this.callClaudeAPI(agent, fullPrompt);
    
    // Log the interaction
    this.logInteraction(agent.name, task, response);
    
    return response;
  }

  async callClaudeAPI(agent, prompt) {
    // This is where you would integrate with Claude's API
    // For now, we'll create a command that can be executed via Claude Code
    
    const apiCall = {
      model: agent.model,
      temperature: agent.temperature,
      prompt: prompt,
      max_tokens: 4000
    };
    
    // Save the prompt to a temporary file that Claude Code can read
    const promptFile = join(this.logsDir, `prompt-${Date.now()}.txt`);
    writeFileSync(promptFile, prompt);
    
    console.log(`\n💡 To execute this agent, run Claude Code with:`);
    console.log(`   Model: ${agent.model}`);
    console.log(`   Temperature: ${agent.temperature}`);
    console.log(`   Prompt saved to: ${promptFile}`);
    
    // In a real implementation, you would call the API here
    // For now, return a placeholder
    return `[Agent ${agent.name} would process this task with the Claude API]`;
  }

  async executeWorkflow(initialTask) {
    console.log(`\n🚀 Starting Multi-Agent Workflow`);
    console.log(`📝 Initial Task: ${initialTask}\n`);
    
    const results = {};
    
    // Phase 1: Planning
    console.log('='.repeat(50));
    console.log('PHASE 1: PLANNING');
    console.log('='.repeat(50));
    const plan = await this.runAgent('planner', initialTask);
    results.plan = plan;
    
    // Phase 2: Implementation
    console.log('\n' + '='.repeat(50));
    console.log('PHASE 2: IMPLEMENTATION');
    console.log('='.repeat(50));
    
    // Parse plan to extract tasks (in real implementation)
    const seniorTask = 'Implement complex architecture components from the plan';
    const devTask = 'Implement simple UI components from the plan';
    
    if (this.workflow.implementation_phase.parallel) {
      // Create worktrees for parallel development
      const seniorWorktree = this.createGitWorktree('senior-task');
      const devWorktree = this.createGitWorktree('dev-task');
    }
    
    // Run agents
    const [seniorResult, devResult] = await Promise.all([
      this.runAgent('senior_developer', seniorTask, { plan }),
      this.runAgent('developer', devTask, { plan })
    ]);
    
    results.implementation = {
      senior: seniorResult,
      developer: devResult
    };
    
    // Phase 3: Verification
    console.log('\n' + '='.repeat(50));
    console.log('PHASE 3: VERIFICATION');
    console.log('='.repeat(50));
    const verificationTask = `Verify implementation against original requirements: ${initialTask}`;
    const verification = await this.runAgent('verifier', verificationTask, results);
    results.verification = verification;
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = join(this.logsDir, `workflow-${timestamp}.json`);
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Workflow completed! Results saved to ${resultsFile}`);
    return results;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new AgentOrchestrator();
  
  const task = process.argv.slice(2).join(' ') || 
    'Implement editable table cells with text input functionality';
  
  orchestrator.executeWorkflow(task).catch(console.error);
}