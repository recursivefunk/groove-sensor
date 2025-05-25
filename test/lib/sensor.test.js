import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Mock good-env
jest.mock('good-env', () => ({
  num: jest.fn().mockImplementation((key, defaultValue) => {
    if (key === 'HUE_MOTION_STOP_BUFFER') return 90;
    if (key === 'HUE_MOTION_POLLING_INTERVAL') return 2;
    return defaultValue;
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

jest.mock('jshue', () => ({
  bridge: mockBridge
}));

// Mock log
jest.mock('../../src/lib/log.js', () => ({
  debug: jest.fn()
}));

// Import after mocks
import env from 'good-env';
import jsHue from 'jshue';
import log from '../../src/lib/log.js';
import Sensor from '../../src/lib/sensor.js';

describe.skip('sensor.js', () => {
  let sensor;
  const mockConfig = {
    bridgeIp: '192.168.1.100',
    sensorId: '123',
    username: 'testuser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    sensor = new Sensor(mockConfig);
  });

  afterEach(() => {
    jest.useRealTimers();
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
      expect(mockBridge).toHaveBeenCalledWith('192.168.1.100');
      expect(mockUser).toHaveBeenCalledWith('testuser');
    });
  });

  describe('monitor', () => {
    it('should start monitoring the sensor', async () => {
      const monitorPromise = sensor.monitor();
      expect(sensor._lastKnownState).toBe(false);
      await monitorPromise;
      expect(mockGetSensor).toHaveBeenCalledWith('123');
    });

    it('should emit motion_start when presence changes to true', async () => {
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
      jest.advanceTimersByTime(2000); // Advance past polling interval

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
      jest.advanceTimersByTime(2000); // Advance past polling interval
      jest.advanceTimersByTime(90000); // Advance past buffer period

      expect(motionStopSpy).toHaveBeenCalled();
    });

    it('should emit error when sensor polling fails', async () => {
      const errorSpy = jest.fn();
      sensor.on('error', errorSpy);

      mockGetSensor.mockRejectedValueOnce(new Error('Test error'));

      await sensor.monitor();
      jest.advanceTimersByTime(2000); // Advance past polling interval

      expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 