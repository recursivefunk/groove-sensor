const { default: terminalImage } = require('terminal-image');
const Table = require('cli-table');
const { got } = require('got');
const { select } = require('@inquirer/prompts');
const {
  eightiesTrackIds,
  jazzTrackIds
} = require('./config');
/*
 * @description Builds a queue of tracks to play by just returning the current moodlist exluding the current track
 */
function buildPlayQueue ({ tracks, currentTrack }) {
  const remainingTracks = tracks.filter((t) => t.uri !== currentTrack.uri);

  if (remainingTracks.length === 0) {
    return tracks;
  }

  return remainingTracks;
}

/*
 * @description Prompt the user to choose which device to setup the playback
 */
async function chooseSystemNode (system) {
  const discoveredNodes = await system.discoverNodes();
  const choices = discoveredNodes
    .map((node) => ({
      name: node.name,
      value: node,
      checked: false
    }));

  const choice = await select({
    message: 'Where do you want to set the mood?',
    choices
  });

  return choice;
}

/*
 * @description Prompt the user to choose a "vibe". It's basically just one of the track lists configured in config.json.
 * To find the spotify URI:
 *  1. Go to spotify
 *  2. Find the track you wish to add
 *  3. Right click on the track
 *  4. Choose 'Share > Copy Song Link' and the track ID will be embedded in the link. Be sure to format it correctly when you paste it in the config
 */
async function chooseVibe () {
  const choice = await select({
    message: 'Aw yea! What type of mood would you like to set?',
    choices: [
      { name: 'Jazzy', value: jazzTrackIds, checked: false },
      { name: '80s', value: eightiesTrackIds, checked: false }
    ]
  });

  return choice;
}

async function printNowPlaying ({ title, artist, album, albumArtURL }) {
  const body = await got(albumArtURL).buffer();
  console.log(await terminalImage.buffer(body, { width: 100 }));
  console.log('\n\n');
  console.log(
    new Table({
      head: ['Title', 'Artist', 'Album'],
      rows: [
        [title, artist, album]
      ]
    }).toString()
  );
  console.log('\n\n');
}

function randomTrack (items) {
  return items[Math.floor(Math.random() * items.length)];
}

const camelize = (str) => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  })
    .replace(/\s+/g, '')
    .replace(/'/g, '')
    .replace(/’/g, '');
};

module.exports = {
  buildPlayQueue,
  camelize,
  chooseSystemNode,
  chooseVibe,
  printNowPlaying,
  randomTrack
};
