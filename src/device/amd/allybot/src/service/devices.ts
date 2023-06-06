import { Api } from "../api";
import { IDeviceModel } from "../model/device";
import { Device, IDevice } from "./device";

export class Devices {
    static items: {[id: string] : IDevice} = {}
    static async updateBase(){
        return new Promise((resolve, reject)=>{
            Api.deviceList()
            .then((data: any)=>{
                let list = data.data.list as [];
                let promises = [];
                for (let i = 0; i < list.length; i++) {
                    let dev = list[i] as any;
                    let promise = Api.deviceInfo(dev.deviceSN)
                    .then((info: any) => {
                        let device = new Device(info.data as IDeviceModel);
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