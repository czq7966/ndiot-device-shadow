import { DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusEventData } from "../../device.dts";

export type IDevice = IDeviceBase

export class ACGree extends DeviceBase implements IDevice {
    // onBusEventSouthInput(data: IDeviceBusEventData) {
    //     console.log("ACGree  onBusEventSouthInput");

    // }
}