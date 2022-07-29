import EventEmitter = require("events");
import { IBaseEvent, BaseEvent } from "../common/events";
import { Base, IDeviceBase, IDeviceBaseEvents, IDeviceBusEventData, IDeviceShadow, IDeviceEntryEvent, IDeviceBusEvent, IDeviceBaseProp } from "./device.dts";

export class DeviceBusEvent implements IDeviceBusEvent {
    eventName: string = "";
    eventEmitter: EventEmitter = new EventEmitter();
    onDestroy: IBaseEvent = new BaseEvent();
    destroy() {
        this.onDestroy.emit(this);
        this.eventEmitter.removeAllListeners();        
    }
    on(listener: (data: IDeviceBusEventData) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependListener(this.eventName, listener);
        else
            this.eventEmitter.addListener(this.eventName, listener);        
    }
    once(listener: (data: IDeviceBusEventData) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependOnceListener(this.eventName, listener);
        else
            this.eventEmitter.once(this.eventName, listener);
    }
    off(listener: (data: IDeviceBusEventData) => void) {
        this.eventEmitter.off(this.eventName, listener);
    }
    emit(data: IDeviceBusEventData) {
        this.eventEmitter.emit(this.eventName, data);
    }
}

export class DeviceEntryEvent extends Base implements IDeviceEntryEvent {
    input: IDeviceBusEvent = new DeviceBusEvent();
    output: IDeviceBusEvent = new DeviceBusEvent();
    destroy() {
        this.input.destroy();
        this.output.destroy();
        super.destroy();
    }    
}

export class DeviceBaseEvents extends Base implements IDeviceBaseEvents {
    south: IDeviceEntryEvent;
    north: IDeviceEntryEvent;
    config: IDeviceEntryEvent ;
    notify: IDeviceEntryEvent;
    parent: IDeviceEntryEvent
    child: IDeviceEntryEvent
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

export class DeviceBaseProp implements IDeviceBaseProp {
    id: string = "";
    pid: string = "";
    model: string = "";    
}

export class Debuger {
    static Debuger: Console = console;
}

export class DeviceBase extends Base implements IDeviceBase {
    id: string;
    pid: string;
    model: string;
    events: IDeviceBaseEvents;
    props: { [name: string]: any; };

    constructor(id: string, pid: string, model: string) {
        super();
        this.id = id;
        this.pid = pid;
        this.model = model;
        this.events = new DeviceBaseEvents();
        // this.shadow = shadow;

        let on_south_input = (msg) => {this.on_south_input(msg);}
        let on_north_input = (msg) => {this.on_north_input(msg);}
        let on_config_input = (msg) => {this.on_config_input(msg);}
        let on_notify_input = (msg) => {this.on_notify_input(msg);}
        let on_parent_input = (msg) => {this.on_parent_input(msg);}
        let on_child_input = (msg) => {this.on_child_input(msg);}

        this.events.south.input.on(on_south_input);
        this.events.north.input.on(on_north_input);
        this.events.config.input.on(on_config_input);
        this.events.notify.input.on(on_notify_input);
        this.events.parent.input.on(on_parent_input);
        this.events.child.input.on(on_child_input);

        this.onDestroy.once(() => {
            console.log("DeviceBase onDestroy");

        })

        this.init();        
    }


    destroy() {
        this.uninit();
        this.events.destroy();
        super.destroy();
     
        console.log("DeviceBase destroy");
    }

    init() {
       console.log("DeviceBase init");
    }

    uninit() {
        console.log("DeviceBase uninit");
    }

    //南向输入
    on_south_input(msg: IDeviceBusEventData){
        console.log("DeviceBase  on_south_input");   
        //南面输入->北面输出
        this.events.north.output.emit(msg);

        
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg);       
    }

    //北向输入 -> 转南向输出(若有父设备，由影子转父设备处理))
    on_north_input(msg: IDeviceBusEventData){
        console.log("DeviceBase  on_north_input");  
        this.events.south.output.emit(msg);
    }
    
    //配置输入
    on_config_input(msg: IDeviceBusEventData) {
        console.log("DeviceBase  on_config_input");       
    }   

    //通知输入
    on_notify_input(msg: IDeviceBusEventData) {
        console.log("DeviceBase  on_config_input");       
    }  

    //父设备输入 -> 转南向输入
    on_parent_input(msg: IDeviceBusEventData){
        console.log("DeviceBase  on_parent_input");
        this.on_south_input(msg);       
    } 
    
    //子设备输入 -> 转南向输出
    on_child_input(msg: IDeviceBusEventData) {
        console.log("DeviceBase  on_child_input");
        
        //id需输入父id，否则死循环
        msg.id = this.id;
        this.events.south.output.emit(msg);       
    }  

}