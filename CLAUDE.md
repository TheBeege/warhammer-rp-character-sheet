# Claude Development Notes

This file contains lessons learned during autonomous agent development to avoid repeating mistakes.

## Testing and Debugging Patterns

### Always Get Full Error Details First
**Mistake**: Initially only logged HTTP status codes (e.g., "400 Bad Request")
**Fix**: Always capture and log the full error response body
```javascript
// Good
const errorText = await response.text();
throw new Error(`API error: ${response.status} - ${errorText}`);

// Bad
throw new Error(`API error: ${response.status}`);
```

### Test Environment Cleanup
**Mistake**: Forgot that git branches persist between test runs, causing "branch already exists" errors
**Fix**: Always clean up test artifacts before retesting
```bash
# Before testing again
git checkout main
git branch -D feature/test-branch-name
```

### API Authentication Variations
**Mistake**: Assumed all APIs use "Bearer" tokens
**Learning**: Each API has different auth patterns:
- Linear API: Direct key in Authorization header (no "Bearer")
- Claude API: Uses "x-api-key" header
- Always check API docs for exact auth format

### Environment Variable Loading
**Mistake**: Assumed environment variables would load automatically
**Fix**: Implement manual .env loading without dependencies
```javascript
// Manual .env parsing to avoid adding dependencies
loadEnvFile() {
  const envContent = readFileSync('.env', 'utf8');
  // Parse and set process.env values
}
```

## Billing and Access Patterns

### Claude Max vs API Access
**Learning**: Claude Max subscription ($100/month) ≠ API access
- Max Plan: Web interface + Claude Code CLI
- API Access: Separate billing, pay-per-token
- Don't assume subscription includes programmatic access

### Cost-Conscious Development
**Pattern**: Always consider token usage when building autonomous systems
- Reduce frequency (30min → 2hr saves 4x cost)
- Process one issue at a time vs. batch processing
- Use mock data for testing to avoid API costs

## Code Organization Lessons

### Keep Dependencies Minimal
**Decision**: Manual .env parsing instead of dotenv library
**Reasoning**: Project goal is zero dependencies for main app
**Note**: Document decisions to avoid later confusion

### Error-First Development
**Pattern**: When integrating new APIs:
1. Implement detailed error logging first
2. Test with intentionally wrong data to see error formats
3. Then implement happy path
4. This reveals API quirks early

## Git Workflow for Autonomous Agents

### Branch Management
**Pattern**: Autonomous agents should handle branch conflicts gracefully
```javascript
// Check if branch exists before creating
try {
  execSync(`git checkout -b "${branchName}"`);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Skip or handle existing branch
    return null;
  }
  throw error;
}
```

## API Integration Patterns

### Always Start with Mock Data
**Pattern**: Build the workflow with mock data first
```javascript
if (!this.apiKey) {
  this.log('Using mock data for testing');
  return MOCK_ISSUES;
}
```
This lets you test the entire flow before debugging API specifics.

### GraphQL Schema Validation
**Learning**: Don't assume GraphQL schema structure
- `priority` was Float!, not object with `name`
- Always check actual schema or use introspection
- Test queries in GraphQL playground first

## Architecture Decisions

### MCP vs Direct API
**Decision**: Use direct API calls for GitHub Actions
**Reasoning**: MCP servers tied to local machine, won't work in CI/CD
**Note**: Different environments need different integration approaches

### State Management
**Pattern**: Track processed items to avoid duplicates
```javascript
// Always check state before processing
if (this.state.processedIssues.includes(issue.id)) {
  return; // Skip already processed
}
```

## Future Improvement Areas

1. **Graceful Branch Handling**: Handle existing branches better
2. **Incremental Processing**: Resume interrupted workflows
3. **Cost Monitoring**: Track API usage and warn when approaching limits
4. **Error Recovery**: Retry failed operations with backoff
5. **Testing Framework**: Automated tests for the autonomous system

## Key Reminders

- **Test with real APIs early** - Don't assume mock data behavior matches reality
- **Clean up between tests** - Git state, branches, temporary files
- **Read error messages completely** - They usually tell you exactly what's wrong
- **Document unusual decisions** - Like manual .env parsing, helps future debugging
- **Verify assumptions about billing/access** - Subscriptions ≠ API access

## Session-Specific Behavioral Issues (July 2025)

### Don't Claim Success Prematurely
**Issue**: Claiming things are "fully functional" without completing tests
**Fix**: Only declare success after verification steps are complete
**Example**: "The agent system is ready for testing" vs "The agent system is fully functional"

### Stay Focused on Actual Goals
**Issue**: Getting distracted from the primary objective
**Example**: When goal was to test Linear status updates, got sidetracked by implementation details
**Fix**: Always refer back to the specific task requested

### Remember File Locations and Project Structure
**Issue**: Not maintaining awareness of where files are located
**Fix**: Keep file tree structure in context, use search tools when uncertain
**Example**: Looking for `CLAUDE_DEVELOPMENT_NOTES.md` in root when it was in `agents/`

### Always Check Current Branch Before Making Assumptions
**Issue**: Making changes on wrong branch, then being confused why they don't appear on main
**Fix**: Always verify current branch with `git status` or `git branch` before analyzing files
**Example**: Made prompt changes on feature branch but expected them on main

### Follow Through on Commitments
**Issue**: Said we would update prompts with Linear integration, but changes were lost
**Fix**: Verify changes are actually persisted where expected before moving on

### Don't Make Claims About What "We" Did
**Issue**: Saying "we updated the prompt" when user didn't participate
**Fix**: Be accurate about who did what work

---

*Note: These notes are for Claude's reference to avoid repeating the same debugging cycles and mistakes.*