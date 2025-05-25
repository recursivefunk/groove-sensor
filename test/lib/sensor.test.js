import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Mock good-env
jest.mock('good-env', () => ({
  num: jest.fn().mockImplementation((key, defaultValue) => {
    if (key === 'HUE_MOTION_STOP_BUFFER') return 90;
    if (key === 'HUE_MOTION_POLLING_INTERVAL') return 2;
    return defaultValue;
  }),
  get: jest.fn().mockImplementation((key) => {
    if (key === 'NODE_ENV') return 'TEST';
    return undefined;
  })
}));

// Mock jshue
const mockGetSensor = jest.fn().mockResolvedValue({
  state: { presence: false }
});

const mockUser = jest.fn().mockReturnValue({
  getSensor: mockGetSensor
});

const mockBridge = jest.fn().mockReturnValue({
  user: mockUser
});

const mockBridgeFn = jest.fn().mockReturnValue({
  user: mockUser
});

jest.mock('jshue', () => {
  return jest.fn().mockReturnValue({
    bridge: mockBridgeFn
  });
});

// Mock log
jest.mock('../../src/lib/log.js', () => ({
  debug: jest.fn()
}));

// Import after mocks
import env from 'good-env';
import jsHue from 'jshue';
import log from '../../src/lib/log.js';

describe('sensor.js', () => {
  let sensor;
  let Sensor;
  const mockConfig = {
    bridgeIp: '192.168.1.100',
    sensorId: '123',
    username: 'testuser'
  };
  
  // Synchronous setInterval mock for testing
  function createManualInterval() {
    let callback;
    return {
      setInterval: (fn, interval) => {
        callback = fn;
        return 1;
      },
      tick: async () => {
        if (callback) await callback();
      }
    };
  }

  let manualInterval;

  // Helper to flush all pending promises
  async function flushPromises() {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
      await new Promise(r => setImmediate(r));
    }
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    Sensor = (await import('../../src/lib/sensor.js')).default;
    manualInterval = createManualInterval();
    sensor = new Sensor({ ...mockConfig, setIntervalFn: manualInterval.setInterval });
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(sensor._sensorId).toBe('123');
      expect(sensor._bridgeIp).toBe('192.168.1.100');
      expect(sensor._username).toBe('testuser');
      expect(sensor._lastKnownState).toBeNull();
      expect(sensor._lastMotionStop).toBeNull();
    });

    it('should set up bridge and user correctly', () => {
      expect(mockBridgeFn).toHaveBeenCalledWith('192.168.1.100');
      expect(mockUser).toHaveBeenCalledWith('testuser');
    });
  });

  describe('monitor', () => {
    it('should start monitoring the sensor', async () => {
      const monitorPromise = sensor.monitor();
      await monitorPromise;
      expect(sensor._lastKnownState).toBe(false);
      expect(mockGetSensor).toHaveBeenCalledWith('123');
    });

    it('should emit motion_start when presence changes to true', async () => {
      jest.setTimeout(10000);
      const motionStartSpy = jest.fn();
      sensor.on('motion_start', motionStartSpy);

      // First call returns false
      mockGetSensor.mockResolvedValueOnce({
        state: { presence: false }
      });

      // Second call returns true
      mockGetSensor.mockResolvedValueOnce({
        state: { presence: true }
      });

      await sensor.monitor();
      await manualInterval.tick();
      await flushPromises();
      expect(motionStartSpy).toHaveBeenCalled();
    });

    it('should emit motion_stop after buffer period when presence changes to false', async () => {
      const motionStopSpy = jest.fn();
      sensor.on('motion_stop', motionStopSpy);

      // First call returns true
      mockGetSensor.mockResolvedValueOnce({
        state: { presence: true }
      });

      // Second call returns false
      mockGetSensor.mockResolvedValueOnce({
        state: { presence: false }
      });

      await sensor.monitor();
      await manualInterval.tick(); // First interval: presence changes to false
      // Simulate time passage for buffer
      sensor._lastMotionStop = Date.now() - 90000;
      await manualInterval.tick(); // Second interval: should emit motion_stop
      await flushPromises();
      expect(motionStopSpy).toHaveBeenCalled();
    });

    it('should emit error when sensor polling fails', async () => {
      const errorSpy = jest.fn();
      sensor.on('error', errorSpy);

      mockGetSensor.mockResolvedValueOnce({
        state: { presence: false }
      });
      mockGetSensor.mockRejectedValueOnce(new Error('Test error'));

      await sensor.monitor();
      await manualInterval.tick();
      await flushPromises();
      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 