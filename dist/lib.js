import chalk from 'chalk';
export class SequentialThinkingServer {
    thoughtHistory = [];
    branches = {};
    disableThoughtLogging;
    constructor() {
        this.disableThoughtLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
    }
    validateThoughtData(input) {
        const data = input;
        if (!data.thought || typeof data.thought !== 'string') {
            throw new Error('Invalid thought: must be a string');
        }
        // Convert string numbers to numbers (for parameter engine compatibility)
        // Handle case where parameter engine passes extractor key names instead of values
        let thoughtNumber;
        if (typeof data.thoughtNumber === 'string') {
            // If it's an extractor key pattern, use default
            if (data.thoughtNumber.includes('::') || data.thoughtNumber.includes('.')) {
                thoughtNumber = 1; // Default for first thought
            }
            else {
                thoughtNumber = parseInt(data.thoughtNumber, 10);
            }
        }
        else {
            thoughtNumber = data.thoughtNumber;
        }
        if (!thoughtNumber || typeof thoughtNumber !== 'number' || isNaN(thoughtNumber)) {
            thoughtNumber = 1; // Fallback to default
        }
        let totalThoughts;
        if (typeof data.totalThoughts === 'string') {
            // If it's an extractor key pattern, use default
            if (data.totalThoughts.includes('::') || data.totalThoughts.includes('.')) {
                totalThoughts = 5; // Default total thoughts
            }
            else {
                totalThoughts = parseInt(data.totalThoughts, 10);
            }
        }
        else {
            totalThoughts = data.totalThoughts;
        }
        if (!totalThoughts || typeof totalThoughts !== 'number' || isNaN(totalThoughts)) {
            totalThoughts = 5; // Fallback to default
        }
        // Convert string booleans to booleans (for parameter engine compatibility)
        let nextThoughtNeeded;
        if (typeof data.nextThoughtNeeded === 'string') {
            // If it's an extractor key pattern, use default
            if (data.nextThoughtNeeded.includes('::') || data.nextThoughtNeeded.includes('.')) {
                nextThoughtNeeded = true; // Default to needing more thoughts
            }
            else {
                nextThoughtNeeded = data.nextThoughtNeeded.toLowerCase() === 'true';
            }
        }
        else {
            nextThoughtNeeded = data.nextThoughtNeeded;
        }
        if (typeof nextThoughtNeeded !== 'boolean') {
            nextThoughtNeeded = true; // Fallback to default
        }
        // Convert optional numeric fields
        let revisesThought;
        if (data.revisesThought !== undefined) {
            revisesThought = typeof data.revisesThought === 'string'
                ? parseInt(data.revisesThought, 10)
                : data.revisesThought;
            if (isNaN(revisesThought)) {
                revisesThought = undefined;
            }
        }
        let branchFromThought;
        if (data.branchFromThought !== undefined) {
            branchFromThought = typeof data.branchFromThought === 'string'
                ? parseInt(data.branchFromThought, 10)
                : data.branchFromThought;
            if (isNaN(branchFromThought)) {
                branchFromThought = undefined;
            }
        }
        // Convert optional boolean fields
        let isRevision;
        if (data.isRevision !== undefined) {
            isRevision = typeof data.isRevision === 'string'
                ? data.isRevision.toLowerCase() === 'true'
                : data.isRevision;
        }
        let needsMoreThoughts;
        if (data.needsMoreThoughts !== undefined) {
            needsMoreThoughts = typeof data.needsMoreThoughts === 'string'
                ? data.needsMoreThoughts.toLowerCase() === 'true'
                : data.needsMoreThoughts;
        }
        return {
            thought: data.thought,
            thoughtNumber,
            totalThoughts,
            nextThoughtNeeded,
            isRevision,
            revisesThought,
            branchFromThought,
            branchId: data.branchId,
            needsMoreThoughts,
        };
    }
    formatThought(thoughtData) {
        const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = thoughtData;
        let prefix = '';
        let context = '';
        if (isRevision) {
            prefix = chalk.yellow('🔄 Revision');
            context = ` (revising thought ${revisesThought})`;
        }
        else if (branchFromThought) {
            prefix = chalk.green('🌿 Branch');
            context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
        }
        else {
            prefix = chalk.blue('💭 Thought');
            context = '';
        }
        const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
        const border = '─'.repeat(Math.max(header.length, thought.length) + 4);
        return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
    }
    processThought(input) {
        try {
            const validatedInput = this.validateThoughtData(input);
            if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
                validatedInput.totalThoughts = validatedInput.thoughtNumber;
            }
            this.thoughtHistory.push(validatedInput);
            if (validatedInput.branchFromThought && validatedInput.branchId) {
                if (!this.branches[validatedInput.branchId]) {
                    this.branches[validatedInput.branchId] = [];
                }
                this.branches[validatedInput.branchId].push(validatedInput);
            }
            if (!this.disableThoughtLogging) {
                const formattedThought = this.formatThought(validatedInput);
                console.error(formattedThought);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            thoughtNumber: validatedInput.thoughtNumber,
                            totalThoughts: validatedInput.totalThoughts,
                            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
                            branches: Object.keys(this.branches),
                            thoughtHistoryLength: this.thoughtHistory.length
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                            status: 'failed'
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
}
//# sourceMappingURL=lib.js.map