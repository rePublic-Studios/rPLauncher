const { Client } = require('discord-rpc');
const log = require('electron-log');

let client;
let activity;

const initialAppStartup = Math.floor(Date.now() / 1000);

const defaultValue = {
  details: 'Idling in rPLauncher',
  startTimestamp: initialAppStartup,
  largeImageKey: 'default_big',
  largeImageText: 'rPLauncher - A Custom Minecraft Launcher',
  buttons: [
    { label: 'Join Discord', url: 'https://discord.gg/FFw9vYMQA6' },
    {
      label: 'Github',
      url: 'https://github.com/rePublic-Studios/rPLauncher'
    }
  ]
};

exports.initRPC = () => {
  exports.shutdownRPC();
  client = new Client({ transport: 'ipc' });

  activity = defaultValue;

  client.on('ready', () => {
    log.log('Discord RPC Connected');
    client.setActivity(activity);
  });

  client.login({ clientId: '865132231684915200' }).catch(error => {
    if (error.message.includes('ENOENT')) {
      log.error('Unable to initialize Discord RPC, no client detected.');
    } else {
      log.error('Unable to initialize Discord RPC:', error);
    }
  });
};

exports.update = details => {
  activity = {
    ...activity,
    startTimestamp: Math.floor(Date.now() / 1000),
    details: `Playing ${details}`
  };
  client.setActivity(activity);
};

exports.reset = () => {
  activity = defaultValue;
  activity.startTimestamp = initialAppStartup;
  client.setActivity(activity);
};

exports.shutdownRPC = () => {
  if (!client) return;
  client.clearActivity();
  client.destroy();
  client = null;
  activity = null;
};
