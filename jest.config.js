export default {
transform: {},
moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!good-env|@inquirer/prompts|cli-table|got|jshue|sonos|terminal-image)'
  ]
}; 