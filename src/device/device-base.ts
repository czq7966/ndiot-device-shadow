import { IDeviceBase, IDeviceBusEventData, IDeviceShadow } from "./device.dts";

export class DeviceBase implements IDeviceBase {
    id: string;
    pid: string;
    model: string;
    props: { [name: string]: any; };
    events: { [name: string]: any; };
    services: { [name: string]: any; };
    shadow: IDeviceShadow;
    constructor(id: string, pid: string, model: string, shadow: IDeviceShadow) {
        this.id = id;
        this.pid = pid;
        this.model = model;
        this.shadow = shadow;
        this.init();
    }

    destroy = () => {
        this.uninit();
     
        console.log("DeviceBase destroy");
    }

    init = () => {


        if (this.shadow) {
            this.shadow.events.south.input.on(this.onBusEventSouthInput);
            this.shadow.events.north.input.on(this.onBusEventNorthInput);
            this.shadow.events.config.input.on(this.onBusEventConfigInput);
            this.shadow.events.parent.input.on(this.onBusEventParentInput);
            this.shadow.events.child.input.on(this.onBusEventChildInput);
        }


        console.log("DeviceBase init");

    }
    uninit() {
        if (this.shadow) {
            this.shadow.events.south.input.off(this.onBusEventSouthInput);
            this.shadow.events.north.input.off(this.onBusEventNorthInput);
            this.shadow.events.config.input.off(this.onBusEventConfigInput);
            this.shadow.events.parent.input.off(this.onBusEventParentInput);
            this.shadow.events.child.input.off(this.onBusEventChildInput);
        }   

    }

    onBusEventSouthInput = (msg: IDeviceBusEventData) => {
        console.log("DeviceBase  onBusEventSouthInput");
        // this.shadow.events.north.output.emit(msg);        
    }

    onBusEventNorthInput(msg: IDeviceBusEventData) {
        console.log("DeviceBase  onBusEventNorthInput");
    }

    onBusEventConfigInput(msg: IDeviceBusEventData) {
        console.log("DeviceBase  onBusEventConfigInput");
    }

    onBusEventParentInput(msg: IDeviceBusEventData) {
        console.log("DeviceBase  onBusEventParentInput");
    }

    onBusEventChildInput(msg: IDeviceBusEventData) {
        console.log("DeviceBase  onBusEventChildInput");
    }
    
    

}