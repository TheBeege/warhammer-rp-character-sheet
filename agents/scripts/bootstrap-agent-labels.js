#!/usr/bin/env node

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile, getRequiredEnv } from '../utils/env.js';
import { Logger } from '../utils/logger.js';
import { LinearClient } from '../utils/linear-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AgentLabelBootstrap {
  constructor() {
    this.projectRoot = join(__dirname, '..', '..');
    
    // Load environment variables
    loadEnvFile(this.projectRoot);
    
    // Initialize Linear client
    const linearApiKey = getRequiredEnv('LINEAR_API_KEY');
    this.linearClient = new LinearClient(linearApiKey);
    
    // Team ID - could be made configurable later
    this.teamId = 'ac3597ec-6998-4ca1-884e-ebae58964ea7';
  }

  async createAgentLabels() {
    Logger.info('Starting agent label bootstrap process');

    // Define the agent labels we need
    const agentLabels = [
      {
        name: 'agent:developer',
        color: '#4EA7FC',
        description: 'Assigned to developer agent for simple to medium complexity features and bug fixes'
      },
      {
        name: 'agent:senior_dev', 
        color: '#BB87FC',
        description: 'Assigned to senior developer agent for complex features and architectural changes'
      },
      {
        name: 'agent:verifier',
        color: '#27AE60',
        description: 'Assigned to verifier agent for quality assurance and code review'
      }
    ];

    // Check existing labels and create missing ones
    Logger.info('Checking existing labels...');
    const existingLabels = await this.linearClient.getTeamLabels(this.teamId);
    
    for (const labelConfig of agentLabels) {
      const existingLabel = existingLabels.find(label => label.name === labelConfig.name);
      
      if (existingLabel) {
        Logger.info(`Label "${labelConfig.name}" already exists with ID: ${existingLabel.id}`);
      } else {
        Logger.info(`Creating label "${labelConfig.name}"...`);
        const labelId = await this.linearClient.createLabel(this.teamId, labelConfig);
        Logger.info(`Created label "${labelConfig.name}" with ID: ${labelId}`);
      }
    }

    Logger.info('Agent label bootstrap completed successfully');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bootstrap = new AgentLabelBootstrap();
  bootstrap.createAgentLabels().catch(error => {
    Logger.error(`Bootstrap failed: ${error.message}`);
    process.exit(1);
  });
}

export default AgentLabelBootstrap;