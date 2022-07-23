import EventEmitter = require("events")

export interface IBase {
    destroy: () => void; 
}

export interface IDeviceClass {
    new(id: string, pid: string, plugin: string, shadow: IDeviceShadow) : Object
}

export interface IDevicePlugin {
    name: string
    url: string
    Plugin?: IDeviceClass
}


export interface IDevicePlugins extends IBase  {    
    manager: IDeviceShadowManager;
    plugins: {[name: string]: IDevicePlugin}
    urlPlugins: {[url: string]: IDeviceClass}
    defaultPlugin: IDeviceClass    
    regPlugin(name: string, url: string): IDevicePlugin;
    getPlugin(name: string): IDevicePlugin;
    loadPlugin(name: string, defaultPlugin?: IDeviceClass): Promise<IDevicePlugin>;
    reloadPlugin(name: string): Promise<IDevicePlugin>;    
    regUrlPlugin(url: string, urlPlugin: IDeviceClass): IDeviceClass;
    getUrlPlugin(url: string): IDeviceClass;
    loadUrlPlugin(url: string): Promise<IDeviceClass>;    
    reloadUrlPlugin(url: string): Promise<IDeviceClass>;        
}

export interface IDeviceShadowEvent extends IBase  {
    input: IDeviceBusEvent
    output: IDeviceBusEvent
}

export interface IDeviceShadowEvents extends IBase  {
    south: IDeviceShadowEvent
    north: IDeviceShadowEvent    
    parent: IDeviceShadowEvent
    child: IDeviceShadowEvent
    config: IDeviceShadowEvent
}

export interface IDeviceShadow extends IBase {
    manager: IDeviceShadowManager
    device: IDeviceBase
    events: IDeviceShadowEvents
}

export interface IDeviceShadows extends IBase {
    manager: IDeviceShadowManager
    shadows: {[id: string] : IDeviceShadow}
    newShadow(model: string, id: string, pid?: string): Promise<IDeviceShadow>
    delShadow(id: string): boolean;
    getShadow(id: string): IDeviceShadow;
}

export interface IDeviceShadowManagerBusEvent extends IBase {
    south: IDeviceShadowEvent
    north: IDeviceShadowEvent    
    config: IDeviceShadowEvent
    notify: IDeviceShadowEvent
    plugins: IDeviceShadowEvent
    shadows: IDeviceShadowEvent
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

export interface IDeviceBase extends IBase, IDeviceBaseProp {
    id: string
    pid: string
    model: string
    props: {[name: string]: any}
    events: {[name: string]: any}
    services: {[name: string]: any}
    shadow: IDeviceShadow    
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