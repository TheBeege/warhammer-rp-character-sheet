# Multi-Agent Development System

This directory contains a simple multi-agent system for collaborative development, inspired by the workflow described in [John Rush's article](https://www.john-rush.com/posts/ai-20250701.html).

## Core Concept

Instead of having one AI do everything, we use specialized agents for different roles:

- **Planner**: Breaks down complex tasks into detailed implementation plans
- **Senior Developer**: Handles complex implementations and architectural decisions  
- **Developer**: Implements straightforward features following existing patterns
- **Verifier**: Ensures implementations meet requirements and quality standards

## Key Philosophy: "Fix Inputs, Not Outputs"

Rather than manually fixing generated code, we improve the prompts and plans that generate the code. This creates reusable, compound knowledge.

## Quick Start

1. **Learn about agents:**
   ```bash
   npm run agents:explain
   ```

2. **Create a workflow for your task:**
   ```bash
   npm run agents:workflow "Implement editable table cells"
   ```

3. **Create specific agent tasks:**
   ```bash
   npm run agent:plan "Create detailed plan for WAR-11 editable table"
   npm run agent:senior "Implement complex table architecture"
   npm run agent:develop "Add simple form inputs to cells"
   npm run agent:verify "Verify editable table meets all requirements"
   ```

## How It Works

1. The system generates specialized prompts for each agent
2. Each prompt includes the agent's role, capabilities, and specific task
3. You copy the generated prompt and use it with Claude Code
4. The agent stays "in character" and focuses on their expertise

## File Structure

```
agents/
├── config/
│   └── agents.json          # Agent configurations and capabilities
├── prompts/
│   ├── planner_prompt.md    # Specialized prompt for planning
│   ├── senior_dev_prompt.md # Complex implementation prompts
│   ├── developer_prompt.md  # Simple implementation prompts
│   └── verifier_prompt.md   # Quality verification prompts
├── scripts/
│   └── simple-agent.js      # Main agent system
└── logs/                    # Generated tasks and interactions
```

## Example Workflow

1. **Planning Phase**: Use planner to create detailed implementation plan
2. **Implementation Phase**: Use senior developer for complex parts, regular developer for simple parts
3. **Verification Phase**: Use verifier to ensure everything meets requirements

Each phase builds on the previous one, creating a compound knowledge system that improves over time.

## Credits

This implementation is based on concepts from [John Rush's article on AI-driven development](https://www.john-rush.com/posts/ai-20250701.html). Please read the original article for deeper insights into the methodology.