import * as Common from '../common'
import {Base, IDeviceBusEventData, IDeviceClass, IDevicePlugin, IDevicePlugins,  IDeviceShadowManager, IDeviceUrlPlugin } from "./device.dts";

export class DevicePlugins extends Base implements IDevicePlugins {
    manager: IDeviceShadowManager;
    plugins: { [id: string]: IDevicePlugin };
    urlPlugins: { [url: string]: IDeviceUrlPlugin};
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
    

    loadPlugin(name: string, reload?: boolean): Promise<IDevicePlugin> {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(name);
            if (!plugin || (!plugin.url && !plugin.Plugin)){
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
            } else {
                plugin.Plugin = this.getUrlPlugin(plugin.url);
                if (plugin.Plugin) 
                    resolve(plugin);
                else {       
                    let url = this.getPluginUrl(name);
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

    getPluginUrl(name: string): string {
        let _getUrl = (_name) => {
            let _plugin = this.getPlugin(_name);
            return _plugin ? _plugin.url : "";
        }        

        let url = _getUrl(name);
        let url2 = "";
        if (url && url != name) url2 = _getUrl(url);
        if (url2 && url2 != name && url2 != url) {
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
        console.log("reloadUrlPlugin",url)
        let urlPlugin = this.urlPlugins[url] || {url: url};
        this.urlPlugins[url]= urlPlugin;
        let promise = new Promise<IDeviceClass>((resolve, reject) => {
            Common.Amd.requirejs(url, [])
            .then((modules: {}) => {
                urlPlugin.promise = null;
                let names = Object.keys(modules);
                if (names.length > 0) {
                    let plugin = modules[names[0]]
                    urlPlugin.Plugin = plugin;
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