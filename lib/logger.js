var winston = require('winston');
var SynchrologTransport = require('./transport');

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
  transports: [
    new SynchrologTransport({
      apiKey: 'u2on0lra3m0ksnco9uop5wk7td809hbr',
      host: 'http://127.0.0.1:8080'
    })
  ],
  exitOnError: false, // do not exit on handled exceptions
});

logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    var timestampMatch = message.match(/\[timestamp:(\S*)\]/);
    var timestamp = timestampMatch[1];
    message = message.replace(/\[timestamp:(\S*)\]/, "");

    var anonymousIdMatch = message.match(/\[synchrolog_anonymous_id:(\S*)\]/);
    var anonymousId = anonymousIdMatch[1];
    anonymousId = anonymousId === '-' ? undefined : anonymousId;
    message = message.replace(/\[synchrolog_anonymous_id:(\S*)\]/, "");

    var userIdMatch = message.match(/\[synchrolog_user_id:(\S*)\]/);
    var userId = userIdMatch[1];
    userId = userId === '-' ? undefined : userId;
    message = message.replace(/\[synchrolog_user_id:(\S*)\]/, "");

    message = message.trim();
    logger.info({
      log: {
        event_type: 'log',
        timestamp: timestamp,
        anonymous_id: anonymousId,
        user_id: userId,
        source: 'backend',
        log: {
          timestamp: timestamp,
          message: message
        }
      }
    });
  }
};

module.exports = logger;