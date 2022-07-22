import { DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusEventData, IDeviceShadow } from "../../device.dts";

export interface IDevice extends IDeviceBase {}

export class Device extends DeviceBase implements IDeviceBase {
    constructor(id: string, pid: string, model: string, shadow: IDeviceShadow) {
        super(id, pid, model, shadow);
        this.init();
    }
    onBusEventSouthInput = (msg: IDeviceBusEventData) => {
        console.log("Device  onBusEventSouthInput 111");
        //南面输入->北面输出
        // console.log(this)
        this.shadow.events.north.output.emit(msg);
    }

    init = () => {
        console.log(this)
        this.shadow.events.south.input.on(this.onBusEventSouthInput);
        // this.shadow.events.south.input.off(this.onBusEventSouthInput);
        console.log("Device init")
    }


    onBusEventNorInput(msg: IDeviceBusEventData) {
        console.log("Device  onBusEventNorInput");
        //北面输入->南面输出
        this.shadow.events.south.output.emit(msg);
    }    
}