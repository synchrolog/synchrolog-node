const axios = require('axios');

var errorMiddleware = function (err, req, res, next) {
  var errorLog = {
    event_type: 'error',
    timestamp: new Date().toISOString(),
    anonymous_id: req.synchrolog_anonymous_id,
    user_id: req.synchrolog_user_id,
    source: 'backend',
    api_key: global.SYNCHROLOG_API_KEY,
    error: {
      status: (err.status || 500).toString(),
      description: err.message,
      backtrace: err.stack.split("\n"),
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    }
  }

  axios.post(`${global.SYNCHROLOG_HOST}/v1/track-backend-error`, errorLog, {
    headers: {
      'Authorization': `Basic ${global.SYNCHROLOG_API_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  .catch((error) => {
    console.log('[kvjbrvbkjeb]');
    console.error(error.message)
  });

  next(err);
}

module.exports = errorMiddleware;