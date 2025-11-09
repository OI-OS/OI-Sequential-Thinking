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
export declare class SequentialThinkingServer {
    private thoughtHistory;
    private branches;
    private disableThoughtLogging;
    constructor();
    private validateThoughtData;
    private formatThought;
    processThought(input: unknown): {
        content: Array<{
            type: string;
            text: string;
        }>;
        isError?: boolean;
    };
}
//# sourceMappingURL=lib.d.ts.map