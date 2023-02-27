import { Debuger } from "../../../device-base";
import { IDeviceBaseAttr, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { Cmd, CmdId } from "../../coders/dev-bin-json/cmd";
import { PldTable } from "../../coders/dev-bin-json/pld-table";
import { INDDevice, NDDevice } from "../../nd-device/device";
import { DataTable, IDataTable_App_Info_Status } from "./datatable";

export type IQTL_TX3016A = INDDevice

export class QTL_TX3016A extends NDDevice implements IQTL_TX3016A {

    //初始化
    init() {
        Debuger.Debuger.log("QTL_TX3016A init");
        //南向输入（NDDevice解码后）
        this.events.south.input.eventEmitter.on(CmdId.penet.toString(), (msg)=>{
            //透传输入
            this.on_south_input_cmd_penet(msg);
        })
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("QTL_TX3016A uninit");
     }

    on_south_input_cmd_penet(msg: IDeviceBusEventData){
        const hd = msg.payload.hd as IDeviceBusDataPayloadHd;
        const pld = msg.payload.pld;

        const data = pld[PldTable.Keys.penet_data];
        const dataTable = DataTable.decode(data);

        hd.entry.id = CmdId.Names[CmdId.report];
  

        //这里检查是否部件运行状态上报：control.cmd=2(发送数据), app.type=2(上传部件运行状态)，然后单独上报部件状态;
        dataTable.forEach(value => {
            if (value && value.control && value.control.cmd == 2) {
                if (value.app && value.app.type == 2 && value.app.infos) {
                    value.app.infos.forEach(info  => {
                        info = (info as IDataTable_App_Info_Status);
                        if (info.unit_addr) {
                            const sub_pref = this.attrs.sub_pref ? this.attrs.sub_pref: "";
                            const id = sub_pref + info.unit_addr;
                            const device: IDeviceBaseAttr = Object.assign({}, this.attrs);
                            device.id = id;
                            device.pid = this.attrs.id;
                            device.model = this.attrs.model + "-UNIT";
                            device.name = (info.unit_mark ? info.unit_mark : "") + (info.unit_addr_desc ? info.unit_addr_desc : "");
                            device.nick = device.name;
                            device.desc = device.name;

                            
                            const msg: IDeviceBusEventData = {
                                id: sub_pref + info.unit_addr,
                                payload: {
                                    hd: hd,
                                    pld: info,
                                    device: {
                                        attrs: device
                                    },
                                },
                                
                            }
                            this.events.north.output.emit(msg);
                        }
                    })
                }
            }                
        })

        msg.payload = {
            hd: hd,
            pld: {data: dataTable }
        }

    }

}