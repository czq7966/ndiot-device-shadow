

module.exports = function (RED) {
    function deviceShadow(config) {
        var Manager = require('./shadow-manager');
        RED.nodes.createNode(this, config);
        new Manager.NRShadowManager(RED, this, config);

    }
    RED.nodes.registerType('nd-device-shadow', deviceShadow);
};