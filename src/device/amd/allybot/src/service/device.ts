import { IDeviceModel } from "../model/device";

export interface IDevice{
    model: IDeviceModel
}

export class Device implements IDevice {
    model: IDeviceModel
    constructor(model: IDeviceModel){
        this.model = model;
    }

}