import EventEmitter = require("events")
import { IBase, Base} from "../common/base";

export {IBase, Base}

export interface IDeviceClass {
    new(attrs: IDeviceBaseAttr) : Object
}

export interface IDevicePluginAttr {
    id: string
    url: string
}

export interface IDevicePlugin {
    attrs: IDevicePluginAttr
    Plugin?: IDeviceClass
}

export interface IDeviceUrlPlugin {
    url: string
    Plugin?: IDeviceClass
    promise?: Promise<IDeviceClass>
}


export interface IDevicePlugins extends IBase  {    
    manager: IDeviceShadowManager;
    plugins: {[id: string]: IDevicePlugin}
    urlPlugins: {[url: string]: IDeviceUrlPlugin}
    defaultPlugin: IDeviceClass    
    defaultPluginName: string
    regPlugin(attrs: IDevicePluginAttr): IDevicePlugin;
    getPlugin(id: string): IDevicePlugin;
    getPluginUrl(id: string): string
    loadPlugin(id: string, reload?: boolean): Promise<IDevicePlugin>;
    reloadPlugin(id: string): Promise<IDevicePlugin>;    
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
    newShadow(props: IDeviceBaseAttr): Promise<IDeviceShadow>
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

export interface IDeviceBaseAttr {
    id: string
    pid?: string
    model?: string
    app_id?: string
    dom_id?: string
    vendor?: string
    type?: string
    name?: string
    nick?: string
    desc?: string
}

export interface IDeviceBaseEvents extends IBase {
    south: IDeviceEntryEvent
    north: IDeviceEntryEvent    
    config: IDeviceEntryEvent
    notify: IDeviceEntryEvent
    parent: IDeviceEntryEvent
    child: IDeviceEntryEvent
}

export interface IDeviceBase extends IBase {
    attrs: IDeviceBaseAttr;
    props: {[name: string]: any}
    events: IDeviceBaseEvents    
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
    device?: IDeviceBase
}

export interface IDeviceBusEvent extends IBase {
    eventEmitter: EventEmitter;
    on(listener: (data: IDeviceBusEventData) => void, prepend?: boolean);
    once(listener: (data: IDeviceBusEventData) => void, prepend?: boolean);
    off(listener: (data: IDeviceBusEventData) => void);
    emit(data: IDeviceBusEventData);
}

export interface IDeviceBusDataPayloadHd {
    prep?: {},
    from?: {
        type?: string
        id?: string
    },
    to?: {
        type?: string
        id?: string
    },
    entry: {
        type: "evt" | "svc"
        id: string,
        name?: string
    },

    sid?: string
    stp?: 0 | 1,
    tms?: number
}

export interface IDeviceBusDataPayload {
    hd: IDeviceBusDataPayloadHd
    pld?: any
}