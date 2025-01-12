const { Sonos } = require('sonos');
const { sonos: { deviceMappings } } = require('./config');

function init () {
  const nodes = {
    office: {
      name: 'Office',
      device: new Sonos(deviceMappings.office),
      ip: deviceMappings.office
    },
    greatRoom: {
      name: 'Great Room',
      device: new Sonos(deviceMappings.greatRoom),
      ip: deviceMappings.greatRoom
    },
    portable: {
      name: 'Portable',
      device: new Sonos(deviceMappings.portable),
      ip: deviceMappings.portable
    }
  };

  const _instance = Object.create({
    getDevice({ key }) {
      if (!nodes[key]) {
        throw new Error(`Unknown device location '${key}'`);
      }

      return nodes[key];
    },

    getKnownNodes() {
      return Object.keys(nodes).map((key) => nodes[key]);
    },

    async clearQueue (device) {
      await device.flush();
    },

    async queueAll ({ device, tracks }) {
      tracks.forEach(async ({ uri }) => {
        await device.queue(uri);
      });
    },

    stopPlayback (device) {
      return device.stop();
    },

    async playSpotifyTrack ({ device, track: { uri, bestVolume, start } } = { start: 0 }) {
      try {
        await device.setVolume(bestVolume || '20');
        await device.play(uri);
        if (start > 0) {
          await device.seek(start);
        }
      } catch (e) {
        console.error(e);
      }

      return device.currentTrack();
    }
  });

  return _instance;
}

module.exports = init;
