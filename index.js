const log = require('./log');
const Sensor = require('./sensor');
const env = require('good-env');


(async function() {
  const [
    HUE_USERNAME,
    HUE_BRIDGE_IP,
    HUE_SENSOR_ID,
  ] = env.getAll([
    'HUE_USERNAME',
    'HUE_BRIDGE_IP',
    'HUE_SENSOR_ID',
  ]);
  const sensor = await Sensor({
    sensorId: HUE_SENSOR_ID,
    bridgeIp: HUE_BRIDGE_IP,
    username: HUE_USERNAME,
  });

  sensor.on('motion_start', () => {
    log.debug('Motion started');
  });

  sensor.on('motion_stop', () => {
    log.debug('Motion stopped');
  });

  log.info('Listening...');
}());