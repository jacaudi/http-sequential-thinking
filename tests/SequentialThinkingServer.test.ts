// Mock chalk to avoid ESM issues in tests
jest.mock('chalk', () => {
  const mockChalk = {
    yellow: (str: string) => str,
    green: (str: string) => str,
    blue: (str: string) => str,
  };
  return {
    default: mockChalk,
    __esModule: true,
  };
});

import { SequentialThinkingServer } from '../src/SequentialThinkingServer';

describe('SequentialThinkingServer', () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  describe('processThought', () => {
    it('should process a valid thought', () => {
      const validThought = {
        thought: 'This is a test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const result = server.processThought(validThought);

      if (result.isError) {
        console.log('Error result:', result.content[0].text);
      }
      expect(result.isError).toBe(false);
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const response = JSON.parse(result.content[0].text);
      expect(response.thoughtNumber).toBe(1);
      expect(response.totalThoughts).toBe(3);
      expect(response.nextThoughtNeeded).toBe(true);
      expect(response.thoughtHistoryLength).toBe(1);
    });

    it('should handle multiple thoughts and track history', () => {
      const thought1 = {
        thought: 'First thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const thought2 = {
        thought: 'Second thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false
      };

      const result1 = server.processThought(thought1);
      const result2 = server.processThought(thought2);

      expect(result1.isError).toBe(false);
      expect(result2.isError).toBe(false);

      const response2 = JSON.parse(result2.content[0].text);
      expect(response2.thoughtHistoryLength).toBe(2);
    });

    it('should handle revision thoughts', () => {
      const originalThought = {
        thought: 'Original thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const revisionThought = {
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
        isRevision: true,
        revisesThought: 1
      };

      server.processThought(originalThought);
      const result = server.processThought(revisionThought);

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.thoughtHistoryLength).toBe(2);
    });

    it('should handle branching thoughts', () => {
      const originalThought = {
        thought: 'Original thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const branchThought = {
        thought: 'Branch thought',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: 'branch-1'
      };

      server.processThought(originalThought);
      const result = server.processThought(branchThought);

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.branches).toContain('branch-1');
    });

    it('should auto-adjust totalThoughts when thoughtNumber exceeds it', () => {
      const thought = {
        thought: 'Thought that exceeds total',
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: false
      };

      const result = server.processThought(thought);

      expect(result.isError).toBe(false);
      const response = JSON.parse(result.content[0].text);
      expect(response.totalThoughts).toBe(5);
    });

    it('should return error for invalid thought (missing thought text)', () => {
      const invalidThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(invalidThought);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid thought: must be a string');
    });

    it('should return error for invalid thought number', () => {
      const invalidThought = {
        thought: 'Valid thought',
        thoughtNumber: 'not a number',
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(invalidThought);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid thoughtNumber: must be a number');
    });

    it('should return error for invalid total thoughts', () => {
      const invalidThought = {
        thought: 'Valid thought',
        thoughtNumber: 1,
        totalThoughts: 'not a number',
        nextThoughtNeeded: false
      };

      const result = server.processThought(invalidThought);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid totalThoughts: must be a number');
    });

    it('should return error for invalid nextThoughtNeeded', () => {
      const invalidThought = {
        thought: 'Valid thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: 'not a boolean'
      };

      const result = server.processThought(invalidThought);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid nextThoughtNeeded: must be a boolean');
    });
  });
});