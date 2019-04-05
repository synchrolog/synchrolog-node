# Synchrolog

## Installation

```bash
$ npm install git://github.com/synchrolog/synchrolog-node.git
```

## Usage
Format the log messages the same way as Morgan https://github.com/expressjs/morgan#morganformat-options

```js
const synchrolog = require('synchrolog-node');

// Initialize your express app, and pass the app to the synchrolog module
var app = express();

synchrolog(app, 'YOUR_API_KEY', 'combined');
synchrolog(app, 'YOUR_API_KEY', function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
});
synchrolog(app, 'YOUR_API_KEY', ':remote-addr - :remote-user [:date[clf]] ":method :url');
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/synchrolog/synchrolog-node. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).