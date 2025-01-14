const process = require('node:process');
const { isIP } = require('net');
const env = require('good-env');
const Sonos = require('./lib/sonos');
const Sensor = require('./lib/sensor');
const { hue } = require('./lib/config');
const log = require('./lib/log');
const {
  buildPlayQueue,
  chooseSystemNode,
  chooseVibe,
  printNowPlaying,
  randomTrack
} = require('./lib/utils');
const ipOk = str => isIP(str) === 4 || isIP(str) === 6;

// Ensure all the required environemnt variables are present
env.assert(
  { 'HUE_BRIDGE_IP': { type: 'string', ok: ipOk }},
  'HUE_USERNAME',
  'HUE_SENSOR_ID',
);

(async function () {
  const trackChoices = await chooseVibe();
  const track = randomTrack(trackChoices);
  const system = Sonos();
  const node = await chooseSystemNode(system);
  const sensor = new Sensor({ ...hue });
  let nowPlaying;
  let isPlaying = false;

  system.useDevice(node.device);

  // When we sense motion, if the current device isn't already playing, start playing the randomly chosen
  // track and print the album info in the terminal. Then take the remaining tracks and add them to the
  // queue.
  await sensor
    .on('motion_start', async () => {
      log.debug('Motion started');
      if (!isPlaying) {
        nowPlaying = await system.playSpotifyTrack(track);
        printNowPlaying(nowPlaying);
        isPlaying = true;
        // Queue up the remaining tracks
        const remainingTracks = buildPlayQueue({ tracks: trackChoices, currentTrack: track });
        await system.queueAll(remainingTracks);
      }
    })
    // When there has been no motion for 90-ish seconds, stop playback
    .on('motion_stop', async () => {
      log.debug('Motion stopped');
      await system.stopPlayback();
      await system.clearQueue();
      isPlaying = false;
    })
    .on('error', err => {
      log.error(err);
      process.exit(1);
    })
    // Start listening for motion
    .monitor();

  process.on('exit', async () => {
    await system.stopPlayback();
  });

  log.info('Listening...');
}());
