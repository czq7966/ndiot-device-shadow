import { Debuger } from "./device-base";
import { Base, IDeviceBase, IDeviceBaseAttr, IDeviceShadow, IDeviceShadowEvents, IDeviceShadowManager, IDeviceShadows } from "./device.dts";
import { DeviceShadow } from "./shadow";

export class DeviceShadows extends Base implements IDeviceShadows {
    manager: IDeviceShadowManager;
    shadows: { [id: string]: IDeviceShadow; };

    constructor(manager: IDeviceShadowManager) {
        super();
        this.shadows = {};
        this.manager = manager;
    }
    destroy() {
        this.delAllShadows();        
        super.destroy();
    }

    newShadow(attrs: IDeviceBaseAttr): Promise<IDeviceShadow> {
        let shadow = this.shadows[attrs.id];
        if (shadow && shadow.device.attrs.pid === attrs.pid && shadow.device.attrs.model === attrs.model) 
            return Promise.resolve(shadow)
        else {
            if (shadow) this.delShadow(attrs.id);
            return new Promise((resolve, reject) => {
                this.manager.plugins.loadPlugin(attrs.model)
                .then(plugin => {
                    if (plugin && plugin.Plugin) {
                        shadow = new DeviceShadow(this.manager);
                        const device = new plugin.Plugin(attrs) as IDeviceBase;
                        shadow.attachDevice(device);
                        this.shadows[attrs.id] = shadow;
                        resolve(shadow);
                    } else {
                        reject("no export Device class")
                    }        
                })
                .catch(err => {
                    reject(err);    
                })    
            })
        }
    }
    delShadow(id: string): boolean {
        const shadow = this.shadows[id];
        delete this.shadows[id];
        if (shadow) {
            const device = shadow.device;
            shadow.detachDevice();
            if (device)               
                device.destroy();
            
            shadow.destroy();
        } else {
            Debuger.Debuger.log(" delShadow no shadow", id);
        }
        return true;
    }
    delAllShadows(): boolean {
        Object.keys(this.shadows).forEach(id => {
            this.delShadow(id);
        })
        return true;
    }    
    getShadow(id: string): IDeviceShadow {
        return this.shadows[id];
    }

}