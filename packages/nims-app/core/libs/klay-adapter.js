const d3 = require('./klayjs.d3');
const klay = require('./klay');
require('./klayjs.bridge')(klay, d3);
// const d3 = require('core/libs/klayjs.d3');
// const klay = require('core/libs/klay');
// require('core/libs/klayjs.bridge')(klay, d3);

module.exports = {
    d3, klay
};
