import { Base, IDeviceBase, IDeviceBaseProp, IDeviceShadow, IDeviceShadowEvents, IDeviceShadowManager, IDeviceShadows } from "./device.dts";
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

    newShadow(props: IDeviceBaseProp): Promise<IDeviceShadow> {
        let shadow = this.shadows[props.id];
        if (shadow) 
            return Promise.resolve(shadow)
        else {
            return new Promise((resolve, reject) => {
                this.manager.plugins.loadPlugin(props.model)
                .then(plugin => {
                    if (plugin && plugin.Plugin) {
                        shadow = new DeviceShadow(this.manager);
                        let device = new plugin.Plugin(props.id, props.pid, props.model) as IDeviceBase;
                        shadow.attachDevice(device);
                        this.shadows[props.id] = shadow;
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
        let shadow = this.shadows[id];
        delete this.shadows[id];
        if (shadow) {
            let device = shadow.device;
            shadow.detachDevice();
            if (device)               
                device.destroy();
            
            shadow.destroy();
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