import EventEmitter = require("events");

export interface IBaseEvent  {
    eventName: string
    eventEmitter: EventEmitter;
    destroy();
    on(listener: (...args: any[]) => void, prepend?: boolean);
    once(listener: (...args: any[]) => void, prepend?: boolean);
    off(listener: (...args: any[]) => void);
    emit(...args: any[]);
}

export class BaseEvent implements IBaseEvent {
    eventName: string = "";
    eventEmitter: EventEmitter = new  EventEmitter();
    constructor() {
        this.eventEmitter = new  EventEmitter();
    }
    destroy(){
        this.eventEmitter.removeAllListeners();
    }
    on(listener: (...args: any[]) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependListener(this.eventName, listener);
        else
            this.eventEmitter.addListener(this.eventName, listener);   
    }
    once(listener: (...args: any[]) => void, prepend?: boolean) {
        if (prepend)
            this.eventEmitter.prependOnceListener(this.eventName, listener);
        else
            this.eventEmitter.once(this.eventName, listener);
    }
    off(listener: (...args: any[]) => void) {
        this.eventEmitter.off(this.eventName, listener);
    }
    emit(...args: any[]) {
        this.eventEmitter.emit(this.eventName, ...args);
    }
    
}