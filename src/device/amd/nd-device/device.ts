import { Debuger, DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../device.dts";
import { Cmd, ICmd } from "../coders/dev-bin-json/cmd";
import { ICmdHead } from "../coders/dev-bin-json/cmd-head";
import { IPldTable } from "../coders/dev-bin-json/pld-table";
import { IPLFCoder, PLFCoder } from "../coders/plf-json-dev/plf-coder";

export interface INDDevice extends IDeviceBase {
    plf_coder: IPLFCoder
    recvcmd: ICmd;
    sendcmd: ICmd;
}

export class NDDevice extends DeviceBase implements INDDevice {
    plf_coder: PLFCoder = new PLFCoder();
    recvcmd: Cmd = new Cmd();
    sendcmd: Cmd = new Cmd();

    //初始化
    init() {
        Debuger.Debuger.log("NDDevice init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("NDDevice uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_south_input ", this.attrs.id);

        if (!msg.decoded && msg.payload && !this.attrs.pid) {
            if (this.recvcmd.decode(msg.payload)){
                const payload = this.on_south_input_decode(this.recvcmd.head, this.recvcmd.payload);
                if (!payload) return;

                msg.payload = {
                    hd: payload.hd,
                    pld: payload.pld
                }
                msg.decoded = true;
                this.events.south.input.eventEmitter.emit(payload.hd.cmd_id.toString(), msg);
            }
        }

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        if (!msg.prevented)
            super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_north_input");

        if (!msg.encoded && msg.payload && !this.attrs.pid) {
            if (msg.payload.hd && msg.payload.hd.entry && msg.payload.hd.entry.id)
                this.events.north.input.eventEmitter.emit(msg.payload.hd.entry.id, msg);
            const payload: IDeviceBusDataPayload = this.on_north_input_encode(msg.payload.hd, msg.payload.pld);
            if (!payload) return;
            this.sendcmd.reset();
            msg.payload = this.sendcmd.encode(payload.hd, payload.pld);
            msg.encoded = true;
        }       
        if (!msg.prevented)
            super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        const hd = this.plf_coder.head.decode(p_hd);
        const pld = this.plf_coder.payload.decode(p_pld);

        return {
            hd: hd,
            pld: pld
        }
    }

    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
        this.plf_coder.head.reset();
        this.plf_coder.payload.reset();  
        const hd = this.plf_coder.head.encode(p_hd);
        const pld = this.plf_coder.payload.encode(p_pld);

        return {
            hd: hd && hd.head,
            pld: pld && pld.tables
        }
    }
}