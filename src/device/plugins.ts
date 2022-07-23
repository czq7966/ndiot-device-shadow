import * as Common from '../common'
import {Base, IDeviceBusEventData, IDeviceClass, IDevicePlugin, IDevicePlugins,  IDeviceShadowManager } from "./device.dts";

export class DevicePlugins extends Base implements IDevicePlugins {
    manager: IDeviceShadowManager;
    plugins: { [id: string]: IDevicePlugin };
    urlPlugins: { [url: string]: IDeviceClass};
    defaultPlugin: IDeviceClass

    constructor(manager: IDeviceShadowManager) {
        super();
        this.plugins = {};
        this.urlPlugins = {};
        this.manager = manager;
    }

    destroy() {
        super.destroy();
    }
    

    regPlugin(name: string, url: string): IDevicePlugin {
        let plugin = this.plugins[name] || {
            name: name,
            url: url || ""
        };
        plugin.url = url || plugin.url || "";
        this.plugins[name] = plugin;
        return this.getPlugin(name);
    }

    getPlugin(name: string): IDevicePlugin {
        let plugin =  this.plugins[name];
        if (plugin && !plugin.Plugin)
            plugin.Plugin = this.getUrlPlugin(plugin.url);
        return plugin;
    }    
    

    loadPlugin(name: string): Promise<IDevicePlugin> {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(name);
            if (plugin) {
                plugin.Plugin = this.getUrlPlugin(plugin.url);
                if (plugin.Plugin) 
                    resolve(plugin);
                else {               
                    this.reloadUrlPlugin(plugin.url)
                    .then(Dev => {
                        plugin.Plugin = Dev;
                        resolve(plugin);
                    })
                    .catch(err => {
                        reject(err);
                    });
                }
            } else {
                if (this.defaultPlugin) {
                    plugin = {
                        name: name,
                        url: "",
                        Plugin: this.defaultPlugin
                    }
                    resolve(plugin);
                } else {
                    reject("error: plugin: " + name + " not regged, please reg it first");
                }
            }
        })
    }

 

    reloadPlugin(name: string): Promise<IDevicePlugin> {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(name);
            if (plugin) {
                
                    Common.Amd.requirejs(plugin.url, [name, "Device"])
                    .then((modules: any) => {
                        plugin.Plugin = modules[name] || modules.Device || plugin.Plugin;
                        resolve(plugin);
                    })
                    .catch(err => {
                        reject(err);
                    })
            } else {
                return reject("error: plugin: " + name + " not regged, please reg it first");
            }
        })
    }

    regUrlPlugin(url: string, urlPlugin: IDeviceClass): IDeviceClass {
        this.urlPlugins[url] = urlPlugin;
        return urlPlugin;
    }    

    getUrlPlugin(url: string): IDeviceClass {
        return this.urlPlugins[url];        
    }

    loadUrlPlugin(url: string): Promise<IDeviceClass> {
        let plugin = this.getUrlPlugin(url);
        if (plugin) {
            if (plugin) 
                return Promise.resolve(plugin);
            else {
                return this.reloadUrlPlugin(url);
            }
        } else {
            return Promise.reject("error: plugin: " + name + " not regged, please reg it first");
        }        
    }    

    reloadUrlPlugin(url: string): Promise<IDeviceClass> {
        return new Promise((resolve, reject) => {
            Common.Amd.requirejs(url, [])
            .then((modules: {}) => {
                let names = Object.keys(modules);
                if (names.length > 0) {
                    let plugin = modules[names[0]]
                    this.urlPlugins[url] = plugin;
                    resolve(plugin);
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