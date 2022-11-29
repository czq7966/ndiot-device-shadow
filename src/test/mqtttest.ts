import * as mqtt from "mqtt"


let client  = mqtt.connect('mqtt://push-access.sdp.101.com:1780', {
    username: "60b603a0d9419c00107e378d",
})

let subscribe = mqtt.MqttClient.prototype.subscribe;
mqtt.MqttClient.prototype.subscribe  = function(a, b, c) {
    console.log(1111111, a, b)
    return subscribe.call(this, a,b,c);
    return;
} as any;

client.on('connect', function () {
    console.log("on connect");
      client.subscribe('+/+/dev/ESP8266x002bab4d/+/+/+/+', function (err) {
        if (!err) {
            console.log("on subscribe +/+/dev/ESP8266x002bab4d/+/+/+/+");
        }
    })
})

client.on('message', function (topic, message) {
  console.log("on message")
})

client.on('disconnect', function (topic, message) {
    console.log("on disconnect")
})

client.on('end', function (topic, message) {
    console.log("on end")
})  

client.on('close', function (topic, message) {
    console.log("on close")
})  

client.on('error', function (topic, message) {
    console.log("on error")
})  

client.on('offline', function (topic, message) {
    console.log("on offline")
})  

client.on('outgoingEmpty', function (topic, message) {
    console.log("on outgoingEmpty")
})  

client.on('packetreceive', function (topic, message) {
    console.log("on packetreceive")
})  

client.on('reconnect', function (topic, message) {
    console.log("on reconnect")
})  

let abc = -1;




