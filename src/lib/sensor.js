const EventEmitter = require('node:events');
const jsHue = require('jshue');
const { debug } = require('./log');
const hue = jsHue();

class SensorEmitter extends EventEmitter {}

async function Sensor({ bridgeIp, sensorId, username }) {
  const emitter = new SensorEmitter();
  const bridge = hue.bridge(bridgeIp);
  const user = bridge.user(username);
  const tempSensor = await user.getSensor(sensorId);
  let lastKnownState = await tempSensor.state.presence;
  let lastMotionStart = null;
  let lastMotionStop = null;

  setInterval(async () => {
    const sensor = await user.getSensor(sensorId);
    const updatedState = sensor.state.presence;

    if (updatedState !== lastKnownState) {
      debug(`State changed from ${lastKnownState} to ${updatedState}`);
      lastKnownState = updatedState;

      if (updatedState === true) {
        lastMotionStart = Date.now();
        emitter.emit('motion_start');
      } else {
        lastMotionStop = Date.now();
      }
    } else {
      debug(`lastKnownState ${lastKnownState}, same as updatedState ${updatedState}`);
      // The sensor's state reverts to not detecting presence only a few seconds after having previously
      // sensed presence. I need it more time to account for the fact that people may enter the room
      // and remain still for an extended amount of time. For instance, when pooping. Start with 30 seconds
      // and see how that works.
      if (lastMotionStop && ((Date.now() - lastMotionStop) >= 30000)) {
        debug('It has been about 30 seconds since motion has stopped turn off music');
        lastMotionStop = null;
        emitter.emit('motion_stop');
      }
    }
  }, 2000);

  return emitter;
}

module.exports = Sensor;