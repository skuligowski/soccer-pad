path = require('path');
fs = require('fs');
_ = require('lodash');

module.exports = {
  listenPort: 8000,
  basePath: 'http://localhost:8000',
  apiVersion: '1.0.0',
  apiContext: '/api',
  ssl: false,

  loadCustomConfiguration: function() {
    if (fs.existsSync('./config_custom.js')) {
      config_custom = require('./config_custom.js');
      _.merge(this, config_custom);
    }
  }
};
