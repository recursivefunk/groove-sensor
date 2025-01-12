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

    if (!isPlaying) {
      nowPlaying = await system.playSpotifyTrack({
        device: node.device,
        track
      });
      printNowPlaying(nowPlaying);
      isPlaying = true;
      // Queue up the remaining tracks
      const remainingTracks = buildPlayQueue({ tracks: trackChoices, currentTrack: track });
      await system.queueAll({ tracks: remainingTracks, device: node.device });
    }
/*
  sensor.on('motion_start', async () => {
    log.debug('Motion started');
    if (!isPlaying) {
      nowPlaying = await system.playSpotifyTrack({
        device: node.device,
        track
      });
      printNowPlaying(nowPlaying);
      isPlaying = true;
      // Queue up the remaining tracks
      const remainingTracks = buildPlayQueue({ tracks: trackChoices, currentTrack: track });
      await system.queueAll({ tracks: remainingTracks, device: node.device });
    }
  });

  sensor.on('motion_stop', async () => {
    log.debug('Motion stopped');
    await system.stopPlayback(node.device);
    await system.clearQueue(node.device);
    isPlaying = false;
  });
*/
  process.on('beforeExit', async () => {
    await system.stopPlayback(node.device);
  });

  log.info('Listening...');
}());