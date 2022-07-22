import EventEmitter = require("events")

export interface IBase {
    destroy: () => void; 
}

export interface IDeviceClass {
    new(id: string, pid: string, model: string, shadow: IDeviceShadow) : Object
}

export interface IDeviceModel {
    name: string
    url: string
    Device?: IDeviceClass
}

export interface IDeviceModelsEvent {
    name: string
    url: string
    Device?: IDeviceClass
}

export interface IDeviceModels extends IBase  {    
    manager: IDeviceShadowManager;
    models: {[name: string]: IDeviceModel}
    urlClasses: {[url: string]: IDeviceClass}
    defaultClass: IDeviceClass    
    regModel(name: string, url: string): IDeviceModel;
    getModel(name: string): IDeviceModel;
    loadModel(name: string, defaultClass?: IDeviceClass): Promise<IDeviceModel>;
    reloadModel(name: string): Promise<IDeviceModel>;    
    regUrlClass(url: string, urlClass: IDeviceClass): IDeviceClass;
    getUrlClass(url: string): IDeviceClass;
    loadUrlClass(url: string): Promise<IDeviceClass>;    
    reloadUrlClass(url: string): Promise<IDeviceClass>;        
}

export interface IDeviceAmdModels {
    [name: string]: string
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
    models: IDeviceShadowEvent
    shadows: IDeviceShadowEvent
}

export interface IDeviceShadowManager extends IBase  {
    models: IDeviceModels
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