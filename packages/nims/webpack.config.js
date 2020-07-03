const nimsWpConfig = require('./config/nims.webpack.dev');

module.exports = (env, argv) => {
    return nimsWpConfig(env, argv);
}