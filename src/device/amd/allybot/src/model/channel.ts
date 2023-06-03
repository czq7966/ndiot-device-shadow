import EventEmitter = require("events")
import { ClientRequestArgs } from 'http';
import * as WS from "ws";
import { Api } from '../api';
import { User } from './user';

export interface IChannelEvents {

}

export interface IChannelMessage {
    type?: String
}

export interface IChannelModel {
    websocket?: WS,
    pingTimeoutHandler?: any,
    connected?: boolean;
}

export class Channel {
    static Events = {
        onOpen: "onOpen",
        onClose: "onClose",
        onError: "onError",
        onMessge: "onMessage"
    }

    static model: IChannelModel = {};
    static events: EventEmitter =  new EventEmitter();
    static connect(): Promise<any> {
        return new Promise((resolve, reject) => {  
            let options: ClientRequestArgs = {
                headers:{
                    "Token" : User.model.token + "",
                    "Mobile-User-Id" : User.model.openid + ""
                }
            };


            if (Api.useProxy) {
                options.host = Api.proxyHost;
                options.port = Api.proxyPort;
            }

            let path = `ws://${Api.host}:${Api.port}/fleetapi/websocketapp/${User.model.openid}/${User.model.token}`

            options.path = path;

            const ws = new WS(`${path}`, options);
            this.model.websocket = ws;

            ws.on('open', () => {
                this.model.connected = true;
                this.events.emit(this.Events.onOpen);
                this.ping();     
                resolve("");                     
            });

            ws.on('close', (code) => {
                this.model.connected = false;
                this.events.emit(this.Events.onClose, code);
                reject(code);                  
            });
            
            ws.on('error', (err) => {
                this.events.emit(this.Events.onError, err);
                reject(err);                
            });

            ws.on('ping', () => {
                console.log("1111111111111", "ping");
                
            });


            ws.on('message', (data) => {
                console.log("111111111111", data);
                let msg: IChannelMessage = JSON.parse(data.toString());

                if (msg.type != "ping") {
                    this.events.emit(this.Events.onMessge, msg);
                }
            });



        })
    }
    static ping() {
        if (this.model.connected ) {
            let ping = {
                language: 'zh_CN',
                type:'ping'
            }
            this.model.websocket.send(JSON.stringify(ping));      

            clearTimeout(this.model.pingTimeoutHandler);
            this.model.pingTimeoutHandler = setTimeout(() => {
                this.ping();                
            }, 1000 * 5);
        }

    }


}