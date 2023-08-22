import { IABDeviceModel } from "../model/ab-device";
import { NDClearLogs } from "./nd-devices";

export interface IABDevice{
    model: IABDeviceModel
}

export class ABDevice implements IABDevice {
    model: IABDeviceModel
    ndClearLogs: NDClearLogs = new NDClearLogs();
    constructor(model: IABDeviceModel){
        this.model = model;
    }

}