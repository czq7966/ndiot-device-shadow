import { Device } from './amd/device';
import { DeviceEntryEvent } from './device-base';
import { Base, IDeviceBaseProp, IDeviceBusEventData, IDevicePlugin, IDevicePlugins, IDeviceEntryEvent, IDeviceShadowManager, IDeviceShadowManagerBusEvent, IDeviceShadows } from "./device.dts";
import { DevicePlugins } from './plugins';
import { DeviceShadows } from './shadows';

export class DeviceShadowManagerBusEvent extends Base implements IDeviceShadowManagerBusEvent {
    south: IDeviceEntryEvent = new DeviceEntryEvent();
    north: IDeviceEntryEvent = new DeviceEntryEvent();
    config: IDeviceEntryEvent = new DeviceEntryEvent();
    notify: IDeviceEntryEvent = new DeviceEntryEvent();
    plugins: IDeviceEntryEvent = new DeviceEntryEvent();
    shadows: IDeviceEntryEvent = new DeviceEntryEvent();
    destroy() {
        this.south.destroy();
        this.north.destroy();
        this.config.destroy();
        this.notify.destroy();
        this.plugins.destroy();
        this.shadows.destroy();
        super.destroy();
    }    
}

export class DeviceManager extends Base implements IDeviceShadowManager {
    plugins: IDevicePlugins;
    shadows: IDeviceShadows;
    events: IDeviceShadowManagerBusEvent;

    constructor() {
        super();
        this.plugins = new DevicePlugins(this);
        this.shadows = new DeviceShadows(this);
        this.events = new DeviceShadowManagerBusEvent();
        this.plugins.defaultPlugin = Device;

        let on_south_input = (msg) => {this.on_south_input(msg);}
        let on_north_input = (msg) => {this.on_north_input(msg);}
        let on_config_input = (msg) => {this.on_config_input(msg);}
        let on_notify_input = (msg) => {this.on_notify_input(msg);}
        let on_plugins_input = (msg) => {this.on_plugins_input(msg);}
        let on_shadows_input = (msg) => {this.on_shadows_input(msg);}


        this.events.south.input.on(on_south_input);
        this.events.north.input.on(on_north_input);
        this.events.config.input.on(on_config_input);
        this.events.notify.input.on(on_notify_input);
        this.events.plugins.input.on(on_plugins_input);
        this.events.shadows.input.on(on_shadows_input);

        this.onDestroy.once(() => {
            this.events.south.input.off(on_south_input);
            this.events.north.input.off(on_north_input);
            this.events.config.input.off(on_config_input);
            this.events.notify.input.off(on_notify_input);
            this.events.plugins.input.off(on_plugins_input);
            this.events.shadows.input.off(on_shadows_input);
        })

    }
    
    destroy() {
        this.events.destroy();
        this.shadows.destroy();
        this.plugins.destroy();
        super.destroy();
    }

    on_south_input(msg: IDeviceBusEventData) {
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.south.input.emit(msg);            
    }

    on_north_input(msg: IDeviceBusEventData) {
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.north.input.emit(msg);            
    }
    
    on_config_input(msg: IDeviceBusEventData) {
        let shadow = this.shadows.getShadow(msg.id);
        if (shadow) shadow.events.config.input.emit(msg);            
    }   

    on_notify_input(msg: IDeviceBusEventData) {
       
    }       

    on_plugins_input(msg: IDeviceBusEventData) {
        console.log("manager on_plugins_input")
        if (msg.action == "reg") {
            let payload = msg.payload as IDevicePlugin;
            msg.payload = this.plugins.regPlugin(payload.name, payload.url);
            this.events.plugins.output.emit(msg);            
        } else {

        }
    }   

    on_shadows_input(msg: IDeviceBusEventData) {
        if (msg.action == "create") {
            let payload = msg.payload as IDeviceBaseProp;
            this.shadows.newShadow(payload)
            .then(shadow => {
                msg.payload = shadow;
                this.events.shadows.output.emit(msg);
            })
            .catch(err => {
                msg.payload = err;
                this.events.shadows.output.emit(msg);
            });

        } else {

        }

    }   

    


}