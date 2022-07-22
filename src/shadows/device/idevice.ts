import EventEmitter = require("events")

export interface IDevice {
    id: string
    bus: {
        south: {
            input: EventEmitter
            output: EventEmitter
        },
        north: {
            input: EventEmitter
            output: EventEmitter
        },
        parent: {
            input: EventEmitter
            output: EventEmitter
        },
        child: {
            input: EventEmitter
            output: EventEmitter            
        }
    }
    
}