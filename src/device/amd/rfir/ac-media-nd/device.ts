
import { IDeviceBusDataPayload, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { PldTable } from "../../coders/dev-bin-json/pld-table";
import { Coder, ICoder } from "../../coders/rfir/ac-media/coder";
import { PntTable } from "../../coders/rfir/ac-media/pnt-table";
import { Debuger } from "../../nd-device";
import { RFIRDevice } from "../device";

export class ExtraConst {
    static PowerPin = 13;
    static RfirCodeSid = 0xFFFFFFFF;
    static ReportTimeout = 1000 * 60;
}


export  class RFIRDeviceACMediaND extends RFIRDevice {
    ac_coder: ICoder

    //初始化
    init() {
        this.ac_coder = new Coder();    
        this.rfir_coder = this.ac_coder.rfir_coder;    
        
        Debuger.Debuger.log("RFIRDeviceACMediaND init ", this.attrs.id); 
        //南向输入
            //上线
            this.events.south.input.eventEmitter.on(CmdId.online.toString(), (msg: IDeviceBusEventData) => {
                this.on_south_cmd_online(msg);
                return;
            })    

            //上报
            this.events.south.input.eventEmitter.on(CmdId.report.toString(), (msg: IDeviceBusEventData) => {
                this.on_south_cmd_report(msg);
                return;
            })    
            
            //查询响应
            this.events.south.input.eventEmitter.on(CmdId.get.toString(), (msg: IDeviceBusEventData) => {
                this.on_south_cmd_get(msg);
                return;
            })   

            //设置响应
            this.events.south.input.eventEmitter.on(CmdId.set.toString(), (msg: IDeviceBusEventData) => {
                this.on_south_cmd_set(msg);
                return;
            })   

            //采集事件
            this.events.south.input.eventEmitter.on(CmdId.rfir_sniff.toString(), (msg: IDeviceBusEventData) => {
                this.on_south_cmd_rfir_sniff(msg);
                return;
            }) 

        //北向输入
            //查询请求
            this.events.north.input.eventEmitter.on(CmdId.Names[CmdId.get], (msg: IDeviceBusEventData) => {
                this.on_north_cmd_get(msg);
                return;
            })

            //设置请求
            this.events.north.input.eventEmitter.on(CmdId.Names[CmdId.set], (msg: IDeviceBusEventData) => {
                this.on_north_cmd_set(msg);
                return;
            })

        //1秒后
        setTimeout(() => {
            //配置定时上报
            this.do_south_cmd_report_reg();     
            //北向查询
            this.on_north_input({payload:{hd:{entry:{id:"get"}}}});       
        }, 1000);

    } 
    //南向处理
        //设备上线
        on_south_cmd_online(msg: IDeviceBusEventData) {
            //配置定时上报
            this.do_south_cmd_report_reg()
            return;
        }   

        //配置定时上报
        do_south_cmd_report_reg() {
            const pldTable = new PldTable();
            const len = this.ac_coder.pnt_table.getRaw().length;
            //状态数据位寄存器
            for (let i = 0; i < len; i++) {
                pldTable.tables[i] = 0;            
            }
            pldTable.tables[PldTable.Keys.gpio_rw_pin] = ExtraConst.PowerPin;

            const pld = {};
            pld[PldTable.Keys.report_reg_enable] = 1;   //开启定时上报
            pld[PldTable.Keys.report_reg_timeout] = 60;  //间隔时间，秒
            pld[PldTable.Keys.report_reg_data] = pldTable.encode(); //上报的寄存器列表

            const payload: IDeviceBusDataPayload = {
                hd: {
                    cmd_id: CmdId.config
                },
                pld: pld
            }

            const msg = {payload: payload};

            this.on_north_input(msg);
            
            
            return;
        }

        //设备数据上报
        on_south_cmd_report(msg: IDeviceBusEventData) {
            //空调状态解码
            this.do_decode_status(msg.payload.pld);
            //北向上报
            this.do_north_report();
            //中断旧流程
            msg.prevented = true;
            return;
        }  

   
        //空调状态解码
        do_decode_status(pld: {}){
            const len = this.ac_coder.pnt_table.getRaw().length;
            const buf = [];
            for (let i = 0; i < len; i++) {
                if (pld && Object.prototype.hasOwnProperty.call(pld, i.toString())) {
                    buf.push(pld[i]);
                }
            }

            if (buf.length == len) {
                if (buf.length == len) {
                    const pnttable = new PntTable();
                    pnttable.setRaw(Buffer.from(buf));

                    this.ac_coder.pnt_table.setPower(pnttable.getPower());
                    this.ac_coder.pnt_table.setMode(pnttable.getMode());
                    this.ac_coder.pnt_table.setTemp(pnttable.getTemp());
                    this.ac_coder.pnt_table.setFan(pnttable.getFan());
                }                
                this.ac_coder.pnt_table.setRaw(Buffer.from(buf));
            }
            
            if (Object.prototype.hasOwnProperty.call(pld, PldTable.Keys.gpio_rw_value)) {
                const value = pld[PldTable.Keys.gpio_rw_value];
                this.ac_coder.pnt_table.setPower(value);
            }

        }

        //查询响应
        on_south_cmd_get(msg: IDeviceBusEventData) {
            //空调状态解码
            this.do_decode_status(msg.payload.pld);
            //北向查询上报
            this.do_north_report(msg.payload.hd);
            //中断旧流程
            msg.prevented = true;
            return;
        }    

        //设置响应
        on_south_cmd_set(msg: IDeviceBusEventData) {
            const hd = msg.payload.hd as IDeviceBusDataPayloadHd;
            //用户发起设置
            if (hd.sid) {
                //保存状态寄存器
                this.do_config_rfir_code();
            }
            return;
        }    

        //采集事件
        on_south_cmd_rfir_sniff(msg: IDeviceBusEventData) {
            const payload = msg.payload as IDeviceBusDataPayload;
            let   pld = payload.pld;
            const data = pld[PldTable.Keys.rfir_sniff_data] as Buffer;    
            if (data) {
                //射频解码
                const codes = this.rfir_coder.decode(data);
                if (codes) {                    
                    //更新数据位
                    if (this.ac_coder.pnt_table.decodeBytess(codes)) {
                        this.ac_coder.plf_props.decode(this.ac_coder.pnt_table);
                        pld = this.ac_coder.plf_props.props;

                        //保存状态寄存器
                        this.do_config_rfir_code();
                    }
                }

            }
            payload.pld = pld;
            return;
        }

        //保存状态寄存器
        do_config_rfir_code() {
            const raw = this.ac_coder.pnt_table.getRaw(false, true);
            const pld = {};
            for (let i = 0; i < raw.length; i++) {
                pld[i] = raw[i];
            }

            const payload: IDeviceBusDataPayload = {
                hd: {
                    cmd_id: CmdId.config
                },
                pld: pld
            }

            const msg = {payload: payload};

            this.on_north_input(msg);
        }

    //北向处理
        //北向上报状态
        do_north_report(phd?: IDeviceBusDataPayloadHd) {
            let hd: IDeviceBusDataPayloadHd;
            if (phd) {
                 hd = Object.assign({}, phd);
                 hd.stp = 1;
                 this.plf_coder.head.clear_sids();
            }
            else hd = { entry: { type: "evt", id: "report" }};
    
            const props = this.ac_coder.plf_props.decode(this.ac_coder.pnt_table, {});
            const payload: IDeviceBusDataPayload = {
                hd: hd,
                pld: props
            }
            const msg: IDeviceBusEventData = {
                decoded: true,
                payload: payload
            }
    
            this.events.north.output.emit(msg);  
        }

        //北向查询，请求状态寄存器
        on_north_cmd_get(msg: IDeviceBusEventData) {
            const pld = msg.payload.pld || {} as IDeviceBusDataPayload;
            const len = this.ac_coder.pnt_table.getRaw().length;
            //状态数据位寄存器
            for (let i = 0; i < len; i++) {
                pld[i] = 0;            
            }

            //开关状态GPIO引脚
            pld[PldTable.Keys.gpio_rw_pin] = ExtraConst.PowerPin;

            msg.payload.pld = pld;

            return;
        }
        
        //北向设置请求，设置射频码
        on_north_cmd_set(msg: IDeviceBusEventData) {
            const pld = msg.payload.pld || {} as IDeviceBusDataPayload;
            //状态数据位设置
            const pnttable = this.ac_coder.plf_props.encode(pld, this.ac_coder.pnt_table);
            pnttable.checksum()

            //状态射频码编码
            const bytess = pnttable.encodeBytess();
            const buf = this.rfir_coder.encode(bytess);
            
            if (buf && buf.length > 0) {
                //须发两遍才生效
                pld[PldTable.Keys.rfir_send_repeat] = 1;
                pld[PldTable.Keys.rfir_send_data] = buf;   
            }

            msg.payload.pld = pld;

            return;
        }



    // _on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
    //     Debuger.Debuger.log("RFIRDeviceACMediaND on_south_input_decode");
    //     const payload = super.on_south_input_decode(p_hd, p_pld); 
    //     if (!payload) return;

    //     const hd = payload.hd;
    //     if (hd.cmd_stp == 1) {
    //         if (hd.cmd_id == CmdId.config) 
    //             return this.on_config_resp(payload.hd, payload.pld);
    //         if (hd.cmd_id == CmdId.get) 
    //             return this.on_get_resp(payload.hd, payload.pld);
    //         if (hd.cmd_id == CmdId.set) 
    //             return this.on_set_resp(payload.hd, payload.pld);
    //     }
        
    //     return payload;     
    // }
  
    // _on_north_input_encode(p_hd: IDeviceBusDataPayloadHd, p_pld: {}): IDeviceBusDataPayload {
    //     const payload = super.on_north_input_encode(p_hd, p_pld);
    //     if (!payload) return;
    //     const hd = payload.hd;
    //     if (hd.cmd_id == CmdId.get && hd.entry && hd.entry.type == "svc" ) {  
    //         this.do_north_report(hd);
    //         this.do_get_req_rfir_code();
    //         return;
    //     }

    //     return payload;
    // }  

    // //向设备获取射频码
    // do_get_req_rfir_code() {
    //     const len = this.ac_coder.pnt_table.getRaw().length;
    //     const pld = {};
    //     for (let i = 0; i < len; i++) {
    //         pld[i] = 0;            
    //     }
    //     pld[PldTable.Keys.gpio_rw_pin] = ExtraConst.PowerPin;

    //     const payload: IDeviceBusDataPayload = {
    //         hd: {
    //             cmd_id: CmdId.get, 
    //             cmd_sid: ExtraConst.RfirCodeSid
    //         },
    //         pld: pld
    //     }

    //     const msg = {payload: payload};

    //     this.on_north_input(msg);
    // }

    // //向设备设置射频码
    // do_config_req_rfir_code() {
    //     const raw = this.ac_coder.pnt_table.getRaw(false, true);
    //     const pld = {};
    //     for (let i = 0; i < raw.length; i++) {
    //         pld[i] = raw[i];
    //     }

    //     const payload: IDeviceBusDataPayload = {
    //         hd: {
    //             cmd_id: CmdId.config,
    //             cmd_sid: ExtraConst.RfirCodeSid
    //         },
    //         pld: pld
    //     }

    //     const msg = {payload: payload};

    //     this.on_north_input(msg);
    // }



    // //定时获取上报
    // _do_report_timeout = 0;
    // do_report_timeout(timeout?: number) {
    //     timeout = timeout || ExtraConst.ReportTimeout;
        
    //     clearTimeout(this._do_report_timeout);
    //     this._do_report_timeout = setTimeout(() => {
    //         //获取射频码
    //         this.do_get_req_rfir_code();

    //         //1分钟后再获取
    //         this.do_report_timeout();            
    //     }, timeout) as any;


    // }

    // //Get指令响应处理
    // on_get_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
    //     return this.on_get_resp_rfir_code(hd, pld);
    // }

    // //Get指令射频码处理
    // on_get_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}): IDeviceBusDataPayload {
    //     if (hd.cmd_id == CmdId.get && hd.cmd_stp == 1 && hd.cmd_sid == ExtraConst.RfirCodeSid) {

    //         const len = this.ac_coder.pnt_table.getRaw().length;
    //         const buf = [];
    //         for (let i = 0; i < len; i++) {
    //             if (pld && Object.prototype.hasOwnProperty.call(pld, i.toString())) {
    //                 buf.push(pld[i]);
    //             }
    //         }

    //         if (buf.length == len) {
    //             if (buf.length == len) {
    //                 const pnttable = new PntTable();
    //                 pnttable.setRaw(Buffer.from(buf));
    
    //                 this.ac_coder.pnt_table.setPower(pnttable.getPower());
    //                 this.ac_coder.pnt_table.setMode(pnttable.getMode());
    //                 this.ac_coder.pnt_table.setTemp(pnttable.getTemp());
    //                 this.ac_coder.pnt_table.setFan(pnttable.getFan());
    //             }                
    //             this.ac_coder.pnt_table.setRaw(Buffer.from(buf));
    //         }
            
    //         if (Object.prototype.hasOwnProperty.call(pld, PldTable.Keys.gpio_rw_value)) {
    //             const value = pld[PldTable.Keys.gpio_rw_value];
    //             this.ac_coder.pnt_table.setPower(value);
    //         }

    //         this.do_north_report();
    //         return;

    //     }

    //     return {hd: hd, pld: pld}
    // }

    // //Set指令响应处理
    // on_set_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
    //     return this.on_set_resp_rfir_code(hd, pld);
    // }

    // //Set指令射频码处理
    // on_set_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {}): IDeviceBusDataPayload {
    //     if (hd.cmd_id == CmdId.set && hd.cmd_stp == 1 ) {
    //         this.do_config_req_rfir_code();
    //     }
    //     return {hd: hd, pld: pld }
    // }

    // //Config指令处理
    // on_config_resp(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
    //     return this.on_config_resp_rfir_code(hd, pld);        
    // }

    // //Config指令射频码处理
    // on_config_resp_rfir_code(hd: IDeviceBusDataPayloadHd, pld: {} ): IDeviceBusDataPayload {
    //     if (hd.cmd_id == CmdId.config && hd.cmd_stp == 1 && hd.cmd_sid == ExtraConst.RfirCodeSid) {
    //         this.do_get_req_rfir_code();
    //         this.do_report_timeout(1000);
    //     }

    //     return ;
    // }


}