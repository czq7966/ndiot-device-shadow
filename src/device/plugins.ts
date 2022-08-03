import * as Common from '../common'
import { Debuger } from './device-base';
import {Base, IDeviceBusEventData, IDeviceClass, IDevicePlugin, IDevicePluginAttr, IDevicePlugins,  IDeviceShadowManager, IDeviceUrlPlugin } from "./device.dts";

export class DevicePlugins extends Base implements IDevicePlugins {
    manager: IDeviceShadowManager;
    plugins: { [id: string]: IDevicePlugin };
    urlPlugins: { [url: string]: IDeviceUrlPlugin};
    defaultPlugin: IDeviceClass
    defaultPluginName: string

    constructor(manager: IDeviceShadowManager) {
        super();
        this.defaultPluginName = "Device";
        this.plugins = {};
        this.urlPlugins = {};
        this.manager = manager;
    }

    destroy() {
        super.destroy();
    }
    

    regPlugin(attrs: IDevicePluginAttr): IDevicePlugin {
        let plugin: IDevicePlugin = this.plugins[attrs.id] || { attrs: attrs };
        plugin.attrs = attrs;
        this.plugins[attrs.id] = plugin;
        return this.getPlugin(attrs.id);
    }

    getPlugin(id: string): IDevicePlugin {
        let plugin =  this.plugins[id];
        if (plugin && !plugin.Plugin)
            plugin.Plugin = this.getUrlPlugin(plugin.attrs.url);
        return plugin;
    }    
    

    loadPlugin(id: string, reload?: boolean): Promise<IDevicePlugin> {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(id);
            if (!plugin || (!plugin.attrs.url && !plugin.Plugin)){
                if (this.defaultPlugin) {
                    plugin = {
                        attrs: {id: id, url: ""},
                        Plugin: this.defaultPlugin
                    }
                    resolve(plugin);
                } else {
                    reject("error: plugin: " + name + " not regged, please reg it first");
                }
            } else {
                plugin.Plugin = this.getUrlPlugin(plugin.attrs.url);
                if (plugin.Plugin) 
                    resolve(plugin);
                else {       
                    let url = this.getPluginUrl(id);
                    let promise = reload ? this.reloadUrlPlugin(url) : this.loadUrlPlugin(url);
                    promise
                    .then( _Plugin => {
                        plugin.Plugin = _Plugin;
                        resolve(plugin);
                    })
                    .catch(err => {
                        reject(err)
                    })
                }
            } 
        })
    }

    getPluginUrl(id: string): string {
        let _getUrl = (_id) => {
            let _plugin = this.getPlugin(_id);
            return _plugin ? _plugin.attrs.url : "";
        }        

        let url = _getUrl(id);
        let url2 = "";
        if (url && url != id) url2 = _getUrl(url);
        if (url2 && url2 != id && url2 != url) {
            url = this.getPluginUrl(url2) || url2;
        }
        return url;
    }

    reloadPlugin(name: string): Promise<IDevicePlugin> {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(name);
            let url = this.getPluginUrl(name);
            if (plugin && url) {
                    this.reloadUrlPlugin(url)
                    .then((_plugin) => {
                        plugin.Plugin = _plugin;
                        resolve(plugin)
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
        this.urlPlugins[url] = {url: url, Plugin: urlPlugin};
        return urlPlugin;
    }    

    getUrlPlugin(url: string): IDeviceClass {
        let urlPlugin =this.urlPlugins[url];
        if (urlPlugin)
            return urlPlugin.Plugin;
        return null;
    }

    loadUrlPlugin(url: string): Promise<IDeviceClass> {
        let urlPlugin =this.urlPlugins[url];
        if (urlPlugin) {
            if (urlPlugin.Plugin) 
                return Promise.resolve(urlPlugin.Plugin);
            else {
                if (urlPlugin.promise)
                    return urlPlugin.promise;
                else
                    return this.reloadUrlPlugin(url);
            }
        } else {
            return this.reloadUrlPlugin(url);
        }        
    }    

    reloadUrlPlugin(url: string): Promise<IDeviceClass> {     
        Debuger.Debuger.log("reloadUrlPlugin",url)
        let urlPlugin = this.urlPlugins[url] || {url: url};
        this.urlPlugins[url]= urlPlugin;
        let promise = new Promise<IDeviceClass>((resolve, reject) => {
            Common.Amd.requirejs(url, [])
            .then((modules: {}) => {
                urlPlugin.promise = null;
                let names = Object.keys(modules);
                if (names.length > 0) {
                    let name = names[0];
                    if (name === "Debuger" && names.length > 1) name = names[1];                    
                    let plugin = modules[this.defaultPluginName] || modules[name];
                    urlPlugin.Plugin = plugin;

                    if (name != "Debuger" && modules["Debuger"])
                        modules["Debuger"].Debuger = console;

                    resolve(plugin);
                } else {
                    reject("error: module not exported");
                }
            })
            .catch(err => {
                urlPlugin.promise = null;
                reject(err);
            })
        })
        urlPlugin.promise = promise;

        return promise;
                
    }    

    on_events_input(msg: IDeviceBusEventData) {

    }
}