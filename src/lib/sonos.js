const { Sonos } = require('sonos');
const { sonos: { deviceMappings }} = require('./config');


function init() {
  const nodes = {
    office: {
      name: 'Office',
      device: new Sonos(deviceMappings.office),
      ip: deviceMappings.office,
    },
    greatRoom: {
      name: 'Great Room',
      device: new Sonos(deviceMappings.greatRoom),
      ip: deviceMappings.greatRoom,
    },
    portable: {
      name: 'Portable',
      device: new Sonos(deviceMappings.portable),
      ip: deviceMappings.portable,
    }
  };

  const _instance = Object.create({
    /* These three methods can be consolidated */
    getOffice() {
      if (!nodes.office) {
        throw new Error('Unknown device location \'office\'');
      }

      return nodes.office;
    },

    getGreatRoom() {
      if (!nodes.greatRoom) {
        throw new Error('Unknown device location \'greatRoom\'');
      }

      return nodes.greatRoom;
    },

    getPortable() {
      if (!nodes.portable) {
        throw new Error('Unknown device location \'portabel\'');
      }

      return nodes.portable;
    },

    async clearQueue(device) {
      await device.flush();
    },

    async queueAll({ device, tracks }) {
      tracks.forEach(async ({ uri }) => {
        await device.queue(uri);
      });
    },

    continuePlayback({ device }) {
      return device.play();
    },

    stopPlayback({ device }) {
      return device.stop();
    },

    async playSpotifyTrack({ device, track: { uri, bestVolume } }) {
      if (!device) {
        throw new Error('Unknown device location %j', location);
      }

      try {
        await device.setVolume(bestVolume || '20');
        await device.play(uri);
      } catch (e) {
        console.error(e);
      }

      return device.currentTrack();
    }
  });

  return _instance;
}

module.exports = init;