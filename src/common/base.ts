import { BaseEvent, IBaseEvent } from "./events";

export interface IBase {
    onDestroy: IBaseEvent
    destroy(); 
}

export class Base implements IBase {
    onDestroy: IBaseEvent;
    constructor(){
        this.onDestroy = new BaseEvent();
    }
    destroy(){
        this.onDestroy.emit(this);
    }; 
}
