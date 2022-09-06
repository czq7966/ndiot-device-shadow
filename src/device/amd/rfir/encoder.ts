import { IBaseEvent } from "../../../common/events";

export interface IRFIREncoderParams {
    nbits: number,
    headermark: number,
    headerspace: number,
    onemark: number,
    onespace: number,
    zeromark: number,
    zerospace: number,
    footermark: number,
    footerspace: number,
    MSBfirst: boolean,
    step: number,
    lastspace: number,
}

export interface IRFIREncoderEvents {
    onEncoded: IBaseEvent
}

export interface IRFIREncoder {

}

export class RFIREncoder {

}