import { DeviceBusEvent } from "./bus-event";
import { IDeviceBase, IDeviceBusEvent, IDeviceBusEventData, IDeviceShadow, IDeviceShadowEvent, IDeviceShadowEvents, IDeviceShadowManager } from "./device.dts";

export class DeviceShadowEvent implements IDeviceShadowEvent {
    input: IDeviceBusEvent = new DeviceBusEvent();
    output: IDeviceBusEvent = new DeviceBusEvent();
    destroy = () => {
        this.input.destroy();
        this.output.destroy();
    }    
}

export class DeviceShadowEvents implements IDeviceShadowEvents {
    south: IDeviceShadowEvent = new DeviceShadowEvent();
    north: IDeviceShadowEvent = new DeviceShadowEvent();
    config: IDeviceShadowEvent = new DeviceShadowEvent();
    parent: IDeviceShadowEvent = new DeviceShadowEvent();
    child: IDeviceShadowEvent = new DeviceShadowEvent();

    destroy = () => {
        this.south.destroy();
        this.north.destroy();
        this.config.destroy();
        this.parent.destroy();
        this.child.destroy();
    }
  
}

export class DeviceShadow implements IDeviceShadow {
    manager: IDeviceShadowManager;
    device: IDeviceBase;
    events: IDeviceShadowEvents;

    constructor(manager: IDeviceShadowManager) {
        this.manager = manager;
        this.events = new DeviceShadowEvents();
        this.events.south.input.on(this.on_south_input);
        this.events.north.input.on(this.on_north_input);
        this.events.config.input.on(this.on_config_input);
        this.events.parent.input.on(this.on_parent_input);
        this.events.child.input.on(this.on_child_input);

        this.events.south.output.on(this.on_south_output);
        this.events.north.output.on(this.on_north_output);
        this.events.config.output.on(this.on_config_output);     
    }

    destroy = () => {
        this.events.destroy();
    }

    on_south_input(msg: IDeviceBusEventData) {
        console.log("DeviceShadow on_south_input", this.device);


    }

    on_north_input(msg: IDeviceBusEventData) {

    }
        
    on_config_input(msg: IDeviceBusEventData) {

    }    

    on_parent_input(msg: IDeviceBusEventData) {

    }    
    
    on_child_input(msg: IDeviceBusEventData) {

    }        


    on_south_output(msg: IDeviceBusEventData) {
        msg.id = this.device.id;
        if (this.device.pid) {
            let pshadow = this.manager.shadows.getShadow(this.device.pid);
            pshadow.events.child.input.emit(msg);
        } else {            
            this.manager.events.south.output.emit(msg);
        }
    }

    on_north_output(msg: IDeviceBusEventData) {
        msg.id = this.device.id;
        this.manager.events.north.output.emit(msg);
    }
        
    on_config_output(msg: IDeviceBusEventData) {
        msg.id = this.device.id;
        this.manager.events.config.output.emit(msg);
    }    

 
}