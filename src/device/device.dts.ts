import EventEmitter = require("events")
import { BaseEvent, IBaseEvent } from "../common/events";

export interface IBase {
    onDestroy: IBaseEvent
    destroy(); 
}

export class Base {
    onDestroy: IBaseEvent;
    constructor(){
        this.onDestroy = new BaseEvent();
    }
    destroy(){
        this.onDestroy.emit(this);
    }; 
}


export interface IDeviceClass {
    new(id: string, pid: string, model: string) : Object
}

export interface IDevicePlugin {
    name: string
    url: string
    Plugin?: IDeviceClass
}

export interface IDeviceUrlPlugin {
    url: string
    Plugin?: IDeviceClass
    promise?: Promise<IDeviceClass>
}


export interface IDevicePlugins extends IBase  {    
    manager: IDeviceShadowManager;
    plugins: {[name: string]: IDevicePlugin}
    urlPlugins: {[url: string]: IDeviceUrlPlugin}
    defaultPlugin: IDeviceClass    
    regPlugin(name: string, url: string): IDevicePlugin;
    getPlugin(name: string): IDevicePlugin;
    getPluginUrl(name: string): string
    loadPlugin(name: string, reload?: boolean): Promise<IDevicePlugin>;
    reloadPlugin(name: string): Promise<IDevicePlugin>;    
    regUrlPlugin(url: string, urlPlugin: IDeviceClass): IDeviceClass;
    getUrlPlugin(url: string): IDeviceClass;
    loadUrlPlugin(url: string): Promise<IDeviceClass>;    
    reloadUrlPlugin(url: string): Promise<IDeviceClass>;        
}

export interface IDeviceEntryEvent extends IBase  {
    input: IDeviceBusEvent
    output: IDeviceBusEvent
}

export interface IDeviceShadowEvents extends IDeviceBaseEvents  {}

export interface IDeviceShadow extends IBase {
    manager: IDeviceShadowManager
    device: IDeviceBase
    events: IDeviceShadowEvents
    attachDevice(device: IDeviceBase);
    detachDevice();
}

export interface IDeviceShadows extends IBase {
    manager: IDeviceShadowManager
    shadows: {[id: string] : IDeviceShadow}
    newShadow(props: IDeviceBaseProp): Promise<IDeviceShadow>
    delShadow(id: string): boolean;
    getShadow(id: string): IDeviceShadow;
}

export interface IDeviceShadowManagerBusEvent extends IBase {
    south: IDeviceEntryEvent
    north: IDeviceEntryEvent    
    config: IDeviceEntryEvent
    notify: IDeviceEntryEvent
    plugins: IDeviceEntryEvent
    shadows: IDeviceEntryEvent
}

export interface IDeviceShadowManager extends IBase  {
    plugins: IDevicePlugins
    shadows: IDeviceShadows
    events: IDeviceShadowManagerBusEvent
}

export interface IDeviceBaseProp {
    id: string
    pid?: string
    model: string
}

export interface IDeviceBaseEvents extends IBase {
    south: IDeviceEntryEvent
    north: IDeviceEntryEvent    
    config: IDeviceEntryEvent
    notify: IDeviceEntryEvent
    parent: IDeviceEntryEvent
    child: IDeviceEntryEvent
}

export interface IDeviceBase extends IBase, IDeviceBaseProp {
    id: string
    pid: string
    model: string
    events: IDeviceBaseEvents
    props: {[name: string]: any}
    // events: {[name: string]: any}
    // services: {[name: string]: any}
    // shadow: IDeviceShadow    
}

export interface IDeviceBusEventData {
    id?: string
    type?: string
    action?: string
    topic?: string
    payload?: any
}

export interface IDeviceBusEvent extends IBase {
    eventEmitter: EventEmitter;
    on(listener: (data: IDeviceBusEventData) => void, prepend?: boolean);
    once(listener: (data: IDeviceBusEventData) => void, prepend?: boolean);
    off(listener: (data: IDeviceBusEventData) => void);
    emit(data: IDeviceBusEventData);
}