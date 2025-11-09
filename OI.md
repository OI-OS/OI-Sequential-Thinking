# OI-Sequential-Thinking MCP Server - OI OS Installation Guide

This guide provides comprehensive installation instructions for AI agents installing the OI-Sequential-Thinking MCP server in OI OS (Brain Trust 4) environments.

## Table of Contents

1. [AI Agent Quick Installation](#ai-agent-quick-installation)
2. [Prerequisites](#prerequisites)
3. [Full Installation Steps](#full-installation-steps)
4. [Connecting to OI OS](#connecting-to-oi-os)
5. [Creating Intent Mappings](#creating-intent-mappings)
6. [Creating Parameter Rules](#creating-parameter-rules)
7. [Parameter Extractors](#parameter-extractors)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)
10. [Tool Reference](#tool-reference)

---

## AI Agent Quick Installation

**⚠️ For AI Agents: Use Direct Calls for Reliability**

AI agents should prefer **direct `brain-trust4 call` commands** over natural language queries for maximum reliability. Natural language commands can timeout or have parameter extraction issues. Direct calls bypass intent mapping and parameter extraction, providing consistent results.

**Example:**
```bash
# ✅ RECOMMENDED for AI agents: Direct call
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{"thought": "Analyzing the problem...", "thoughtNumber": 1, "totalThoughts": 5, "nextThoughtNeeded": true}'

# ⚠️ FALLBACK: Natural language (may timeout or fail parameter extraction)
./oi "sequential thinking analyze the problem"
```

For AI agents using OI OS, execute the following commands:

```bash
# 1. Install the server
./oi install https://github.com/OI-OS/OI-Sequential-Thinking.git

# 2. Build the project
cd MCP-servers/OI-Sequential-Thinking
npm install
npm run build

# 3. Connect the server to OI OS
cd ../../
./brain-trust4 connect OI-Sequential-Thinking node -- "$(pwd)/MCP-servers/OI-Sequential-Thinking/dist/index.js"

# 4. Create intent mappings, parameter rules, and reminder message
sqlite3 brain-trust4.db << 'SQL'
BEGIN TRANSACTION;

-- Intent mappings for OI-Sequential-Thinking
INSERT OR REPLACE INTO intent_mappings (keyword, server_name, tool_name, priority) VALUES
('sequential thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think sequentially', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('step by step thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('sequential thought', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think step by step', 'OI-Sequential-Thinking', 'sequentialthinking', 10);

-- Parameter rule for sequentialthinking
INSERT OR REPLACE INTO parameter_rules (server_name, tool_name, tool_signature, required_fields, field_generators, patterns) VALUES
('OI-Sequential-Thinking', 'sequentialthinking', 'OI-Sequential-Thinking::sequentialthinking', 
 '["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]',
 '{"thought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thought"}, "nextThoughtNeeded": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.nextThoughtNeeded"}, "thoughtNumber": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thoughtNumber"}, "totalThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.totalThoughts"}, "isRevision": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.isRevision"}, "revisesThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.revisesThought"}, "branchFromThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchFromThought"}, "branchId": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchId"}, "needsMoreThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.needsMoreThoughts"}}',
 '[]');

-- Add reminder message for AI agents (IMPORTANT: This is a three-step process!)
UPDATE mcp_servers SET reminder_message = 'AI INSTRUCTIONS - This is a three step process. Make sure you do all three steps!' WHERE name = 'OI-Sequential-Thinking';

COMMIT;
SQL

# 5. Parameter extractors are already in parameter_extractors.toml.default
# See "Parameter Extractors" section for complete list

# 6. Verify installation
./oi list | grep OI-Sequential-Thinking
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{"thought": "Test thought", "thoughtNumber": 1, "totalThoughts": 3, "nextThoughtNeeded": true}'
```

---

## Prerequisites

- **Node.js 18+** - Required for running the MCP server
- **OI OS / Brain Trust 4** - The OI OS platform
- **TypeScript** - For building (installed as dev dependency)

---

## Full Installation Steps

### Step 1: Install the Server

```bash
# From your OI OS project root
./oi install https://github.com/OI-OS/OI-Sequential-Thinking.git
```

**Note:** The `oi install` command will clone the repository and install npm dependencies, but may fail at the connection step. This is normal - proceed with manual connection.

### Step 2: Build the Project

```bash
cd MCP-servers/OI-Sequential-Thinking
npm install
npm run build
```

**Note:** If the build fails due to TypeScript configuration issues, the `tsconfig.json` may need to be updated (it should not extend a parent config that doesn't exist).

### Step 3: Verify Installation

```bash
cd MCP-servers/OI-Sequential-Thinking
ls -la dist/index.js
# Ensure the built file exists
```

---

## Connecting to OI OS

### Step 1: Connect the Server

From your OI OS project root:

```bash
./brain-trust4 connect OI-Sequential-Thinking node -- "$(pwd)/MCP-servers/OI-Sequential-Thinking/dist/index.js"
```

### Step 2: Verify Connection

```bash
./oi list
# Should show "OI-Sequential-Thinking" in the server list

./oi status OI-Sequential-Thinking
# Should show server status and capabilities

# Test with direct call (most reliable method)
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{"thought": "Initial analysis", "thoughtNumber": 1, "totalThoughts": 5, "nextThoughtNeeded": true}'
```

---

## Creating Intent Mappings

**⚠️ IMPORTANT: This is a three-step process. Make sure you complete all three steps!**

1. Create intent mappings
2. Create parameter rules
3. Add reminder message to mcp_servers table

Intent mappings allow OI OS to route natural language queries to Sequential Thinking tools. The mappings are created in the `brain-trust4.db` database.

**SQL to create intent mappings (Step 1 of 3):**

```sql
INSERT OR REPLACE INTO intent_mappings (keyword, server_name, tool_name, priority) VALUES
('sequential thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think sequentially', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('step by step thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('sequential thought', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think step by step', 'OI-Sequential-Thinking', 'sequentialthinking', 10);
```

**Usage examples:**
```bash
./oi "sequential thinking analyze this problem"
./oi "think step by step about the solution"
```

---

## Creating Parameter Rules

Parameter rules define required fields and extraction patterns for each tool. These are created in the `brain-trust4.db` database.

**SQL to create parameter rules (Step 2 of 3):**

```sql
INSERT OR REPLACE INTO parameter_rules (server_name, tool_name, tool_signature, required_fields, field_generators, patterns) VALUES
('OI-Sequential-Thinking', 'sequentialthinking', 'OI-Sequential-Thinking::sequentialthinking', 
 '["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]',
 '{"thought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thought"}, "nextThoughtNeeded": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.nextThoughtNeeded"}, "thoughtNumber": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thoughtNumber"}, "totalThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.totalThoughts"}, "isRevision": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.isRevision"}, "revisesThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.revisesThought"}, "branchFromThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchFromThought"}, "branchId": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchId"}, "needsMoreThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.needsMoreThoughts"}}',
 '[]');
```

**Required fields:**
- `thought` (string): The current thinking step
- `nextThoughtNeeded` (boolean): Whether another thought step is needed
- `thoughtNumber` (integer): Current thought number (minimum: 1)
- `totalThoughts` (integer): Estimated total thoughts needed (minimum: 1)

**Optional fields:**
- `isRevision` (boolean): Whether this revises previous thinking
- `revisesThought` (integer): Which thought is being reconsidered
- `branchFromThought` (integer): Branching point thought number
- `branchId` (string): Branch identifier
- `needsMoreThoughts` (boolean): If more thoughts are needed

**⚠️ IMPORTANT: After creating intent mappings and parameter rules, you MUST complete Step 3: Add the reminder message to the mcp_servers table.**

---

## Adding Reminder Message (Step 3 of 3)

**⚠️ CRITICAL: This is the third and final step. Do not skip this!**

After creating intent mappings and parameter rules, you must add a reminder message to the `mcp_servers` table. This reminder helps AI agents remember that this is a three-step process.

**SQL to add reminder message:**

```sql
UPDATE mcp_servers SET reminder_message = 'AI INSTRUCTIONS - This is a three step process. Make sure you do all three steps!' WHERE name = 'OI-Sequential-Thinking';
```

**Complete three-step SQL (all steps in one transaction):**

```sql
BEGIN TRANSACTION;

-- Step 1: Intent mappings
INSERT OR REPLACE INTO intent_mappings (keyword, server_name, tool_name, priority) VALUES
('sequential thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think sequentially', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('step by step thinking', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('sequential thought', 'OI-Sequential-Thinking', 'sequentialthinking', 10),
('think step by step', 'OI-Sequential-Thinking', 'sequentialthinking', 10);

-- Step 2: Parameter rules
INSERT OR REPLACE INTO parameter_rules (server_name, tool_name, tool_signature, required_fields, field_generators, patterns) VALUES
('OI-Sequential-Thinking', 'sequentialthinking', 'OI-Sequential-Thinking::sequentialthinking', 
 '["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]',
 '{"thought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thought"}, "nextThoughtNeeded": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.nextThoughtNeeded"}, "thoughtNumber": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.thoughtNumber"}, "totalThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.totalThoughts"}, "isRevision": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.isRevision"}, "revisesThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.revisesThought"}, "branchFromThought": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchFromThought"}, "branchId": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.branchId"}, "needsMoreThoughts": {"FromQuery": "OI-Sequential-Thinking::sequentialthinking.needsMoreThoughts"}}',
 '[]');

-- Step 3: Reminder message (REQUIRED - do not skip!)
UPDATE mcp_servers SET reminder_message = 'AI INSTRUCTIONS - This is a three step process. Make sure you do all three steps!' WHERE name = 'OI-Sequential-Thinking';

COMMIT;
```

---

## Parameter Extractors

Parameter extractors parse natural language queries to extract values for tool parameters. These are configured in `parameter_extractors.toml.default`.

**All extractors for OI-Sequential-Thinking:**

```toml
# OI-SEQUENTIAL-THINKING
"OI-Sequential-Thinking::sequentialthinking.thought" = "template:{{query}}"
"OI-Sequential-Thinking::sequentialthinking.nextThoughtNeeded" = "conditional:if_contains:more,continue,next,another,keep going|then:default:true|else:default:false"
"OI-Sequential-Thinking::sequentialthinking.thoughtNumber" = "conditional:if_matches:\\d+|then:regex:\\b(\\d+)\\b|else:default:1"
"OI-Sequential-Thinking::sequentialthinking.totalThoughts" = "conditional:if_matches:\\d+|then:regex:(?:total|need|estimate|planning)\\s+(\\d+)|else:default:5"
"OI-Sequential-Thinking::sequentialthinking.isRevision" = "conditional:if_contains:revise,revision,reconsider,change,update,correct|then:default:true|else:default:false"
"OI-Sequential-Thinking::sequentialthinking.revisesThought" = "conditional:if_matches:thought\\s+(\\d+)|then:regex:thought\\s+(\\d+)|else:regex:\\b(\\d+)\\b"
"OI-Sequential-Thinking::sequentialthinking.branchFromThought" = "conditional:if_matches:branch|then:regex:branch(?:ing)?\\s+(?:from|at)?\\s*thought\\s+(\\d+)|else:default:null"
"OI-Sequential-Thinking::sequentialthinking.branchId" = "regex:branch(?:\\s+id)?[\\s:]+([A-Za-z0-9_-]+)"
"OI-Sequential-Thinking::sequentialthinking.needsMoreThoughts" = "conditional:if_contains:more thoughts,need more,add more,extend|then:default:true|else:default:false"
```

**Note:** These extractors are pre-configured in `parameter_extractors.toml.default`. No additional configuration is needed.

---

## Verification & Testing

### Test 1: Check Server Connection

```bash
./oi status OI-Sequential-Thinking
```

Should show:
- Server status: Connected
- Tools: 1
- Resources: 0
- Prompts: 0

### Test 2: Direct Tool Call

```bash
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "First, I need to understand the problem domain",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}'
```

### Test 3: Natural Language Query

```bash
./oi "sequential thinking analyze this problem step by step"
```

### Test 4: Multi-Step Thinking Process

```bash
# Step 1
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Breaking down the problem into components",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}'

# Step 2
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Analyzing each component in detail",
  "thoughtNumber": 2,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}'

# Step 3 (final)
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Synthesizing findings into a solution",
  "thoughtNumber": 3,
  "totalThoughts": 3,
  "nextThoughtNeeded": false
}'
```

---

## Troubleshooting

### Server Won't Connect

**Error:** "Server closed connection" or "Initialization failed"

**Solutions:**
1. Verify `dist/index.js` exists: `ls -la MCP-servers/OI-Sequential-Thinking/dist/index.js`
2. Check Node.js is installed: `node --version` (should be 18+)
3. Rebuild the project: `cd MCP-servers/OI-Sequential-Thinking && npm run build`
4. Restart server connection: `./brain-trust4 connect OI-Sequential-Thinking node -- "$(pwd)/MCP-servers/OI-Sequential-Thinking/dist/index.js"`

### Build Fails

**Error:** TypeScript compilation errors

**Solutions:**
1. Check `tsconfig.json` doesn't extend a non-existent parent config
2. Ensure TypeScript is installed: `npm install`
3. Try building manually: `npx tsc`
4. Check for syntax errors in source files

### Tools Not Available

**Error:** "Tool not found" or tools list is empty

**Solutions:**
1. Verify server connection: `./oi status OI-Sequential-Thinking`
2. Restart server connection: `./brain-trust4 connect OI-Sequential-Thinking node -- "$(pwd)/MCP-servers/OI-Sequential-Thinking/dist/index.js"`
3. Check server logs for errors

### Parameter Extraction Fails

**Error:** Natural language queries don't extract parameters correctly

**Status:** ✅ **FIXED** - The server now handles parameter engine limitations gracefully.

**Solution:** The server automatically:
- Detects when extractor key patterns are passed instead of values
- Uses sensible defaults (thoughtNumber: 1, totalThoughts: 5, nextThoughtNeeded: true)
- Converts string numbers/booleans to proper types
- Falls back to defaults if values are invalid

**Natural language queries now work:**
```bash
./oi "sequential thinking about how to optimize database queries"
./oi "think step by step about improving code performance"
```

**For explicit control, use direct calls:**
```bash
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Your thinking here",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}'
```
3. Verify intent mappings exist: `sqlite3 brain-trust4.db "SELECT * FROM intent_mappings WHERE server_name = 'OI-Sequential-Thinking';"`

---

## Tool Reference

### sequentialthinking

A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve.

**When to use:**
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

**Key features:**
- Adjust `totalThoughts` up or down as you progress
- Question or revise previous thoughts
- Add more thoughts even after reaching what seemed like the end
- Express uncertainty and explore alternative approaches
- Not every thought needs to build linearly - you can branch or backtrack
- Generates a solution hypothesis
- Verifies the hypothesis based on the Chain of Thought steps
- Repeats the process until satisfied
- Provides a correct answer

**Required Parameters:**
- `thought` (string): Your current thinking step
- `nextThoughtNeeded` (boolean): Whether another thought step is needed
- `thoughtNumber` (integer): Current thought number (minimum: 1)
- `totalThoughts` (integer): Estimated total thoughts needed (minimum: 1)

**Optional Parameters:**
- `isRevision` (boolean): Whether this revises previous thinking
- `revisesThought` (integer): Which thought is being reconsidered
- `branchFromThought` (integer): Branching point thought number
- `branchId` (string): Branch identifier
- `needsMoreThoughts` (boolean): If more thoughts are needed

**Example Usage:**

```bash
# Simple sequential thinking
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "First, I need to understand the requirements",
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "nextThoughtNeeded": true
}'

# With revision
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Actually, I need to reconsider my approach from thought 2",
  "thoughtNumber": 3,
  "totalThoughts": 4,
  "nextThoughtNeeded": true,
  "isRevision": true,
  "revisesThought": 2
}'

# With branching
./brain-trust4 call OI-Sequential-Thinking sequentialthinking '{
  "thought": "Exploring an alternative approach",
  "thoughtNumber": 4,
  "totalThoughts": 5,
  "nextThoughtNeeded": true,
  "branchFromThought": 2,
  "branchId": "alt-approach-1"
}'
```

---

## Additional Resources

- **GitHub Repository:** https://github.com/OI-OS/OI-Sequential-Thinking
- **MCP Protocol:** https://modelcontextprotocol.io
- **OI OS Documentation:** See main OI OS documentation

---

## License

This MCP server is licensed under the MIT License.

