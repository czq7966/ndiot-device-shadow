
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { ICoder } from "../../coders/rfir/ac-media/coder";
import { Debuger } from "../../nd-device";
import { IRFIRDeviceACMedia, RFIRDeviceACMedia } from "../ac-media/device";

export interface IRFIRDeviceACMediaND extends IRFIRDeviceACMedia {}

export  class RFIRDeviceACMediaND extends RFIRDeviceACMedia implements IRFIRDeviceACMediaND {

    //初始化
    init() {
        super.init();
        Debuger.Debuger.log("RFIRDeviceACMediaND init", this.attrs.id); 
        // setTimeout(() => { this.do_get_req_rfir_code(); }, 1000); 
        // setTimeout(() => { this.do_get_req_gpio();}, 5000);

    }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        Debuger.Debuger.log("RFIRDeviceACMediaND on_south_input_decode");
        let payload = super.on_south_input_decode(p_hd, p_pld); 
        let hd = payload.hd;
        if (hd.cmd_stp == 1) {
            if (hd.cmd_id == CmdId.config) 
                this.on_config_resp(payload.hd, payload.pld);
            if (hd.cmd_id == CmdId.get) 
                this.on_get_resp(payload.hd, payload.pld);
            if (hd.cmd_id == CmdId.set) 
                this.on_set_resp(payload.hd, payload.pld);
            if (hd.cmd_id == CmdId.get_gpio) 
                this.on_get_gpio_resp(payload.hd, payload.pld);
        }
        
        return payload;     
    }
  
    on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
        return super.on_north_input_encode(p_hd, p_pld);
    }  


    _do_get_req_gpio_handler: number = 0;
    do_get_req_gpio(){
        clearTimeout(this._do_get_req_gpio_handler);
        let pld = {};
        pld[PldTable.Keys.gpio_rw_pin] = 13;

        let payload: IDeviceBusDataPayload = {
            hd: {
                cmd_id: CmdId.get_gpio
            },
            pld: pld
        }

        let msg = {payload: payload};

        this.on_north_input(msg);

        //每一分钟，请求上报一次
        this._do_get_req_gpio_handler = setTimeout(() => {
            this.do_get_req_gpio();            
        }, 1000 * 10) as any;
    }

    do_get_req_rfir_code() {
        let len = this.media_coder.pnt_table.getRaw().length;
        let pld = {};
        for (let i = 0; i < len; i++) {
            pld[i] = 0;            
        }


        let payload: IDeviceBusDataPayload = {
            hd: {
                cmd_id: CmdId.get
            },
            pld: pld
        }

        let msg = {payload: payload};

        this.on_north_input(msg);
    }

    do_config_req_rfir_code() {
        let raw = this.media_coder.pnt_table.getRaw();
        let pld = {};
        for (let i = 0; i < raw.length; i++) {
            pld[i] = raw[i];
        }

        let payload: IDeviceBusDataPayload = {
            hd: {
                cmd_id: CmdId.config
            },
            pld: pld
        }

        let msg = {payload: payload};

        this.on_north_input(msg);
    }

    on_get_resp(hd: IDeviceBusDataPayloadHd, pld: {} ) {
        this.on_get_resp_rfir_code(hd, pld);
    }
    on_get_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}) {
        if (hd.cmd_id == CmdId.get && hd.cmd_stp == 1) {
            let len = this.media_coder.pnt_table.getRaw().length;
            let buf = [];
            for (let i = 0; i < len; i++) {
                if (pld && pld.hasOwnProperty(i.toString())) {
                    buf.push(pld[i]);
                }
            }

            if (buf.length == len) {
                this.media_coder.pnt_table.setRaw(Buffer.from(buf));
            }
        }
    }

    on_set_resp(hd: IDeviceBusDataPayloadHd, pld: {} ) {
        this.on_set_resp_rfir_code(hd, pld);
    }

    on_set_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}) {
        if (hd.cmd_id == CmdId.set && hd.cmd_stp == 1 && pld.hasOwnProperty(PldTable.Keys.rfir_send_repeat)) {
            this.do_config_req_rfir_code();
        }
    }
    on_config_resp(hd: IDeviceBusDataPayloadHd, pld: {} ) {
        this.on_config_resp_rfir_code(hd, pld);        
    }

    on_config_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {} ) {
        if (hd.cmd_id == CmdId.config && hd.cmd_stp == 1) {
            this.do_get_req_rfir_code();
            setTimeout(() => {
                this.do_get_req_gpio();                
            });
        }
    }


    on_get_gpio_resp(hd: IDeviceBusDataPayloadHd, pld: {}) {
        if (hd.cmd_id == CmdId.get_gpio && hd.cmd_stp == 1) {
            if (pld.hasOwnProperty(PldTable.Keys.gpio_rw_value)) {
                let value = pld[PldTable.Keys.gpio_rw_value]
                this.media_coder.pnt_table.setPower(value);

                let props = this.media_coder.plf_props.decode(this.media_coder.pnt_table);
                let payload: IDeviceBusDataPayload = {
                    hd: {
                        entry: {
                            type: "evt",
                            id: "report"
                        }
                    },
                    pld: props
                }
                let msg: IDeviceBusEventData = {
                    decoded: true,
                    payload: payload
                }

                this.events.north.output.emit(msg);

            }
        }

    }


    on_handshake_req(hd: IDeviceBusDataPayloadHd, pld: {}) {
        this.do_get_req_rfir_code();
    }

}