import { Debuger, DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../device.dts";
import { Cmd, ICmd, ICmdHead } from "./cmd";
import { IPLFCoder, PLFCoder } from "./plf-coder";

export interface INDDevice extends IDeviceBase {
    coder: IPLFCoder
    recvcmd: ICmd;
    sendcmd: ICmd;
}

export class NDDevice extends DeviceBase implements INDDevice {
    static Plf_coder = new PLFCoder();
    coder: PLFCoder = new PLFCoder();
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
        Debuger.Debuger.log("NDDevice  on_south_input ");

        if (!msg.decoded && msg.payload) {
            if (this.recvcmd.decode(msg.payload)){
                let payload = this.on_south_input_decode(this.recvcmd.head, this.recvcmd.getPayload());
                payload.pld = NDDevice.Plf_coder.payload.decode(payload.pld);
                msg.payload = {
                    hd: payload.hd,
                    pld: payload.pld
                }
                msg.decoded = true;
            };
        }

        //父设备 todo...
        //父设备输出给子设备，msg.id = child.id
        //msg.id = child.id
        //this.events.parent.output.emit(msg); 

        //正常 todo...
        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_north_input");
        //todo ...
        console.log(msg.payload);
        if (!msg.encoded && msg.payload && !this.attrs.pid) {
            let payload: IDeviceBusDataPayload = this.on_north_input_encode(msg.payload.hd, msg.payload.pld);
            this.sendcmd.reset();
            msg.payload = this.sendcmd.encode(payload.hd, payload.pld);
            msg.encoded = true;
            console.log(msg.payload);
        }        
        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("NDDevice  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

    on_south_input_decode(p_hd: ICmdHead, p_pld: any): IDeviceBusDataPayload {
        let hd = this.coder.head.decode(p_hd);
        let pld = this.coder.payload.decode(p_pld);

        return {
            hd: hd,
            pld: pld
        }
    }

    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: any): IDeviceBusDataPayload {
        this.coder.head.reset();
        this.coder.payload.reset();  
        let hd = this.coder.head.encode(p_hd);
        let pld = this.coder.payload.encode(p_pld);
        return {
            hd: hd,
            pld: pld
        }
    }
}