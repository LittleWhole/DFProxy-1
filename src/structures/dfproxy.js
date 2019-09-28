const fs = require('fs');
const path = require('path');
const mc = require('minecraft-protocol');
const item = require('prismarine-item')('1.13.2');
const windows = require('prismarine-windows')('1.13.2').windows;

const error = require('../utils/error.js');

class DFProxy {
  constructor (options) {
    Object.defineProperty(this, 'serverPacketEvents', { value: new Map() });
    Object.defineProperty(this, 'clientPacketEvents', { value: new Map() });

    Object.defineProperty(this, 'commands', { value: new Map() });
    Object.defineProperty(this, 'aliases', { value: new Map() });

    Object.defineProperty(this, 'email', { value: options.email });
    Object.defineProperty(this, 'password', { value: options.password });

    Object.defineProperty(this, 'Item', { value: item });

    Object.defineProperty(this, 'proxy', {
      value: mc.createServer({
        'online-mode': false,
        encryption: true,
        host: '127.0.0.1',
        port: options.port,
        version: '1.13.2',
        motd: '\u00a7eDF\u00a76Proxy \u00a71- \u00a7bVersion: \u00a731.0.0 \u00a77| \u00a75\u25b6 \u00a7dReady to connect!\u00a7r\n\u00a7cNew Update! \u00a7e/dfproxy \u00a77| \u00a7fThe secret bunker tunnel :D!',
        'max-players': 1,
        favicon: 'data:image/png;base64,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'
      }),
      writeable: true
    });

    this.proxy.on('login', client => this.clientLogin(client));
  }

  loginProxyClient () {
    this.proxyClient = mc.createClient({
      host: 'beta.mcdiamondfire.com',
      port: 25565,
      username: this.email,
      password: this.password,
      version: '1.13.2',
      dfproxy: this
    }).on('packet', (data, meta) => {
      var serverPacketEvent = this.serverPacketEvents.get(meta.name);
      if (serverPacketEvent && serverPacketEvent.run) {
        serverPacketEvent.run(meta, data, this.client, this.proxyClient, this.proxy);
        if (serverPacketEvent.canceled === true) {
          serverPacketEvent.canceled = false;
          return;
        }
      }

      this.filterPacketAndSend(data, meta, this.client);
    })
      .on('error', (err) => {
        error(err, this);
      });
  }

  test () {
    return 'hi';
  }

  clientLogin (client) {
    console.log('Player joining...');
    this.client = client;
    this.client.inventory = new windows.InventoryWindow(0, 'Inventory', 44);

    this.loginProxyClient(client);
    console.log('Player joined!');

    client.on('packet', (data, meta) => {
      console.log('CLIENT PACKET: ' + meta.name);
      if (meta.name === 'held_item_slot') {
        console.log(data);
      }

      var clientPacketEvent = this.clientPacketEvents.get(meta.name);
      if (clientPacketEvent && clientPacketEvent.run) {
        clientPacketEvent.run(meta, data, this.client, this.proxyClient, this.proxy);
        if (clientPacketEvent.canceled === true) {
          clientPacketEvent.canceled = false;
          return;
        }
      }
      this.filterPacketAndSend(data, meta, this.proxyClient);
    });
  }

  filterPacketAndSend (data, meta, dest) {
    if (meta.name !== 'keep_alive' && meta.name !== 'update_time' && meta.name !== 'encryption_begin' && meta.name !== 'compress' && meta.name !== 'success') {
      if (!dest.write) return;
      dest.write(meta.name, data);
    }
  }

  loadServerPacketsEvents (dir, cb) {
    fs.readdir(path.join(__dirname, `${dir}`), (error, packetEvents) => {
      if (error) {
        return console.log(error);
      }
      console.log(`Loading ${packetEvents.length} server packet events...`);

      packetEvents.forEach(async (packetevent, i) => {
        const start = Date.now();

        const props = new (require(path.join(__dirname, `${dir}/${packetevent}`)))(this);

        if (props.init) props.init(this);

        this.serverPacketEvents.set(props.name, props);
        console.log(`Loaded server packet event ${props.name} in ${Date.now() - start}ms (${i + 1}/${packetEvents.length}).`);
        if (i === packetEvents.length - 1) {
          cb();
        }
      });
    });
  }

  loadClientPacketsEvents (dir, cb) {
    fs.readdir(path.join(__dirname, `${dir}`), (error, packetEvents) => {
      if (error) {
        return console.log(error);
      }
      console.log(`Loading ${packetEvents.length} client packet events...`);

      packetEvents.forEach(async (packetevent, i) => {
        const start = Date.now();

        const props = new (require(path.join(__dirname, `${dir}/${packetevent}`)))(this);

        if (props.init) props.init(this);

        this.clientPacketEvents.set(props.name, props);
        console.log(`Loaded client packet event ${props.name} in ${Date.now() - start}ms (${i + 1}/${packetEvents.length}).`);
        if (i === packetEvents.length - 1) {
          cb();
        }
      });
    });
  }

  loadCommands (dir) {
    fs.readdir(path.join(__dirname, `${dir}`), (error, commands) => {
      if (error) {
        return console.log(error);
      }
      console.log(`Loading ${commands.length} commands...`);

      commands.forEach(async (command, i) => {
        const start = Date.now();

        const props = new (require(path.join(__dirname, `${dir}/${command}`)))(this);

        if (props.init) await props.init(this);

        this.commands.set(props.name, props);
        console.log(`Loaded command ${props.name} in ${Date.now() - start}ms.`);
      });
    });
  }
}
module.exports = DFProxy;
