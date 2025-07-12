#!/usr/bin/env node

/**
 * Claude Agent Runner
 * Executes specialized agents using Claude Code CLI
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ClaudeAgentRunner {
  constructor() {
    this.baseDir = join(__dirname, '..');
    this.config = JSON.parse(readFileSync(join(this.baseDir, 'config/agents.json'), 'utf8'));
    this.promptsDir = join(this.baseDir, 'prompts');
    this.tasksDir = join(this.baseDir, 'tasks');
    
    // Ensure directories exist
    [this.tasksDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  createAgentTask(agentType, taskDescription, context = {}) {
    const agent = this.config.agents[agentType];
    const promptTemplate = readFileSync(join(this.promptsDir, agent.prompt_template), 'utf8');
    
    // Build the complete prompt
    const fullPrompt = `${promptTemplate}

## Current Task:
${taskDescription}

## Context:
${JSON.stringify(context, null, 2)}

## Important Instructions:
- Follow the agent role and guidelines strictly
- Use the available tools to complete the task
- Commit changes with descriptive messages
- Document any important decisions
`;

    // Save task file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const taskFile = join(this.tasksDir, `${agentType}-${timestamp}.md`);
    writeFileSync(taskFile, fullPrompt);
    
    return {
      agent,
      taskFile,
      fullPrompt
    };
  }

  async runClaudeWithAgent(agentType, taskDescription, context = {}) {
    const { agent, taskFile, fullPrompt } = this.createAgentTask(agentType, taskDescription, context);
    
    console.log(`\n🤖 Preparing ${agent.name} (${agentType})`);
    console.log(`📋 Task: ${taskDescription}`);
    console.log(`📄 Task file: ${taskFile}`);
    
    // Build Claude command
    const claudeArgs = [
      '-m', agent.model,
      '-t', agent.temperature.toString(),
    ];
    
    // Add the prompt
    claudeArgs.push(fullPrompt);
    
    console.log(`\n💡 To run this agent manually:`);
    console.log(`claude ${claudeArgs.join(' ')}`);
    
    return {
      command: 'claude',
      args: claudeArgs,
      taskFile,
      agent
    };
  }

  async executePlan(planFile) {
    // Read and parse plan
    const plan = readFileSync(planFile, 'utf8');
    const tasks = this.parsePlan(plan);
    
    console.log(`\n📋 Executing plan with ${tasks.length} tasks`);
    
    for (const task of tasks) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Task ${task.id}: ${task.name}`);
      console.log(`Agent: ${task.agent}`);
      console.log('='.repeat(50));
      
      const { command, args, taskFile } = await this.runClaudeWithAgent(
        task.agent,
        task.description,
        { planFile, previousTasks: tasks.slice(0, task.id - 1) }
      );
      
      // Here you would actually execute Claude
      console.log(`\n🚀 Ready to execute. Run manually or integrate with Claude API.`);
    }
  }

  parsePlan(planContent) {
    // Simple parser for plan format
    const tasks = [];
    const taskRegex = /### Task (\d+): (.+)\n- \*\*Agent\*\*: (.+)\n- \*\*Description\*\*: (.+)\n/g;
    
    let match;
    while ((match = taskRegex.exec(planContent)) !== null) {
      tasks.push({
        id: parseInt(match[1]),
        name: match[2],
        agent: match[3],
        description: match[4]
      });
    }
    
    return tasks;
  }
}

// Utility functions for direct Claude integration
export function createClaudePrompt(agentType, task, config) {
  const agent = config.agents[agentType];
  const promptPath = join(dirname(__dirname), 'prompts', agent.prompt_template);
  const promptTemplate = readFileSync(promptPath, 'utf8');
  
  return `${promptTemplate}\n\n## Current Task:\n${task}`;
}

export function prepareAgentEnvironment(agentType, workingDir) {
  // Set up environment variables for the agent
  const env = {
    AGENT_TYPE: agentType,
    AGENT_WORKING_DIR: workingDir,
    AGENT_CONFIG: join(dirname(__dirname), 'config/agents.json')
  };
  
  return env;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new ClaudeAgentRunner();
  const command = process.argv[2];
  
  if (command === 'run') {
    const agentType = process.argv[3] || 'planner';
    const task = process.argv.slice(4).join(' ') || 'Create a plan for implementing editable table';
    
    runner.runClaudeWithAgent(agentType, task)
      .then(result => {
        console.log('\n✅ Agent task prepared successfully');
      })
      .catch(console.error);
  } else if (command === 'execute-plan') {
    const planFile = process.argv[3];
    if (!planFile) {
      console.error('Please provide a plan file');
      process.exit(1);
    }
    runner.executePlan(planFile).catch(console.error);
  } else {
    console.log(`
Claude Agent Runner

Usage:
  node claude-agent-runner.js run [agent-type] [task description]
  node claude-agent-runner.js execute-plan [plan-file]

Agent Types:
  - planner: Creates detailed implementation plans
  - senior_developer: Handles complex implementations  
  - developer: Handles simple implementations
  - verifier: Verifies implementations

Example:
  node claude-agent-runner.js run planner "Create plan for editable table"
  node claude-agent-runner.js run developer "Implement storage persistence"
    `);
  }
}