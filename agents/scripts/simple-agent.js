#!/usr/bin/env node

/**
 * Simple Agent System
 * A beginner-friendly approach to multi-agent development
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AgentRunner } from '../utils/agent-runner.js';
import { LinearClient } from '../utils/linear-client.js';
import { loadEnvFile, getRequiredEnv } from '../utils/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SimpleAgent {
  constructor() {
    this.agentsDir = join(__dirname, '..');
    this.projectRoot = join(__dirname, '..', '..');
    this.config = JSON.parse(readFileSync(join(this.agentsDir, 'config/agents.json'), 'utf8'));
    
    // Load environment variables
    loadEnvFile(this.projectRoot);
    const linearApiKey = getRequiredEnv('LINEAR_API_KEY');
    
    this.agentRunner = new AgentRunner(this.projectRoot);
    this.linearClient = new LinearClient(linearApiKey);
  }

  /**
   * Create a task prompt for a specific agent
   * This is the key insight: each agent gets specialized instructions
   */
  createTaskPrompt(agentType, task, context = {}) {
    const agent = this.config.agents[agentType];
    const promptTemplate = readFileSync(
      join(this.agentsDir, 'prompts', agent.prompt_template), 
      'utf8'
    );

    // Combine the agent's role prompt with the specific task
    return `${promptTemplate}

## Your Current Task:
${task}

## Additional Context:
${JSON.stringify(context, null, 2)}

Remember: Stay in character as a ${agent.role}. Focus on your specialized responsibilities.`;
  }

  /**
   * Save a task for later execution with Claude Code
   * This is where the "fix inputs, not outputs" philosophy comes in
   */
  saveTask(agentType, task, context = {}) {
    const prompt = this.createTaskPrompt(agentType, task, context);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${agentType}-task-${timestamp}.md`;
    const filepath = join(this.agentsDir, 'logs', filename);
    
    writeFileSync(filepath, prompt);
    
    console.log(`\n📝 Task saved for ${agentType}:`);
    console.log(`   File: ${filename}`);
    console.log(`   Task: ${task}`);
    console.log(`\n💡 To execute: Copy the content from ${filepath} and paste into Claude Code`);
    
    return filepath;
  }

  /**
   * The main workflow: Plan → Implement → Verify
   * Each step uses a different specialized agent
   */
  createWorkflow(mainTask) {
    console.log(`\n🚀 Creating Multi-Agent Workflow for: ${mainTask}\n`);

    // Step 1: Planning Agent creates detailed plan
    const planFile = this.saveTask('planner', mainTask);
    
    console.log(`\n📋 Next Steps:`);
    console.log(`1. Run the planner task to create a detailed plan`);
    console.log(`2. Based on the plan, create implementation tasks for developers`);
    console.log(`3. Run verification to ensure everything meets requirements`);
    
    return {
      planFile,
      nextSteps: [
        'Execute planner task',
        'Create implementation tasks from plan',
        'Execute implementation tasks',
        'Run verification'
      ]
    };
  }

  /**
   * Helper to understand agent roles
   */
  explainAgents() {
    console.log(`\n🤖 Agent Roles Explained:\n`);
    
    Object.entries(this.config.agents).forEach(([type, agent]) => {
      console.log(`${agent.name} (${type}):`);
      console.log(`  Role: ${agent.role}`);
      console.log(`  Capabilities: ${agent.capabilities.join(', ')}`);
      console.log(`  When to use: ${this.getUsageGuidance(type)}\n`);
    });
  }

  getUsageGuidance(agentType) {
    const guidance = {
      planner: "When you need to break down complex tasks into actionable steps",
      senior_developer: "For complex implementations requiring architectural decisions",
      developer: "For straightforward implementations following existing patterns",
      verifier: "To ensure implementations meet all requirements and quality standards"
    };
    return guidance[agentType] || "General purpose tasks";
  }

  /**
   * Run an agent directly on a Linear issue
   */
  async runAgentOnLinearIssue(agentType, issueId) {
    console.log(`\n🤖 Running ${agentType} agent on Linear issue ${issueId}...\n`);
    
    try {
      // Fetch Linear issue details
      const issue = await this.linearClient.getIssue(issueId);
      
      // Execute agent using the shared agent runner
      const output = await this.agentRunner.runAgentForIssue(agentType, issue);
      
      console.log('\n✅ Agent execution completed successfully');
      return output;
      
    } catch (error) {
      console.error('❌ Error running agent:', error.message);
      throw error;
    }
  }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new SimpleAgent();
  const command = process.argv[2];

  switch (command) {
    case 'explain':
      agent.explainAgents();
      break;
      
    case 'task':
      const agentType = process.argv[3];
      const taskOrIssueId = process.argv.slice(4).join(' ');
      if (!agentType) {
        console.log('Usage: node simple-agent.js task [agent-type] [issue-id OR task description]');
        console.log('Agent types: planner, senior_developer, developer, verifier');
        console.log('Examples:');
        console.log('  node simple-agent.js task developer WAR-12');
        console.log('  node simple-agent.js task developer "Fix button styling"');
        break;
      }
      
      // Check if it's a Linear issue ID pattern: alphanumeric-number
      const linearIssuePattern = /^[A-Za-z0-9]+-\d+$/;
      if (taskOrIssueId && linearIssuePattern.test(taskOrIssueId)) {
        agent.runAgentOnLinearIssue(agentType, taskOrIssueId);
      } else if (taskOrIssueId) {
        agent.saveTask(agentType, taskOrIssueId);
      } else {
        console.log('Please provide either a Linear issue ID (ABC-123) or task description');
      }
      break;
      
    case 'workflow':
      const mainTask = process.argv.slice(3).join(' ') || 'Implement editable table functionality';
      agent.createWorkflow(mainTask);
      break;
      
    default:
      console.log(`
Simple Agent System - Multi-Agent Development Made Easy

Commands:
  explain             - Learn about each agent's role and capabilities
  task [type] [desc]  - Create a task for a specific agent
  workflow [desc]     - Create a complete multi-agent workflow

Examples:
  node simple-agent.js explain
  node simple-agent.js task planner "Create plan for editable table"
  node simple-agent.js workflow "Implement user authentication"

The key insight: Instead of trying to do everything yourself, delegate 
specialized tasks to agents with specific expertise and instructions.
      `);
  }
}