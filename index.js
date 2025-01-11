const { default: terminalImage } = require('terminal-image');
const print = require('pretty-print');
const { got } = require('got');
const Sonos = require('./lib/sonos');
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

(async function () {
  const trackChoices = await chooseVibe();
  const track = randomTrack(trackChoices);
  const system = Sonos();
  const node = await chooseSystemNode(system);
  const nowPlaying = await system.playSpotifyTrack({
    device: node.device,
    track,
  });

  // Queue up the remaining tracks
  const remainingTracks = buildPlayQueue({ tracks: trackChoices, currentTrack: track });
  await system.queueAll({ tracks: remainingTracks, device: node.device });

  // Not sure I'm bothering to do this no one will see it but me
  const body = await got(nowPlaying.albumArtURL).buffer();
  console.log(await terminalImage.buffer(body, { width: 100 }));
  console.log('\n');
  print({
    Title: nowPlaying.title,
    Artist: nowPlaying.artist,
    Album: nowPlaying.album,
  }, prettyOpts);
  console.log('\n\n');
}());