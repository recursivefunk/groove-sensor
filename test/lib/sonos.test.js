import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Create a mock Sonos device class that extends EventEmitter
class MockSonosDevice extends EventEmitter {
  constructor() {
    super();
    this.host = '192.168.1.100';
    this.flush = jest.fn().mockResolvedValue();
    this.queue = jest.fn().mockResolvedValue();
    this.stop = jest.fn().mockResolvedValue();
    this.play = jest.fn().mockResolvedValue();
    this.setVolume = jest.fn().mockResolvedValue();
    this.getVolume = jest.fn().mockResolvedValue(20);
    this.getName = jest.fn().mockResolvedValue('Living Room');
    this.seek = jest.fn().mockResolvedValue();
    this.currentTrack = jest.fn().mockResolvedValue({
      title: 'Test Track',
      artist: 'Test Artist',
      album: 'Test Album'
    });
  }
}

// Mock device instance to be used across tests
const mockDeviceInstance = new MockSonosDevice();

// Mock discovery instance
const mockDiscoveryInstance = {
  discoverMultiple: jest.fn().mockResolvedValue([{
    host: '192.168.1.100',
    getName: () => Promise.resolve('Living Room')
  }])
};

// Mock Sonos dependencies
jest.mock('sonos', () => {
  const mockAsyncDeviceDiscovery = jest.fn().mockImplementation(() => mockDiscoveryInstance);
  mockAsyncDeviceDiscovery.discoverMultiple = jest.fn().mockResolvedValue([{
    host: '192.168.1.100',
    getName: () => Promise.resolve('Living Room')
  }]);
  
  return {
    AsyncDeviceDiscovery: mockAsyncDeviceDiscovery,
    Sonos: jest.fn().mockImplementation(() => mockDeviceInstance)
  };
});

// Mock other dependencies
jest.mock('good-env', () => ({
  num: jest.fn().mockImplementation((key, defaultValue) => defaultValue)
}));

jest.mock('../../src/lib/log.js', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

jest.mock('../../src/lib/utils.js', () => ({
  camelize: jest.fn().mockImplementation((str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
      .replace(/\s+/g, '')
      .replace(/'/g, '')
      .replace(/'/g, '');
  })
}));

// Import after mocks
import { AsyncDeviceDiscovery, Sonos } from 'sonos';
import env from 'good-env';
import log from '../../src/lib/log.js';
import { camelize } from '../../src/lib/utils.js';

let SonosSystem;
let sonosInstance;

describe('sonos.js', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    ({ default: SonosSystem } = await import('../../src/lib/sonos.js'));
    sonosInstance = SonosSystem();
  });

  describe('useDevice', () => {
    it('should set the target device', async () => {
      sonosInstance.useDevice(mockDeviceInstance);
      await sonosInstance.clearQueue();
      expect(mockDeviceInstance.flush).toHaveBeenCalled();
    });
  });

  describe('getDevice', () => {
    beforeEach(async () => {
      await sonosInstance.discoverNodes();
      // Debug: print known nodes after discovery
      // eslint-disable-next-line no-console
      console.log('Known nodes after discovery:', sonosInstance.getKnownNodes());
    });

    it('should return device for valid key', async () => {
      // Debug: print keys in _nodes
      // eslint-disable-next-line no-console
      console.log('Device for key livingRoom:', sonosInstance.getDevice({ key: 'livingRoom' }));
      const device = sonosInstance.getDevice({ key: 'livingRoom' });
      expect(device).toBeDefined();
      expect(device.name).toBe('Living Room');
    });

    it('should throw error for invalid key', () => {
      expect(() => sonosInstance.getDevice({ key: 'invalid' }))
        .toThrow('Unknown device location');
    });
  });

  describe('getKnownNodes', () => {
    it('should return empty array when no nodes', () => {
      expect(sonosInstance.getKnownNodes()).toEqual([]);
    });

    it('should return array of nodes after discovery', async () => {
      await sonosInstance.discoverNodes();
      const nodes = sonosInstance.getKnownNodes();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].name).toBe('Living Room');
    });
  });

  describe('discoverNodes', () => {
    it('should discover and map Sonos devices', async () => {
      const nodes = await sonosInstance.discoverNodes();
      expect(mockDiscoveryInstance.discoverMultiple).toHaveBeenCalled();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].name).toBe('Living Room');
      expect(nodes[0].ip).toBe('192.168.1.100');
    });
  });

  describe('clearQueue', () => {
    beforeEach(() => {
      sonosInstance.useDevice(mockDeviceInstance);
    });

    it('should flush the target device queue', async () => {
      await sonosInstance.clearQueue();
      expect(mockDeviceInstance.flush).toHaveBeenCalled();
    });
  });

  describe('queueAll', () => {
    beforeEach(() => {
      sonosInstance.useDevice(mockDeviceInstance);
    });

    it('should queue all tracks on the target device', async () => {
      const tracks = [
        { uri: 'track1' },
        { uri: 'track2' }
      ];
      await sonosInstance.queueAll(tracks);
      expect(mockDeviceInstance.queue).toHaveBeenCalledTimes(2);
      expect(mockDeviceInstance.queue).toHaveBeenCalledWith('track1');
      expect(mockDeviceInstance.queue).toHaveBeenCalledWith('track2');
    });
  });

  describe('stopPlayback', () => {
    beforeEach(() => {
      sonosInstance.useDevice(mockDeviceInstance);
    });

    it('should stop the target device', async () => {
      await sonosInstance.stopPlayback();
      expect(mockDeviceInstance.stop).toHaveBeenCalled();
    });
  });

  describe('playSpotifyTrack', () => {
    beforeEach(() => {
      sonosInstance.useDevice(mockDeviceInstance);
    });

    it('should play track with default volume', async () => {
      await sonosInstance.playSpotifyTrack({ uri: 'spotify:track:123' });
      expect(mockDeviceInstance.setVolume).toHaveBeenCalledWith('20');
      expect(mockDeviceInstance.play).toHaveBeenCalledWith('spotify:track:123');
      expect(mockDeviceInstance.seek).not.toHaveBeenCalled();
    });

    it('should play track with custom volume and start time', async () => {
      await sonosInstance.playSpotifyTrack({
        uri: 'spotify:track:123',
        bestVolume: '30',
        start: 30
      });
      expect(mockDeviceInstance.setVolume).toHaveBeenCalledWith('30');
      expect(mockDeviceInstance.play).toHaveBeenCalledWith('spotify:track:123');
      expect(mockDeviceInstance.seek).toHaveBeenCalledWith(30);
    });

    it('should handle errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockDeviceInstance.setVolume.mockRejectedValueOnce(new Error('Test error'));

      await sonosInstance.playSpotifyTrack({ uri: 'spotify:track:123' });
      expect(consoleError).toHaveBeenCalled();
      expect(mockDeviceInstance.currentTrack).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
