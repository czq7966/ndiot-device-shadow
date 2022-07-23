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

            if (msg.type == "south")
                this.on_south_input(msg, send, done);
            else if (msg.type == "north")
                this.on_north_input(msg, send, done);
            else if (msg.type == "config")
                this.on_config_input(msg, send, done);
            else if (msg.type == "notify")
                this.on_notify_input(msg, send, done);
            else if (msg.type == "plugins") 
                    this.on_plugins_input(msg, send, done);
            else if (msg.type == "shadows") 
                    this.on_shadows_input(msg, send, done);                                
            
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

