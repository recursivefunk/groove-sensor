import { jest } from '@jest/globals';
import {
  buildPlayQueue,
  printNowPlaying,
  randomTrack,
  camelize
} from '../../src/lib/utils.js';

// Mock external dependencies
jest.mock('terminal-image');
jest.mock('cli-table');
jest.mock('got');

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildPlayQueue', () => {
    it('should filter out the current track from the queue', () => {
      const tracks = [
        { uri: 'spotify:track:1', title: 'Track 1' },
        { uri: 'spotify:track:2', title: 'Track 2' },
        { uri: 'spotify:track:3', title: 'Track 3' }
      ];
      const currentTrack = { uri: 'spotify:track:2', title: 'Track 2' };

      const result = buildPlayQueue({ tracks, currentTrack });

      expect(result).toHaveLength(2);
      expect(result).not.toContainEqual(currentTrack);
    });

    it('should return all tracks if current track is not in the list', () => {
      const tracks = [
        { uri: 'spotify:track:1', title: 'Track 1' },
        { uri: 'spotify:track:2', title: 'Track 2' }
      ];
      const currentTrack = { uri: 'spotify:track:3', title: 'Track 3' };

      const result = buildPlayQueue({ tracks, currentTrack });

      expect(result).toEqual(tracks);
    });

    it('should return all tracks if remaining tracks is empty', () => {
      const tracks = [{ uri: 'spotify:track:1', title: 'Track 1' }];
      const currentTrack = { uri: 'spotify:track:1', title: 'Track 1' };

      const result = buildPlayQueue({ tracks, currentTrack });

      expect(result).toEqual(tracks);
    });
  });

  describe('chooseSystemNode', () => {
    it('should return the selected node', async () => {
      const mockNode = { name: 'Test Node' };
      const mockSystem = {
        discoverNodes: jest.fn().mockResolvedValue([mockNode])
      };

      await jest.resetModules();
      // ESM-compliant mocking
      await jest.unstable_mockModule('@inquirer/prompts', () => ({
        select: jest.fn().mockResolvedValue(mockNode)
      }));

      // Dynamically import after the mock is set up
      const { chooseSystemNode } = await import('../../src/lib/utils.js');
      const result = await chooseSystemNode(mockSystem);

      expect(result).toEqual(mockNode);
    });
  });

  describe('chooseVibe', () => {
    it('should return the selected vibe', async () => {
      const mockVibe = ['track1', 'track2'];
      await jest.resetModules();
      // ESM-compliant mocking
      await jest.unstable_mockModule('@inquirer/prompts', () => ({
        select: jest.fn().mockResolvedValue(mockVibe)
      }));

      // Dynamically import after the mock is set up
      const { chooseVibe } = await import('../../src/lib/utils.js');
      const result = await chooseVibe();

      expect(result).toBe(mockVibe);
      // Optionally, check the prompt message and choices if needed
    });
  });

  describe('randomTrack', () => {
    it('should return a random track from the array', () => {
      const items = ['track1', 'track2', 'track3'];
      const result = randomTrack(items);
      expect(items).toContain(result);
    });

    it('should return undefined for empty array', () => {
      const result = randomTrack([]);
      expect(result).toBeUndefined();
    });
  });

  describe('camelize', () => {
    it('should convert string to camelCase', () => {
      expect(camelize('hello world')).toBe('helloWorld');
      expect(camelize('Hello World')).toBe('helloWorld');
      expect(camelize('hello-world')).toBe('helloWorld');
    });

    it('should handle special characters', () => {
      expect(camelize("don't stop")).toBe('dontStop');
      expect(camelize("it's working")).toBe('itsWorking');
    });

    it('should handle already camelCase strings', () => {
      expect(camelize('helloWorld')).toBe('helloWorld');
    });
  });
}); 