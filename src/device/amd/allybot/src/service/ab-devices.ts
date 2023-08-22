import { ABApi } from "../api/ab-api";
import { IABDeviceModel } from "../model/ab-device";
import { ABDevice, IABDevice } from "./ab-device";

export class ABDevices {
    static items: {[id: string] : IABDevice} = {}
    static ids(): string[] {
        return Object.keys(this.items);
    }
    static async updateBase(){
        return new Promise((resolve, reject)=>{
            ABApi.deviceList()
            .then((data: any)=>{
                let list = data.data.list as [];
                let promises = [];
                for (let i = 0; i < list.length; i++) {
                    let dev = list[i] as any;
                    let promise = ABApi.deviceInfo(dev.deviceSN)
                    .then((info: any) => {
                        let device = new ABDevice(info.data as IABDeviceModel);
                        this.items[device.model.software.id] = device; 
                    })

                    promises.push(promise);                    
                }

                Promise.all(promises)
                .then(()=>{
                    resolve(this.items);
                })
                .catch(e=>{
                    reject(e);
                })
    
            })   
            .catch((e)=>{
                reject(e);
            })
        })

    }
}