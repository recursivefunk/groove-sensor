const sonos = require('sonos');
const Table = require('cli-table');
const jsHue = require('jshue');
const discovery = new sonos.AsyncDeviceDiscovery();
const hue = jsHue();

(async function() {
  await lsSonos();
  await lsHue();
}());

async function lsHue() {
  const bridge = hue.bridge(process.env.HUE_BRIDGE_IP);
  const system = bridge.user(process.env.HUE_USERNAME);
  const sensors = await system.getSensors();

  const sensorTableData = Object.keys(sensors)
    .map((sensorId) => ({
      sensorId,
      sensorType: sensors[sensorId].productname,
      name: sensors[sensorId].name,
    }))
    .filter(sensor => sensor.sensorType === 'Hue motion sensor')
    .map(sensor => ([
      sensor.name, sensor.sensorId
    ]));

  if (sensorTableData.length > 0) {
    console.log(`
      *****************************************************************************************     
                                        HUE MOTION SENSORS
      *****************************************************************************************\n
    `);

    const hueTable = new Table({
      head: ['Name', 'Sensor ID'],
      rows: sensorTableData,
    });

    console.log(hueTable.toString());
  } else {
    console.log(`           No Hue Motion Sensors Found\n`)
  }
}

async function lsSonos() {
  const sonosDevices = await discovery.discoverMultiple({ timeout: 5000 });

  if (sonosDevices.length > 0) {
    console.log(`
      *****************************************************************************************     
                                        SONOS DEVICES
      *****************************************************************************************\n
    `);
    const sonosTableData = await Promise.all(sonosDevices.map(async (device) => {
      const name = await device.getName();
      return [name, device.host];
    }));

    const sonosTable = new Table({
      head: ['Name', 'IP'],
      rows: sonosTableData,
    });
    console.log(sonosTable.toString());
  } else {
    console.log(`           No Sonos Devices Found\n`)
  }
}