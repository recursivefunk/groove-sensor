import EventEmitter from 'node:events';
import env from 'good-env';
import jsHue from 'jshue';
import log from './log.js';

const { debug } = log;
const hue = jsHue();
const hueMotionStopBuff = env.num('HUE_MOTION_STOP_BUFFER', 90) * 1000;
const hueMotionPollingInterval = env.num('HUE_MOTION_POLLING_INTERVAL', 2) * 1000;

/*
 * @description Detect a Hue motion sensor, poll it for chances in presence state and emit motion start or stop
 * accordingly. Return an EventEmitter which will be the channel over which the client is notifed of state changes.
 */
export default class Sensor extends EventEmitter {
  constructor ({ bridgeIp, sensorId, username }) {
    super();
    EventEmitter.call(this);
    this._sensorId = sensorId;
    this._bridgeIp = bridgeIp;
    this._username = username;
    this._bridge = hue.bridge(this._bridgeIp);
    this._user = this._bridge.user(this._username);
    this._lastKnownState = null;
    this._lastMotionStop = null;
  }

  async monitor () {
    const tempSensor = await this._user.getSensor(this._sensorId);
    this._lastKnownState = await tempSensor.state.presence;

    setInterval(async () => {
      let sensor;
      try {
        sensor = await this._user.getSensor(this._sensorId);
      } catch (err) {
        this.emit('error', err);
      }
      const updatedState = sensor.state.presence;

      if (updatedState !== this._lastKnownState) {
        this._lastKnownState = updatedState;

        if (updatedState === true) {
          debug('Motion detected. Emit motion start.');
          this.emit('motion_start');
        } else {
          this._lastMotionStop = Date.now();
        }
      } else {
        // The sensor's state reverts to not detecting presence only a few seconds after no motion is detected.
        // I need it more time to account for the fact that people may enter the room and remain still for an
        // extended amount of time and we don't want music to stop. For instance, when pooping.
        // Start with 90 seconds and see how that works.
        if (this._lastMotionStop && ((Date.now() - this._lastMotionStop) >= hueMotionStopBuff)) {
          debug('It has been about 90 seconds since motion has stopped. Emit motion stop.');
          this._lastMotionStop = null;
          this.emit('motion_stop');
        }
      }
    }, hueMotionPollingInterval);
    return this;
  }
}
