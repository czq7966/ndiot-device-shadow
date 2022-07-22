import EventEmitter = require("events");
import { IDeviceBusEvent, IDeviceBusEventData } from "./device.dts";

export class DeviceBusEvent implements IDeviceBusEvent {
    eventName: string = "";
    eventEmitter: EventEmitter;
    constructor() {
        this.eventEmitter = new EventEmitter();
    }
    destroy = () => {
        this.eventEmitter.removeAllListeners();        
    }
    on(listener: (data: IDeviceBusEventData) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependListener(this.eventName, listener);
        else
            this.eventEmitter.addListener(this.eventName, listener);        
    }
    once(listener: (data: IDeviceBusEventData) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependOnceListener(this.eventName, listener);
        else
            this.eventEmitter.once(this.eventName, listener);
    }
    off(listener: (data: IDeviceBusEventData) => void) {
        this.eventEmitter.off(this.eventName, listener);
    }
    emit(data: IDeviceBusEventData) {
        this.eventEmitter.emit(this.eventName, data);
    }
}