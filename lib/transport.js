const Transport = require('winston-transport');
const axios = require('axios');
//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
var host, apiKey;
module.exports = class SynchrologTransport extends Transport {
  constructor(opts) {
    super(opts);
    host = opts['host'];
    apiKey = opts['apiKey'];
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    var logRecord = info.message.log;
    logRecord['api_key'] = apiKey;
    logRecord['log']['type'] = info.level;

    axios.post(`${host}/v1/track-backend`, logRecord, {
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