# Project Architecture

This repository has a dual architecture with different technology stacks for different purposes:

## Main Application (`./docs/`)
**Technology Stack: Pure Vanilla JavaScript**
- **NO TypeScript** - This is intentional and must be maintained
- **NO Build Process** - Direct browser execution
- **NO Dependencies** - Zero npm packages in the main app
- **NO Frameworks** - Pure vanilla JS, HTML, CSS

### Why Vanilla JavaScript?
The main Warhammer RPG character sheet is designed to be:
- Simple and lightweight
- Directly executable in any browser
- Free from build complexity
- Independent of npm ecosystem changes
- Easy to understand and modify

**IMPORTANT: Do not introduce TypeScript, build tools, or dependencies to the main application.**

## Autonomous Agents (`./agents/`)
**Technology Stack: TypeScript + Node.js**
- **TypeScript** - For type safety in complex orchestration logic
- **Build Process** - TSC compilation for agent scripts
- **Dependencies** - Claude Code SDK and other automation tools
- **Modern Node.js** - ES modules, async/await, latest APIs

### Why TypeScript for Agents?
The autonomous agent system requires:
- Complex API integrations (Linear, GitHub, Claude)
- Type safety for configuration objects
- Modern async patterns
- Integration with typed SDKs

## Directory Structure
```
├── docs/           # Main app - VANILLA JS ONLY
│   ├── *.html
│   ├── *.css
│   └── *.mjs       # ES modules, but pure JavaScript
├── agents/         # Autonomous agents - TypeScript OK
│   ├── src/        # TypeScript source files
│   ├── dist/       # Compiled JavaScript
│   └── config/     # Agent configurations
└── .github/        # CI/CD workflows
```

## Development Guidelines

### For Main App (`./docs/`)
- Use pure JavaScript ES modules (.mjs)
- No build step required
- Test directly in browser
- Keep zero dependencies

### For Agents (`./agents/`)
- Use TypeScript for new agent code
- Compile with `npm run build:agents`
- Use modern Node.js features
- Add dependencies as needed for automation

## Deployment
- **Main App**: Static files served directly (no build)
- **Agents**: Compiled TypeScript runs in GitHub Actions

This architecture allows the main application to remain simple and buildless while enabling sophisticated automation through modern tooling in the agent system.