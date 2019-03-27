const uuidv4 = require('uuid/v4');

var middleware = function (req, res, next) {
  if (req.originalUrl === '/synchrolog-time') {
    res.send({ time: new Date().toISOString() });
  } else {
    var cookies = deserializeCookies(req.headers.cookie);
    if (cookies['synchrolog_anonymous_id']) {
      req.synchrolog_anonymous_id = cookies['synchrolog_anonymous_id'];
      req.synchrolog_user_id = cookies['synchrolog_user_id'];
      next();
    } else {
      var anonymousId = uuidv4();
      req.synchrolog_anonymous_id = anonymousId;
      req.synchrolog_user_id = cookies['synchrolog_user_id'];
      res.cookie('synchrolog_anonymous_id', anonymousId);
      next();
    }
  }
}

function deserializeCookies(rawCookies) {
  var cookies = {};
  var cookieList = rawCookies ? rawCookies.split('; ') : [];
  for (var i = 0; i < cookieList.length; i++) {
    var cookie = cookieList[i].split('=');
    cookies[cookie[0]] = cookie.splice(1, cookie.length-1).join('=')
  }
  return cookies;
}

function serializeCookies(cookies) {
  var serializedCookies = [];
  Object.keys(cookies).forEach(function (key, index) {
    serializedCookies.push(key + '=' + cookies[key]);
  })
  return serializedCookies.join('; ');
}

module.exports = middleware;