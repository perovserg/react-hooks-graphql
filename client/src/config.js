let config;

try{
    config = require('./config.local.json');
} catch (e) {
    config = require('./config.dist.json');
}

export default config;
