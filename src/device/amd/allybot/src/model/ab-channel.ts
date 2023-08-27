import EventEmitter = require("events")
import { ClientRequestArgs } from 'http';
import * as WS from "ws";
import { ABApi } from '../api/ab-api';
import { ABUser } from './ab-user';

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

export class ABChannel {
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
                    "Token" : ABUser.model.token + "",
                    "Mobile-User-Id" : ABUser.model.openid + ""
                }
            };


            if (ABApi.useProxy) {
                options.host = ABApi.proxyHost;
                options.port = ABApi.proxyPort;
            }

            let path = `ws://${ABApi.host}:${ABApi.port}/fleetapi/websocketapp/${ABUser.model.openid}/${ABUser.model.token}`

            options.path = path;

            const ws = new WS(`${path}`, options);
            this.model.websocket = ws;

            ws.on('open', () => {
                console.log("AB ABChannel WS通道开启", new Date().toLocaleString());
                this.model.connected = true;
                this.events.emit(this.Events.onOpen);
                this.ping();     
                resolve("");                     
            });

            ws.on('close', (code) => {
                console.log("AB ABChannel WS通道关闭", new Date().toLocaleString());
                let connected = this.model.connected;
                this.model.connected = false;
                this.events.emit(this.Events.onClose, code);
                ws.removeAllListeners();
                if (!connected){
                    resolve("");    
                }              
            });
            
            ws.on('error', (err) => {
                console.log("AB ABChannel WS通道出错", new Date().toLocaleString());
                this.events.emit(this.Events.onError, err);
                if (!this.model.connected){
                    resolve("");    
                } 
            });

            ws.on('ping', () => {
                // console.log("1111111111111", "ping");
                
            });


            ws.on('message', (data) => {
                // console.log("111111111111", data);
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