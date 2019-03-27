const Transport = require('winston-transport');
const util = require('util');
const url = require('url');
const axios = require('axios');
const https = require('https');
//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
var host, apiKey, axiosInstance;
module.exports = class SynchrologTransport extends Transport {
  constructor(opts) {
    super(opts);
    host = opts['host'];
    apiKey = opts['apiKey'];

    axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    var logRecord = info.message.log;
    logRecord['api_key'] = apiKey;
    logRecord['log']['type'] = info.level;

    var synchrologUrl = url.parse(`${host}/v1/track-backend`);
    axiosInstance.post(`${host}/v1/track-backend`, logRecord, {
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    .catch((error) => {
      console.error(error.message)
    });

    callback();
  }
};