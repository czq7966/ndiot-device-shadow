const Allybot = require("../../../../../dist/node-red/amd/allybot/index");

// Allybot.Api.login();
// Allybot.User.login();


// const WebSocket = require('ws');

// const ws = new WebSocket('ws://www.host.com/path');

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function incoming(data) {
//   console.log(data);
// });

// Allybot.Main.start();
// let allyBot = new AllyBot.AllyBot({id: "AllyBotID"});
console.log(new Allybot.AllyBot({id: "AllyBotID"}))
