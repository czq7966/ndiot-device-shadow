import { DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../device.dts";

export interface IDevice extends IDeviceBase {}

export class ACGree extends DeviceBase implements IDeviceBase {
    // onBusEventSouthInput(data: IDeviceBusEventData) {
    //     console.log("ACGree  onBusEventSouthInput");

    // }
}