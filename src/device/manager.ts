import { Device } from './amd/device';
import { IDeviceBaseProp, IDeviceBusEventData, IDevicePlugins, IDeviceShadowEvent, IDeviceShadowManager, IDeviceShadowManagerBusEvent, IDeviceShadows } from "./device.dts";
import { DevicePlugins } from './plugins';
import { DeviceShadowEvent } from './shadow';
import { DeviceShadows } from './shadows';

export class DeviceShadowManagerBusEvent implements IDeviceShadowManagerBusEvent {
    south: IDeviceShadowEvent = new DeviceShadowEvent();
    north: IDeviceShadowEvent = new DeviceShadowEvent();
    config: IDeviceShadowEvent = new DeviceShadowEvent();
    notify: IDeviceShadowEvent = new DeviceShadowEvent();
    plugins: IDeviceShadowEvent = new DeviceShadowEvent();
    shadows: IDeviceShadowEvent = new DeviceShadowEvent();
    destroy = () => {
        this.south.destroy();
        this.north.destroy();
        this.config.destroy();
        this.notify.destroy()
        this.plugins.destroy()
        this.shadows.destroy()
    }    
}

export class DeviceManager implements IDeviceShadowManager {
    plugins: IDevicePlugins;
    shadows: IDeviceShadows;
    events: IDeviceShadowManagerBusEvent;

    constructor() {
        this.plugins = new DevicePlugins(this);
        this.shadows = new DeviceShadows(this);
        this.events = new DeviceShadowManagerBusEvent();
        this.plugins.defaultPlugin = Device;

        this.events.south.input.on(this.on_south_input);
        this.events.north.input.on(this.on_north_input);
        this.events.config.input.on(this.on_config_input);
        this.events.notify.input.on(this.on_notify_input);
        this.events.plugins.input.on(this.on_plugins_input);
        this.events.shadows.input.on(this.on_shadows_input);

    }
    
    destroy = () =>{
        this.events.south.input.off(this.on_south_input);
        this.events.north.input.off(this.on_north_input);
        this.events.config.input.off(this.on_config_input);
        this.events.notify.input.off(this.on_notify_input);
        this.events.plugins.input.off(this.on_plugins_input);
        this.events.shadows.input.off(this.on_shadows_input);

        this.events.destroy();
        this.shadows.destroy();
        this.plugins.destroy();
    }

    on_south_input = (msg: IDeviceBusEventData) => {
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.south.input.emit(msg);            
    }

    on_north_input = (msg: IDeviceBusEventData) => {
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.north.input.emit(msg);            
    }
    
    on_config_input = (msg: IDeviceBusEventData) =>{
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.config.input.emit(msg);            
    }   

    on_notify_input = (msg: IDeviceBusEventData) => {
       
    }       

    on_plugins_input = (msg: IDeviceBusEventData) => {

    }   

    on_shadows_input = (msg: IDeviceBusEventData) => {
        if (msg.action == "create") {
            let payload = msg.payload as IDeviceBaseProp;
            this.shadows.newShadow(payload.model, payload.id, payload.pid)
            .then(shadow => {
                msg.payload = shadow;
                this.events.shadows.output.emit(msg);
            })
            .catch(err => {

            });

        } else {

        }

    }   

    


}