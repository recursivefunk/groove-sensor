const EventEmitter = require('node:events');
const jsHue = require('jshue');
const { debug } = require('./log');
const hue = jsHue();

class SensorEmitter extends EventEmitter {}

/*
 * @description Detect a Hue motion sensor, poll it for chances in presence state and emit motion start or stop
 * accordingly. Return an EventEmitter which will be the channel over which the client is notifed of state changes.
 */
async function Sensor ({ bridgeIp, sensorId, username }) {
  const emitter = new SensorEmitter();
  const bridge = hue.bridge(bridgeIp);
  const user = bridge.user(username);
  const tempSensor = await user.getSensor(sensorId);
  let lastKnownState = await tempSensor.state.presence;
  let lastMotionStop = null;

  // Every two seconds, check for presence state change and emit start or stop. If there's no change, do nothing.
  setInterval(async () => {
    const sensor = await user.getSensor(sensorId);
    const updatedState = sensor.state.presence;

    if (updatedState !== lastKnownState) {
      lastKnownState = updatedState;

      if (updatedState === true) {
        debug('Motion detected. Emit motion start.');
        emitter.emit('motion_start');
      } else {
        lastMotionStop = Date.now();
      }
    } else {
      // The sensor's state reverts to not detecting presence only a few seconds after no motion is detected.
      // I need it more time to account for the fact that people may enter the room and remain still for an
      // extended amount of time. For instance, when pooping. Start with 90 seconds and see how that works.
      if (lastMotionStop && ((Date.now() - lastMotionStop) >= 90000)) {
        debug('It has been about 90 seconds since motion has stopped. Emit motion stop.');
        lastMotionStop = null;
        emitter.emit('motion_stop');
      }
    }
  }, 2000);

  return emitter;
}

module.exports = Sensor;
