import * as Common from '../common'
import { IDeviceBase, IDeviceBusEventData, IDeviceClass, IDeviceModel, IDeviceModels, IDeviceShadow, IDeviceShadowEvent, IDeviceShadowEvents, IDeviceShadowManager, IDeviceShadows } from "./device.dts";
import { DeviceShadow, DeviceShadowEvent } from "./shadow";

export class DeviceModels implements IDeviceModels {
    manager: IDeviceShadowManager;
    models: { [id: string]: IDeviceModel } = {};
    urlClasses: { [url: string]: IDeviceClass} = {};
    defaultClass: IDeviceClass

    constructor(manager: IDeviceShadowManager) {
        this.manager = manager;
    }

    destroy = () => {

    }
    

    regModel(name: string, url: string): IDeviceModel {
        let model = this.models[name] || {
            name: name,
            url: url || ""
        };
        model.url = url || model.url || "";
        this.models[name] = model;
        return model;
    }

    getModel(name: string): IDeviceModel {
        let model =  this.models[name];
        if (model && !model.Device)
            model.Device = this.getUrlClass(model.url);
        return model;
    }    
    

    loadModel(name: string): Promise<IDeviceModel> {
        return new Promise((resolve, reject) => {
            let model = this.getModel(name);
            if (model) {
                model.Device = this.getUrlClass(model.url);
                if (model.Device) 
                    resolve(model);
                else {               
                    this.reloadUrlClass(model.url)
                    .then(Dev => {
                        model.Device = Dev;
                        resolve(model);
                    })
                    .catch(err => {
                        reject(err);
                    });
                }
            } else {
                if (this.defaultClass) {
                    model = {
                        name: name,
                        url: "",
                        Device: this.defaultClass
                    }
                    resolve(model);
                } else {
                    reject("error: model: " + name + " not regged, please reg it first");
                }
            }
        })
    }

 

    reloadModel(name: string): Promise<IDeviceModel> {
        return new Promise((resolve, reject) => {
            let model = this.getModel(name);
            if (model) {
                
                    Common.Amd.requirejs(model.url, [name, "Device"])
                    .then((modules: any) => {
                        model.Device = modules[name] || modules.Device || model.Device;
                        resolve(model);
                    })
                    .catch(err => {
                        reject(err);
                    })
            } else {
                return reject("error: model: " + name + " not regged, please reg it first");
            }
        })
    }

    regUrlClass(url: string, urlClass: IDeviceClass): IDeviceClass {
        this.urlClasses[url] = urlClass;
        return urlClass;
    }    

    getUrlClass(url: string): IDeviceClass {
        return this.urlClasses[url];        
    }

    loadUrlClass(url: string): Promise<IDeviceClass> {
        let model = this.getUrlClass(url);
        if (model) {
            if (model) 
                return Promise.resolve(model);
            else {
                return this.reloadUrlClass(url);
            }
        } else {
            return Promise.reject("error: model: " + name + " not regged, please reg it first");
        }        
    }    

    reloadUrlClass(url: string): Promise<IDeviceClass> {
        return new Promise((resolve, reject) => {
            Common.Amd.requirejs(url, [])
            .then((modules: {}) => {
                let names = Object.keys(modules);
                if (names.length > 0) {
                    let model = modules[names[0]]
                    this.urlClasses[url] = model;
                    resolve(model);
                } else {
                    reject("error: module not exported");
                }
            })
            .catch(err => {
                reject(err);
            })
        })
                
    }    

    on_events_input(msg: IDeviceBusEventData) {

    }
}