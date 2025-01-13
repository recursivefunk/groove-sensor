const { Sonos, AsyncDeviceDiscovery } = require('sonos');
const env = require('good-env');
const log = require('./log');
const { camelize } = require('./utils');
const discovery = new AsyncDeviceDiscovery();
const sonosDiscoveryTimeout = env.num('SONOS_DISCOVERY_TIMEOUT', 5) * 1000;

function init () {
  let _nodes = {};
  let _targetDevice;

  const _instance = Object.create({
    /*
     * @description Use the spedified device for all playback operations. I was going to make this support
     * multiple devices simultaneously, but it doesn't look like Sonos exposes the grouping functionality
     * within their API
     */
    useDevice (device) {
      _targetDevice = device;
      return this;
    },

    /*
     * @description Grab the device node associated with the given key. This is the key used in the config.json
     */
    getDevice ({ key }) {
      if (!_nodes[key]) {
        throw new Error(`Unknown device location '${key}'`);
      }

      return _nodes[key];
    },

    /*
     * @description Grab all the device nodes we know about. Not to be confused with all the device nodes _Sonos_ knows
     * about (on the network). This will just be the node devices configured in config.js
     */
    getKnownNodes () {
      if (Object.keys(_nodes).length === 0) log.debug('No nodes.');
      return Object.keys(_nodes).map((key) => _nodes[key]);
    },

    async discoverNodes () {
      log.info('\n---------- Hold tight, finding your Sonos devices... -------------\n');
      const sonosDevices = await discovery.discoverMultiple({ timeout: sonosDiscoveryTimeout });
      const nodesArr = await Promise.all(sonosDevices.map(async (device) => {
        const name = await device.getName();
        return {
          name,
          device: new Sonos(device.host),
          ip: device.host
        };
      }));

      _nodes = nodesArr.reduce((accum, item) => {
        const key = camelize(item.name);
        accum[key] = item;
        return accum;
      }, {});

      return nodesArr;
    },

    /*
     * @description Clear all pending tracks from the play queue
     */
    async clearQueue () {
      await _targetDevice.flush();
    },

    /*
     * @description Add all the specified tracks to the now playing queue such that when one song ends, the other starts
     * automatically
     */
    async queueAll (tracks) {
      tracks.forEach(async ({ uri }) => {
        await _targetDevice.queue(uri);
      });
    },

    /*
     * @description Stop the current device from playing
     */
    stopPlayback () {
      return _targetDevice.stop();
    },

    /*
     * @description Have the current device play the specified track from the Spotify library
     */
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
