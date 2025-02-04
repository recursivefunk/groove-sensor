const env = require('good-env');

module.exports = {
  hue: {
    username: env.get('HUE_USERNAME'),
    bridgeIp: env.get('HUE_BRIDGE_IP'),
    sensorId: env.get('HUE_SENSOR_ID')
  },
  // @TODO: Consider just making these playlists
  eightiesTrackIds: [
    {
      // "Dirty Diana" - Michael Jackson
      uri: 'spotify:track:3yBlJtq86wROQpHi1goEKT',
      bestVolume: '25',
      start: 15
    },
    {
      // "Human" - The Human League
      uri: 'spotify:track:537yo062QIz16oQOgxmul3',
      bestVolume: '25'
    },
    {
      // "Everybody Wants to Rule The World" - Tears for Fears
      uri: 'spotify:track:4RvWPyQ5RL0ao9LPZeSouE',
      bestVolume: '25'
    },
    {
      // "Holding Out for a Hero" - Bonnie Tyler
      uri: 'spotify:track:5Hyr47BBGpvOfcykSCcaw9',
      bestVolume: '25'
    },
    {
      // "The Glow" - Willie Hutch
      uri: 'spotify:track:7nQ7iZ4FdjaIPEtEKvvzbc',
      bestVolume: '25'
    },
    {
      // "On Our Own" - Bobby Brown
      uri: 'spotify:track:0cAiOfc6uxr6NCyQ80ZigK',
      bestVolume: '25'
    },
    {
      // "Just Got Paid" - Johnny Kemp
      uri: 'spotify:track:1OK4hVcucqYKMU9Ipb3dtx',
      bestVolume: '25'
    },
    {
      // "Rock Steady" - The Whispers
      uri: 'spotify:track:4RRs6lOD5L1KbQ56rp61RM',
      bestVolume: '25'
    },
    {
      // "Purple Rain" - Prince
      uri: 'spotify:track:3FnP3j1TyiTwbJb5AR2ynT',
      bestVolume: '25'
    }
  ],
  jazzTrackIds: [
    {
      // "Misty" - Ella Fitzgerald
      uri: 'spotify:track:4kF394GKEnI13QdZBM9mxM',
      bestVolume: 30
    },
    {
      // "Flamenco Sketches" - Miles Davis
      uri: 'spotify:track:6dRx7OUXfvosnXG3g9lWGi',
      bestVolume: '30',
      start: 20
    },
    {
      // "You Are Too Beautiful" - Thelonious Monk
      uri: 'spotify:track:1fYal59goMHv8Uq9sfNU8k',
      bestVolume: '30'
    },
    {
      // "When Sunny Gets Blue" - McCoy Tyner
      uri: 'spotify:track:1J9iVCaEriyoMXpj2XszhU',
      bestVolume: '30'
    },
    {
      // "Stockholm Love" - Malthilda June
      uri: 'spotify:track:3tNuzvJ5z4rN7GPZoWxQdk',
      bestVolume: '25'
    },
    {
      // "Thanks, But I Don't Dance" - Rene Marie
      uri: 'spotify:track:0yrwVkQZorFkCICB4jjU3p',
      bestVolume: '25',
      start: 16
    },
    {
      // "Smooth Talking" - Nocturnal Spirits
      uri: 'spotify:track:2pQ7tvFq7DgkQnJgU2eKia',
      bestVolume: '25'
    }
  ]
};
