import { IDeviceBase, IDeviceShadow, IDeviceShadowEvents, IDeviceShadowManager, IDeviceShadows } from "./device.dts";
import { DeviceShadow } from "./shadow";

export class DeviceShadows implements IDeviceShadows {
    manager: IDeviceShadowManager;
    shadows: { [id: string]: IDeviceShadow; } = {};

    constructor(manager: IDeviceShadowManager) {
        this.manager = manager;
    }
    destroy = () => {
        this.delAllShadows();        
    }

    newShadow(modelName: string, id: string, pid?: string): Promise<IDeviceShadow> {
        let shadow = this.shadows[id];
        if (shadow) 
            return Promise.resolve(shadow)
        else {
            return new Promise((resolve, reject) => {
                this.manager.models.loadModel(modelName)
                .then(model => {
                    if (model && model.Device) {
                        shadow = new DeviceShadow(this.manager);
                        let device = new model.Device(id, pid, modelName, shadow) as IDeviceBase;
                        shadow.device = device;
                        this.shadows[id] = shadow;
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