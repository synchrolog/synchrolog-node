var morgan = require('morgan');
var winston = require('winston');
var middleware = require('./lib/middleware');
var SynchrologTransport = require('./lib/transport');

var logger = function (app, format) {
  if (typeof format !== 'function') {
    // lookup format
    format = morgan[format] || format;
    // return compiled format
    if (typeof format !== 'function') {
      format = morgan.compile(format);
    }
  }

  var formatLine = function(tokens, req, res) {
    var result = format.apply(format, [tokens, req, res])
    var synchrologTokens = [
      `[synchrolog_timestamp:${tokens['synchrolog_timestamp'](req, res)}]`,
      `[synchrolog_anonymous_id:${tokens['synchrolog_anonymous_id'](req, res)}]`,
      `[synchrolog_user_id:${tokens['synchrolog_user_id'](req, res)}]`
    ].join(' ');
    return [ result, synchrologTokens ].join(' ');
  }

  // instantiate a new Winston Logger with the settings defined above
  var logger = winston.createLogger({
    transports: [
      new SynchrologTransport({
        apiKey: global.SYNCHROLOG_API_KEY,
        host: global.SYNCHROLOG_HOST
      })
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  logger.stream = {
    write: function(message, encoding) {
      var timestampMatch = message.match(/\[synchrolog_timestamp:(\S*)\]/);
      var timestamp = timestampMatch[1];
      message = message.replace(/\[synchrolog_timestamp:(\S*)\]/, "");

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

  app.use(middleware);
  morgan.token('synchrolog_timestamp', function () { return new Date().toISOString() });
  // if synchrolog_anonymous_id is not set, return '-' to let the logger know it's undefined
  morgan.token('synchrolog_anonymous_id', function (req) { return req.synchrolog_anonymous_id || '-' });
  // if synchrolog_user_id is not set, return '-' to let the logger know it's undefined
  morgan.token('synchrolog_user_id', function (req) { return req.synchrolog_user_id || '-' });
  app.use(morgan(formatLine, { stream: logger.stream }));
}

module.exports = logger;
