const { Sonos } = require('sonos');
const { sonos: { deviceMappings } } = require('./config');

function init () {
  const _nodes = {
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
  let _targetDevice;

  const _instance = Object.create({
    useDevice(device) {
      _targetDevice = device;
      return this;
    },

    getDevice({ key }) {
      if (!_nodes[key]) {
        throw new Error(`Unknown device location '${key}'`);
      }

      return _nodes[key];
    },

    getKnownNodes() {
      return Object.keys(_nodes).map((key) => _nodes[key]);
    },

    async clearQueue () {
      await _targetDevice.flush();
    },

    async queueAll (tracks) {
      tracks.forEach(async ({ uri }) => {
        await _targetDevice.queue(uri);
      });
    },

    stopPlayback () {
      return _targetDevice.stop();
    },

    async playSpotifyTrack ({ uri, bestVolume, start } = { start: 0 }) {
      const device = _targetDevice;
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
