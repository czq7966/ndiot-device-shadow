import { IBaseEvent, BaseEvent } from "../common/events";
import { Debuger, DeviceEntryEvent } from "./device-base";
import { Base, IDeviceBase, IDeviceBusEvent, IDeviceBusEventData, IDeviceShadow, IDeviceEntryEvent, IDeviceShadowEvents, IDeviceShadowManager } from "./device.dts";



export class DeviceShadowEvents extends Base implements IDeviceShadowEvents {
    south: IDeviceEntryEvent;
    north: IDeviceEntryEvent;
    config: IDeviceEntryEvent;
    notify: IDeviceEntryEvent;
    parent: IDeviceEntryEvent;
    child: IDeviceEntryEvent;
    constructor() {
        super();
        this.south = new DeviceEntryEvent();
        this.north = new DeviceEntryEvent();
        this.config = new DeviceEntryEvent();
        this.notify = new DeviceEntryEvent();
        this.parent = new DeviceEntryEvent();
        this.child = new DeviceEntryEvent();

    }
    destroy() {
        this.south.destroy();
        this.north.destroy();
        this.config.destroy();
        this.notify.destroy();
        this.parent.destroy();
        this.child.destroy();
        super.destroy();
    }
  
}

export class DeviceShadow extends Base implements IDeviceShadow {
    manager: IDeviceShadowManager;
    device: IDeviceBase;
    events: IDeviceShadowEvents;
    _onDetachDevice: IBaseEvent;

    constructor(manager: IDeviceShadowManager) {
        super();
        this.manager = manager;
        this.events = new DeviceShadowEvents();
        this._onDetachDevice = new BaseEvent();

        const on_south_input = (msg) => {this.on_south_input(msg);}
        const on_north_input = (msg) => {this.on_north_input(msg);}
        const on_config_input = (msg) => {this.on_config_input(msg);}
        const on_notify_input = (msg) => {this.on_notify_input(msg);}
        const on_parent_input = (msg) => {this.on_parent_input(msg);}
        const on_child_input = (msg) => {this.on_child_input(msg);}


        this.events.south.input.on(on_south_input);
        this.events.north.input.on(on_north_input);
        this.events.config.input.on(on_config_input);
        this.events.notify.input.on(on_notify_input);
        this.events.parent.input.on(on_parent_input);
        this.events.child.input.on(on_child_input);

        
        this.onDestroy.once(() => {
            this.events.south.input.off(on_south_input);
            this.events.north.input.off(on_north_input);
            this.events.config.input.off(on_config_input);
            this.events.notify.input.off(on_notify_input);
            this.events.parent.input.off(on_parent_input);
            this.events.child.input.off(on_child_input);    

        })
    }

    destroy() {
        this.detachDevice();
        this.events.destroy();
        super.destroy();
    }

    attachDevice(device: IDeviceBase) {
        this.detachDevice();
        if (device) {
            this.device = device;
            const on_device_south_output = (msg) => {this.on_device_south_output(msg);}
            const on_device_north_output = (msg) => {this.on_device_north_output(msg);}
            const on_device_config_output = (msg) => {this.on_device_config_output(msg);}
            const on_device_notify_output = (msg) => {this.on_device_notify_output(msg);}
            const on_device_parent_output = (msg) => {this.on_device_parent_output(msg);}
            const on_device_child_output = (msg) => {this.on_device_child_output(msg);}

            this.device.events.south.output.on(on_device_south_output);
            this.device.events.north.output.on(on_device_north_output);
            this.device.events.config.output.on(on_device_config_output);
            this.device.events.notify.output.on(on_device_notify_output);
            this.device.events.parent.output.on(on_device_parent_output);
            this.device.events.child.output.on(on_device_child_output);
            this._onDetachDevice.once(() => {
                this.device.events.south.output.off(on_device_south_output);
                this.device.events.north.output.off(on_device_north_output);
                this.device.events.config.output.off(on_device_config_output);
                this.device.events.notify.output.off(on_device_notify_output);
                this.device.events.parent.output.off(on_device_parent_output);
                this.device.events.child.output.off(on_device_child_output);
            })
        }

    }
    detachDevice() {
        this._onDetachDevice.emit(this);
        this.device = null;
    }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_south_input");
        this.device.events.south.input.emit(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_north_input");
        this.device.events.north.input.emit(msg);
    }
        
    //配置输入
    on_config_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_config_input");
        this.device.events.config.input.emit(msg);
    }    

    //通知输入
    on_notify_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_notify_input");
        this.device.events.notify.input.emit(msg);
    }   

    //父影子输出给本影子 ->本设备(子设备)转南向输入
    on_parent_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_parent_input");
        // this.device.events.parent.input.emit(msg);
        this.on_south_input(msg);
    }    
    
    //子影子输出给本影子，本设备(父设备)子输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_child_input");
        this.device.events.child.input.emit(msg);
    }        



    //Device Events   
    //本设备南向输出，若有父设备，父影子子输入 
    on_device_south_output(msg: IDeviceBusEventData) {        
        msg.id = msg.id || this.device.attrs.id;
        if (this.device.attrs.pid) {
            Debuger.Debuger.log("DeviceShadow parent on_device_south_output");
            const pshadow = this.manager.shadows.getShadow(this.device.attrs.pid);
            if (pshadow)
                pshadow.events.child.input.emit(msg);
            else
            Debuger.Debuger.error("error: DeviceShadow parent on_device_south_output: not parent id: " + this.device.attrs.id+ ", pid: " + this.device.attrs.pid);
        } else {
            Debuger.Debuger.log("DeviceShadow on_device_south_output");
            this.manager.events.south.output.emit(msg);
        }
    } 

    //本设备北向输出
    on_device_north_output(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_north_output");
        msg.id = msg.id || this.device.attrs.id;
        if (typeof msg.payload == "object")
            msg.payload.device = msg.payload.device || { attrs: this.device.attrs} as any;
        this.manager.events.north.output.emit(msg);
    } 

    //本设备配置输出
    on_device_config_output(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_config_output");
        msg.id = msg.id || this.device.attrs.id;
        this.manager.events.config.output.emit(msg);
    } 

    //本设备通知输出
    on_device_notify_output(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_notify_output");
        msg.id = msg.id || this.device.attrs.id;
        this.manager.events.notify.output.emit(msg);
    } 

    //本影子输出给子影子
    on_device_parent_output(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_parent_output");
        //msg.id == child.id
        msg.id = msg.id || this.device.attrs.id;
        const childShadow = this.manager.shadows.getShadow(msg.id);
        if (childShadow)
            childShadow.events.parent.input.emit(msg);
    } 

    on_device_child_output(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_child_output");
        msg.id = msg.id || this.device.attrs.id;        
    } 

    //Input
    on_device_parent_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_parent_input");
    } 

    on_device_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceShadow on_device_child_input");
        
    } 
}