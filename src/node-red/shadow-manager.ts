import * as NR from "node-red";
import { IDeviceShadowManager } from "../device/device.dts";
import { DeviceManager } from "../device/manager";


interface INRConfig extends NR.NodeDef {
    
}

interface INRInputMsg extends NR.NodeMessageInFlow {
    id?: string   
    action?: string
    type?: string
}

interface INROutputMsg extends INRInputMsg {
    id?: string   
    action?: string
    type?: string
}

interface INRShadowManager {
    RED: NR.NodeAPI
    node: NR.Node;
    config: INRConfig;
    manager: IDeviceShadowManager
}


export class NRShadowManager implements INRShadowManager{
    RED: NR.NodeAPI<NR.NodeAPISettingsWithData>;
    node: NR.Node;
    config: INRConfig;    
    manager: IDeviceShadowManager;
    constructor(_RED: NR.NodeAPI, _node: NR.Node, _config: INRConfig){
        this.RED = _RED;
        this.node = _node;
        this.config = _config;
        this.init();
    }

    init = () => {
        this.manager = new DeviceManager();
        this.node.on("input", (msg: INRInputMsg, send, done) => {
            console.log(msg);
            if (msg.type == "events") {
                if (msg.action == "south_input")
                    this.on_south_input(msg, send, done);
                else if (msg.action == "north_input")
                    this.on_north_input(msg, send, done);
                else if (msg.action == "config_input")
                    this.on_config_input(msg, send, done);
                else if (msg.action == "notify_input")
                    this.on_notify_input(msg, send, done);
            } else if (msg.type == "plugins") {
                    this.on_plugins_input(msg, send, done);
            } else if (msg.type == "shadows") {
                    this.on_shadows_input(msg, send, done);                                
            }
        })

        this.node.on("close", () => {
            this.uninit();
        })

        this.manager.events.south.output.on(this.on_south_output);
        this.manager.events.north.output.on(this.on_north_output);
        this.manager.events.config.output.on(this.on_config_output);
        this.manager.events.notify.output.on(this.on_notify_output);
        this.manager.events.plugins.output.on(this.on_plugins_output);
        this.manager.events.shadows.output.on(this.on_shadows_output);
              
    }
    uninit = () => {
        this.manager.events.south.output.off(this.on_south_output);
        this.manager.events.north.output.off(this.on_north_output);
        this.manager.events.config.output.off(this.on_config_output);
        this.manager.events.notify.output.off(this.on_notify_output);
        this.manager.events.plugins.output.off(this.on_plugins_output);
        this.manager.events.shadows.output.off(this.on_shadows_output);
        this.manager.destroy();        
    }

    on_south_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.south.input.emit(msg);
    }

    on_north_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.north.input.emit(msg);
    }
    
    on_config_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.config.input.emit(msg);
    }   

    on_notify_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.notify.input.emit(msg);
    }       

    on_plugins_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.plugins.input.emit(msg);
    }   

    on_shadows_input = (msg: INRInputMsg,
        send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
        done: (err?: Error) => void,) => {
            this.manager.events.shadows.input.emit(msg);
    }   

    on_south_output = (msg: INROutputMsg) => {
        this.node.send([msg, null, null, null, null, null]);            
    }

    on_north_output = (msg: INROutputMsg) => {
        this.node.send([null, msg, null, null, null, null]);
    }
        
    on_config_output = (msg: INROutputMsg) => {
        this.node.send([null, null, msg, null, null, null]);        
    }    

    on_notify_output = (msg: INROutputMsg) => {
        this.node.send([null, null, null, msg, null, null]);
    }       

    on_plugins_output = (msg: INROutputMsg) => {
        this.node.send([null, null, null, null, msg, null]);
    }
        
    on_shadows_output = (msg: INROutputMsg) => {
        this.node.send([null, null, null, null, null, msg]);        
    }  
    

}

// let NRType = function(RED: any) {
//     let node: NR.Node;
//     let config: IConfig;
//     let manager: IDeviceShadowManager = new DeviceManager();

//     function on_south_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.south.input.emit(msg);
//     }

//     function on_north_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.north.input.emit(msg);
//     }
    
//     function on_config_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.config.input.emit(msg);
//     }   

//     function on_notify_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.notify.input.emit(msg);
//     }       

//     function on_plugins_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.plugins.input.emit(msg);
//     }   

//     function on_shadows_input(msg: INRInputMsg,
//         send: (msg: INRInputMsg | Array<INRInputMsg | INRInputMsg[] | null>) => void,
//         done: (err?: Error) => void,) {
//             this.manager.events.shadows.input.emit(msg);
//     }   

//     function on_south_output(msg: INROutputMsg) {
//         this.node.send([msg, null, null, null, null, null]);            
//     }

//     function on_north_output(msg: INROutputMsg) {
//         this.node.send([null, msg, null, null, null, null]);
//     }
        
//     function on_config_output(msg: INROutputMsg) {
//         this.node.send([null, null, msg, null, null, null]);        
//     }    

//     function on_notify_output(msg: INROutputMsg) {
//         this.node.send([null, null, null, msg, null, null]);
//     }       

//     function on_plugins_output(msg: INROutputMsg) {
//         this.node.send([null, null, null, null, msg, null]);
//     }
        
//     function on_shadows_output(msg: INROutputMsg) {
//         this.node.send([null, null, null, null, null, msg]);        
//     }       

//     function initNode() {
//         RED.nodes.createNode(node, config);
//         node.on("input", (msg: INRInputMsg, send, done) => {
//             if (msg.type == "events") {
//                 if (msg.action == "south_input")
//                     on_south_input(msg, send, done);
//                 else if (msg.action == "north_input")
//                     on_north_input(msg, send, done);
//                 else if (msg.action == "config_input")
//                     on_config_input(msg, send, done);
//                 else if (msg.action == "notify_input")
//                     on_notify_input(msg, send, done);
//             } else if (msg.type == "plugins") {
//                 on_plugins_input(msg, send, done);
//             } else if (msg.type == "shadows") {
//                 on_shadows_input(msg, send, done);                                
//             }
//         })

//         node.on("close", () => {
//             manager.destroy();
//         })

//         this.manager.events.south.output.on(on_south_output);
//         this.manager.events.north.output.on(on_north_output);
//         this.manager.events.config.output.on(on_config_output);
//         this.manager.events.notify.output.on(on_notify_output);
//         this.manager.events.plugins.output.on(on_plugins_output);
//         this.manager.events.shadows.output.on(on_shadows_output);
//     }

    
//     function NDDeviceShadowManager(_config: any)  {
//         config = _config;
//         node = this as NR.Node; 
//         initNode();
//     }

//     RED.nodes.registerType("nd-device-shadow", NDDeviceShadowManager);

// }

