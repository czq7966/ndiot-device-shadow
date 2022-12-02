/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EventEmitter = require("events");
import { InspectOptions } from "util";
import { IBaseEvent, BaseEvent } from "../common/events";
import { Base, IDeviceBase, IDeviceBaseEvents, IDeviceBusEventData, IDeviceShadow, IDeviceEntryEvent, IDeviceBusEvent, IDeviceBaseAttr } from "./device.dts";

export class DeviceBusEvent implements IDeviceBusEvent {
    eventName = "";
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

export class DeviceBaseAttr implements IDeviceBaseAttr {
    id = "";
}

export class Debuger {
    static Debuger: Console = console;
    static Nothing: Console =  {
        assert(value?: any, message?: any, ...optionalParams: any[]): void { return; },
        clear(): void { return; },
        count(label?: any): void { return; },
        countReset(label?: any): void { return; },
        debug(message?: any, ...optionalParams: any[]): void { return; },
        dir(obj?: any, options?: any): void { return; },
        dirxml(...data: any[]): void { return; },
        error(message?: any, ...optionalParams: any[]): void { return; },
        group(...label: any[]): void {  return;},
        groupCollapsed(...label: any[]): void { return; },
        groupEnd(): void {  return;},
        info(message?: any, ...optionalParams: any[]): void { return; },
        log(message?: any, ...optionalParams: any[]): void { return; },
        table(tabularData?: any, properties?: any): void { return; },
        time(label?: any): void { return; },
        timeEnd(label?: any): void {  return;},
        timeLog(label?: any, ...data: any[]): void {  return;},
        timeStamp(label?: any): void { return; },
        trace(message?: any, ...optionalParams: any[]): void {  return;},
        warn(message?: any, ...optionalParams: any[]): void { return; },
        profile(label?: string): void { return; },
        profileEnd(label?: string): void {  return;},
        Console: undefined
    }
}

export class DeviceBase extends Base implements IDeviceBase {
    attrs: IDeviceBaseAttr;
    events: IDeviceBaseEvents;
    props: { [name: string]: any; };

    constructor(attrs: IDeviceBaseAttr) {
        super();
        this.attrs = Object.assign({}, attrs);
        this.events = new DeviceBaseEvents();
        // this.shadow = shadow;

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
            Debuger.Debuger.log("DeviceBase onDestroy");

        })

        setTimeout(()=>{ this.init();});        
    }


    destroy() {
        this.uninit();
        this.events.destroy();
        super.destroy();
     
        Debuger.Debuger.log("DeviceBase destroy");
    }

    init() {
        Debuger.Debuger.log("DeviceBase init");
    }

    uninit() {
        Debuger.Debuger.log("DeviceBase uninit");
    }

    //南向输入
    on_south_input(msg: IDeviceBusEventData){
        Debuger.Debuger.log("DeviceBase  on_south_input");   
        //南面输入->北面输出
        this.events.north.output.emit(msg);

        
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg);       
    }

    //北向输入 -> 转南向输出(若有父设备，由影子转父设备处理))
    on_north_input(msg: IDeviceBusEventData){
        Debuger.Debuger.log("DeviceBase  on_north_input");  
        this.events.south.output.emit(msg);
    }
    
    //配置输入
    on_config_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceBase  on_config_input");       
    }   

    //通知输入
    on_notify_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceBase  on_config_input");       
    }  

    //父设备输入 -> 转南向输入
    on_parent_input(msg: IDeviceBusEventData){
        Debuger.Debuger.log("DeviceBase  on_parent_input");
        this.on_south_input(msg);       
    } 
    
    //子设备输入 -> 转南向输出
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("DeviceBase  on_child_input");
        
        //id需输入父id，否则死循环
        msg.id = this.attrs.id;
        this.events.south.output.emit(msg);       
    }  

}