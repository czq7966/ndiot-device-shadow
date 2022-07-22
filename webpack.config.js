if (process.env.NODE_MODULE === 'device-amd') 
    module.exports = require('./webpack/webpack.config.device.amd.js');
else if (process.env.NODE_MODULE === 'node-red') 
    module.exports = require('./webpack/webpack.config.node-red.js');        
else if (process.env.NODE_MODULE === 'test') 
    module.exports = require('./webpack/webpack.config.test.js');    
else
    module.exports = require('./webpack/webpack.config.js');
