import { Logger } from './logger.js';

/**
 * Linear GraphQL API client for functions NOT provided by MCP
 * For standard operations, use MCP functions: mcp__linear-server__*
 */
export class LinearClient {
  /**
   * @param {string} apiKey - Linear API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Linear API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.linear.app/graphql';
  }

  /**
   * Make a raw GraphQL request to Linear API
   * @param {string} query - GraphQL query or mutation
   * @param {Object} variables - GraphQL variables
   * @returns {Promise<Object>} Response data
   */
  async request(query, variables = {}) {
    Logger.debug(`Making Linear API request with variables: ${JSON.stringify(variables)}`);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Linear API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * Get team labels (needed for bootstrap script)
   * Note: Agents should use mcp__linear-server__list_issue_labels when available
   * @param {string} teamId - Team ID
   * @returns {Promise<Array>} Array of label objects
   */
  async getTeamLabels(teamId) {
    const query = `
      query GetTeamLabels($teamId: String!) {
        team(id: $teamId) {
          labels {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    `;

    const response = await this.request(query, { teamId });
    return response.data.team.labels.nodes;
  }

  /**
   * Get issue details by ID (used by simple-agent for testing)
   * Note: For production use, prefer mcp__linear-server__get_issue when in Claude Code
   * @param {string} issueId - Issue ID
   * @returns {Promise<Object>} Issue object
   */
  async getIssue(issueId) {
    const query = `
      query GetIssue($issueId: String!) {
        issue(id: $issueId) {
          id
          identifier
          title
          description
          url
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
    `;

    const response = await this.request(query, { issueId });
    
    if (!response.data.issue) {
      throw new Error(`Issue ${issueId} not found`);
    }

    return response.data.issue;
  }

  /**
   * Create a new issue label (NOT available in MCP)
   * @param {string} teamId - Team ID
   * @param {Object} labelConfig - Label configuration
   * @param {string} labelConfig.name - Label name
   * @param {string} labelConfig.color - Label color (hex)
   * @param {string} [labelConfig.description] - Label description
   * @returns {Promise<string>} Created label ID
   */
  async createLabel(teamId, labelConfig) {
    const mutation = `
      mutation CreateLabel($teamId: String!, $name: String!, $color: String!, $description: String) {
        issueLabelCreate(input: {
          teamId: $teamId
          name: $name
          color: $color
          description: $description
        }) {
          success
          issueLabel {
            id
            name
          }
        }
      }
    `;

    const variables = {
      teamId,
      name: labelConfig.name,
      color: labelConfig.color,
      description: labelConfig.description || ''
    };

    const response = await this.request(mutation, variables);
    
    if (!response.data.issueLabelCreate.success) {
      throw new Error(`Failed to create label "${labelConfig.name}"`);
    }

    return response.data.issueLabelCreate.issueLabel.id;
  }
}