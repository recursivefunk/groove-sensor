const process = require('node:process');
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

(async function () {
  const trackChoices = await chooseVibe();
  const track = randomTrack(trackChoices);
  const system = Sonos();
  const node = await chooseSystemNode(system);
  const sensor = await Sensor({ ...hue });
  let nowPlaying;
  let isPlaying = false;

  system.useDevice(node.device);

  sensor.on('motion_start', async () => {
    log.debug('Motion started');
    if (!isPlaying) {
      nowPlaying = await system.playSpotifyTrack(track);
      printNowPlaying(nowPlaying);
      isPlaying = true;
      // Queue up the remaining tracks
      const remainingTracks = buildPlayQueue({ tracks: trackChoices, currentTrack: track });
      await system.queueAll(remainingTracks);
    }
  });

  sensor.on('motion_stop', async () => {
    log.debug('Motion stopped');
    await system.stopPlayback();
    await system.clearQueue();
    isPlaying = false;
  });

  process.on('exit', async () => {
    await system.stopPlayback();
  });

  log.info('Listening...');
}());
