import EventEmitter = require("events");
import { UUID } from "./uuid";

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
    eventName = "";
    eventEmitter: EventEmitter;
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

export interface ITimeoutEventHandler {
    handler: string
    timeout: number
    listener: (...args: any[]) => void,
    args: any[]
}

export class TimeoutEvent  {
    eventHandlers: Array<ITimeoutEventHandler>
    currHandler: any;
    constructor() {
        this.eventHandlers = [];
    }

    destroy() {
        this.eventHandlers = [];
    }

    watchTimeout() {
        clearTimeout(this.currHandler);
        if (this.eventHandlers.length > 0) {
            const eventHandler = this.eventHandlers[0];
            const timeout = eventHandler.timeout;
            this.currHandler = setTimeout(() => {
                this.removeHandler(eventHandler.handler);
                eventHandler.listener(...eventHandler.args);
            }, timeout)
        }        
    }

    resortHandler() {
        this.eventHandlers.sort((a, b) => {
            return a.timeout < b.timeout ? -1 : 1;
        });
        this.watchTimeout();
    }

    addHandler(eventHandler: ITimeoutEventHandler) {
        this.eventHandlers.push(eventHandler);
        this.resortHandler();
    }

    removeHandler(handler: string) {
        for (let i = 0; i < this.eventHandlers.length; i++) {
            if (this.eventHandlers[i].handler === handler) {
                this.eventHandlers.splice(i, 1);
                break;
            }                
        }

        this.watchTimeout();        
    }

    delay(delay: number, listener: (...args: any[]) => void, ...args: any[]): string {
        const eventHandler: ITimeoutEventHandler = {
            handler: UUID.Guid(),
            timeout: delay,
            listener: listener,
            args: args
        }
        this.addHandler(eventHandler);

        return eventHandler.handler;        
    }

    off(handler: string) {
        this.removeHandler(handler);
    }
}

const GTimeoutEvent = new TimeoutEvent();
export { GTimeoutEvent };