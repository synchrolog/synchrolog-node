var config = function (apiKey, opts = {}) {
  global.SYNCHROLOG_API_KEY = apiKey;
  global.SYNCHROLOG_HOST = opts['host'] || 'https://input.synchrolog.com';
}

module.exports = config;