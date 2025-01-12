const { default: terminalImage } = require('terminal-image');
const print = require('pretty-print');
const { got } = require('got');
const Sonos = require('./lib/sonos');
const Sensor = require('./lib/sensor')
const { hue } = require('./lib/config');
const log = require('./lib/log');
const {
  buildPlayQueue,
  chooseSystemNode,
  chooseVibe,
  randomTrack,
} = require('./lib/utils');
const prettyOpts = {
  leftPadding: 3,
  rightPadding: 3,
};

(async function() {
  const sensor = await Sensor({ ...hue });
  const trackChoices = await chooseVibe();
  const track = randomTrack(trackChoices);
  const system = Sonos();
  const node = await chooseSystemNode(system);
  let nowPlaying;

  sensor.on('motion_start', async () => {
    log.debug('Motion started');
    const nowPlaying = await system.playSpotifyTrack({
      device: node.device,
      track,
    });
  });

  sensor.on('motion_stop', () => {
    log.debug('Motion stopped');
    system.stopPlayback({ device: node.device });
  });

  log.info('Listening...');
  
}());