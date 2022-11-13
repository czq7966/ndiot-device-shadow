
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { ICoder } from "../../coders/rfir/ac-media/coder";
import { Debuger } from "../../nd-device";
import { IRFIRDeviceACMedia, RFIRDeviceACMedia } from "../ac-media/device";

export class ExtraConst {
    static PowerPin = 13;
    static RfirCodeSid = 0xFFFFFFFF;
    static ReportTimeout = 1000 * 60;
}

export interface IRFIRDeviceACMediaND extends IRFIRDeviceACMedia {

}

export  class RFIRDeviceACMediaND extends RFIRDeviceACMedia implements IRFIRDeviceACMediaND {

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("RFIRDeviceACMediaND init ", this.attrs.id); 
        this.do_report_timeout(1000);

    }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        Debuger.Debuger.log("RFIRDeviceACMediaND on_south_input_decode");
        let payload = super.on_south_input_decode(p_hd, p_pld); 
        if (!payload) return;

        let hd = payload.hd;
        if (hd.cmd_stp == 1) {
            if (hd.cmd_id == CmdId.config) 
                return this.on_config_resp(payload.hd, payload.pld);
            if (hd.cmd_id == CmdId.get) 
                return this.on_get_resp(payload.hd, payload.pld);
            if (hd.cmd_id == CmdId.set) 
                return this.on_set_resp(payload.hd, payload.pld);
        }
        
        return payload;     
    }
  
    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
        let payload = super.on_north_input_encode(p_hd, p_pld);
        if (!payload) return;
        let hd = payload.hd;
        if (hd.cmd_id == CmdId.get && hd.entry && hd.entry.type == "svc" ) {  
            this.do_north_report(hd);
            this.do_get_req_rfir_code();
            return;
        }

        return payload;
    }  

    //向设备获取射频码
    do_get_req_rfir_code() {
        let len = this.ac_coder.pnt_table.getRaw().length;
        let pld = {};
        for (let i = 0; i < len; i++) {
            pld[i] = 0;            
        }
        pld[PldTable.Keys.gpio_rw_pin] = ExtraConst.PowerPin;

        let payload: IDeviceBusDataPayload = {
            hd: {
                cmd_id: CmdId.get, 
                cmd_sid: ExtraConst.RfirCodeSid
            },
            pld: pld
        }

        let msg = {payload: payload};

        this.on_north_input(msg);
    }

    //向设备设置射频码
    do_config_req_rfir_code() {
        let raw = this.ac_coder.pnt_table.getRaw(false, true);
        let pld = {};
        for (let i = 0; i < raw.length; i++) {
            pld[i] = raw[i];
        }

        let payload: IDeviceBusDataPayload = {
            hd: {
                cmd_id: CmdId.config,
                cmd_sid: ExtraConst.RfirCodeSid
            },
            pld: pld
        }

        let msg = {payload: payload};

        this.on_north_input(msg);
    }

    //北向查询上报状态
    do_north_report(phd?: IDeviceBusDataPayloadHd) {
        let hd: IDeviceBusDataPayloadHd;
        if (phd) {
             hd = Object.assign({}, phd);
             hd.stp = 1;
             this.plf_coder.head.clear_sids();
        }
        else hd = { entry: { type: "evt", id: "report" }};

        let props = this.ac_coder.plf_props.decode(this.ac_coder.pnt_table);
        let payload: IDeviceBusDataPayload = {
            hd: hd,
            pld: props
        }
        let msg: IDeviceBusEventData = {
            decoded: true,
            payload: payload
        }

        this.events.north.output.emit(msg);   

    }

    //定时获取上报
    _do_report_timeout: number = 0;
    do_report_timeout(timeout?: number) {
        timeout = timeout || ExtraConst.ReportTimeout;
        
        clearTimeout(this._do_report_timeout);
        this._do_report_timeout = setTimeout(() => {
            //获取射频码
            this.do_get_req_rfir_code();

            //1分钟后再获取
            this.do_report_timeout();            
        }, timeout) as any;


    }

    //Get指令响应处理
    on_get_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
        return this.on_get_resp_rfir_code(hd, pld);
    }

    //Get指令射频码处理
    on_get_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}): IDeviceBusDataPayload {
        if (hd.cmd_id == CmdId.get && hd.cmd_stp == 1 && hd.cmd_sid == ExtraConst.RfirCodeSid) {

            let len = this.ac_coder.pnt_table.getRaw().length;
            let buf = [];
            for (let i = 0; i < len; i++) {
                if (pld && pld.hasOwnProperty(i.toString())) {
                    buf.push(pld[i]);
                }
            }

            if (buf.length == len) {
                this.ac_coder.pnt_table.setRaw(Buffer.from(buf));
            }
            
            if (pld.hasOwnProperty(PldTable.Keys.gpio_rw_value)) {
                let value = pld[PldTable.Keys.gpio_rw_value];
                this.ac_coder.pnt_table.setPower(value);
            }

            this.do_north_report();
            return;

        }

        return {hd: hd, pld: pld}
    }

    //Set指令响应处理
    on_set_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
        return this.on_set_resp_rfir_code(hd, pld);
    }

    //Set指令射频码处理
    on_set_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}): IDeviceBusDataPayload {
        if (hd.cmd_id == CmdId.set && hd.cmd_stp == 1 ) {
            this.do_config_req_rfir_code();
        }
        return {hd: hd, pld: pld }
    }

    //Config指令处理
    on_config_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
        return this.on_config_resp_rfir_code(hd, pld);        
    }

    //Config指令射频码处理
    on_config_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
        if (hd.cmd_id == CmdId.config && hd.cmd_stp == 1 && hd.cmd_sid == ExtraConst.RfirCodeSid) {
            this.do_get_req_rfir_code();
            this.do_report_timeout(1000);
        }

        return ;
    }


}