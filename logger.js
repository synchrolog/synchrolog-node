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
      `[synchrolog_user_id:${tokens['synchrolog_user_id'](req, res)}]`,
      `[synchrolog_request_path:${tokens['synchrolog_request_path'](req, res)}]`,
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

  const timestampMatchRegex = /\[synchrolog_timestamp:(\S*)\]/;
  const anonIdRegex = /\[synchrolog_anonymous_id:(\S*)\]/;
  const userIdRegex = /\[synchrolog_user_id:(\S*)\]/;
  const reqPathRegex = /\[synchrolog_request_path:(\S*)\]/;

  logger.stream = {
    write: function(message, encoding) {
      var timestampMatch = message.match(timestampMatchRegex);
      var timestamp = timestampMatch[1];
      message = message.replace(timestampMatchRegex, "");

      var anonymousIdMatch = message.match(anonIdRegex);
      var anonymousId = anonymousIdMatch[1];
      anonymousId = anonymousId === '-' ? undefined : anonymousId;
      message = message.replace(anonIdRegex, "");

      var userIdMatch = message.match(userIdRegex);
      var userId = userIdMatch[1];
      userId = userId === '-' ? undefined : userId;
      message = message.replace(userIdRegex, "");

      var requestPathMatch = message.match(reqPathRegex);
      var requestPath = requestPathMatch[1];
      message = message.replace(reqPathRegex, "");


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
            message: message,
            request_path: requestPath,
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
  morgan.token('synchrolog_request_path', function (req) { return req.originalUrl || req.url });
  app.use(morgan(formatLine, { stream: logger.stream }));
}

module.exports = logger;
