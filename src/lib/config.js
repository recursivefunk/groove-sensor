const env = require('good-env');

module.exports = {
  sonos: {
    deviceMappings: {
      office: env.get('SONOS_OFFICE_IP'),
      greatRoom: env.get('SONOS_GREAT_ROOM_IP'),
      portable: env.get('SONOS_PORTABLE_IP'),
    },
  },
  hue: {
    username: env.get('HUE_USERNAME'),
    bridgeIp: env.get('HUE_BRIDGE_IP'),
    sensorId: env.get('HUE_SENSOR_ID'),
  },
  // @TODO: Consider just making these playlists
  eightiesTrackIds: [
    {
      // "Human" - The Human League
      uri: 'spotify:track:537yo062QIz16oQOgxmul3',
      bestVolume: '25',
    },
    {
      // "Everybody Wants to Rule The World" - Tears for Fears
      uri: 'spotify:track:4RvWPyQ5RL0ao9LPZeSouE',
      bestVolume: '25',
    },
    {
      // "Holding Out for a Hero" - Bonnie Tyler
      uri: 'spotify:track:5Hyr47BBGpvOfcykSCcaw9',
      bestVolume: '25',
    },
    {
      // "The Glow" - Willie Hutch
      uri: 'spotify:track:7nQ7iZ4FdjaIPEtEKvvzbc',
      bestVolume: '25',
    },
    {
      // "On Our Own" - Bobby Brown
      uri: 'spotify:track:0cAiOfc6uxr6NCyQ80ZigK',
      bestVolume: '25',
    }
  ],
  jazzTrackIds: [
    {
      // "Smooth Talking" - Nocturnal Spirits
      uri: 'spotify:track:2pQ7tvFq7DgkQnJgU2eKia',
      bestVolume: '25',
    },
  ]
}