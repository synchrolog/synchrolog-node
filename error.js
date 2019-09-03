const fs = require('fs');
const axios = require('axios');

var errorMiddleware = function (err, req, res, next) {
  try {
    let errorLine = err.stack.split("\n")[1];
    let errorContent = errorLine.substring(errorLine.indexOf("/")).split(":");
    let filePath = errorContent[0];
    let lineNumber = parseInt(errorContent[1]);
    var file = fs.readFileSync(filePath, { "encoding": "utf8"});
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
        backtrace: err.stack,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        file_name: filePath,
        file: file,
        line_number: lineNumber
      }
    }

    axios.post(`${global.SYNCHROLOG_HOST}/v1/track-backend-error`, errorLog, {
      headers: {
        'Authorization': `Basic ${global.SYNCHROLOG_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }).catch((error) => {
      console.error(error.message);
    });
  } catch(error) {
    console.error(error.message);
  }
  next(err);
}

module.exports = errorMiddleware;
