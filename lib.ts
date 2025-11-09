import chalk from 'chalk';

export interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

export class SequentialThinkingServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private disableThoughtLogging: boolean;

  constructor() {
    this.disableThoughtLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
  }

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }

    // Convert string numbers to numbers (for parameter engine compatibility)
    // Handle case where parameter engine passes extractor key names instead of values
    let thoughtNumber: number;
    if (typeof data.thoughtNumber === 'string') {
      // If it's an extractor key pattern, use default
      if (data.thoughtNumber.includes('::') || data.thoughtNumber.includes('.')) {
        thoughtNumber = 1; // Default for first thought
      } else {
        thoughtNumber = parseInt(data.thoughtNumber, 10);
      }
    } else {
      thoughtNumber = data.thoughtNumber as number;
    }
    if (!thoughtNumber || typeof thoughtNumber !== 'number' || isNaN(thoughtNumber)) {
      thoughtNumber = 1; // Fallback to default
    }

    let totalThoughts: number;
    if (typeof data.totalThoughts === 'string') {
      // If it's an extractor key pattern, use default
      if (data.totalThoughts.includes('::') || data.totalThoughts.includes('.')) {
        totalThoughts = 5; // Default total thoughts
      } else {
        totalThoughts = parseInt(data.totalThoughts, 10);
      }
    } else {
      totalThoughts = data.totalThoughts as number;
    }
    if (!totalThoughts || typeof totalThoughts !== 'number' || isNaN(totalThoughts)) {
      totalThoughts = 5; // Fallback to default
    }

    // Convert string booleans to booleans (for parameter engine compatibility)
    let nextThoughtNeeded: boolean;
    if (typeof data.nextThoughtNeeded === 'string') {
      // If it's an extractor key pattern, use default
      if (data.nextThoughtNeeded.includes('::') || data.nextThoughtNeeded.includes('.')) {
        nextThoughtNeeded = true; // Default to needing more thoughts
      } else {
        nextThoughtNeeded = data.nextThoughtNeeded.toLowerCase() === 'true';
      }
    } else {
      nextThoughtNeeded = data.nextThoughtNeeded as boolean;
    }
    if (typeof nextThoughtNeeded !== 'boolean') {
      nextThoughtNeeded = true; // Fallback to default
    }

    // Convert optional numeric fields
    let revisesThought: number | undefined;
    if (data.revisesThought !== undefined) {
      revisesThought = typeof data.revisesThought === 'string'
        ? parseInt(data.revisesThought, 10)
        : data.revisesThought as number;
      if (isNaN(revisesThought)) {
        revisesThought = undefined;
      }
    }

    let branchFromThought: number | undefined;
    if (data.branchFromThought !== undefined) {
      branchFromThought = typeof data.branchFromThought === 'string'
        ? parseInt(data.branchFromThought, 10)
        : data.branchFromThought as number;
      if (isNaN(branchFromThought)) {
        branchFromThought = undefined;
      }
    }

    // Convert optional boolean fields
    let isRevision: boolean | undefined;
    if (data.isRevision !== undefined) {
      isRevision = typeof data.isRevision === 'string'
        ? data.isRevision.toLowerCase() === 'true'
        : data.isRevision as boolean;
    }

    let needsMoreThoughts: boolean | undefined;
    if (data.needsMoreThoughts !== undefined) {
      needsMoreThoughts = typeof data.needsMoreThoughts === 'string'
        ? data.needsMoreThoughts.toLowerCase() === 'true'
        : data.needsMoreThoughts as boolean;
    }

    return {
      thought: data.thought,
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts,
    };
  }

  private formatThought(thoughtData: ThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = chalk.yellow('🔄 Revision');
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.green('🌿 Branch');
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
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

  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
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
    } catch (error) {
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
