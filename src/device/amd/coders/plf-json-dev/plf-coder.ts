import { IPlfHead, PlfHead } from "./plf-head"
import { IPlfPayload, PlfPayload } from "./plf-payload"

export interface IPLFCoder {
    head: IPlfHead
    payload: IPlfPayload
}


export class PLFCoder implements IPLFCoder {
    head: IPlfHead
    payload: IPlfPayload
    constructor() {
        this.head = new PlfHead();
        this.payload = new PlfPayload();
    }

}

