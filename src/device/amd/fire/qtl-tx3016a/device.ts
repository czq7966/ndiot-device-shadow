import { Debuger } from "../../../device-base";
import { IDeviceBase, IDeviceBaseAttr, IDeviceBusDataPayload, IDeviceBusEventData } from "../../../device.dts";
import { CmdId } from "../../coders/dev-bin-json/cmd";
import { ICmdHead } from "../../coders/dev-bin-json/cmd-head";
import { IPldTable, PldTable } from "../../coders/dev-bin-json/pld-table";
import { INDDevice, NDDevice } from "../../nd-device/device";
import { DataTable, IDataTable_App_Info_Status } from "./datatable";

export type IQTL_TX3016A = INDDevice

export class QTL_TX3016A extends NDDevice implements IQTL_TX3016A {

    //初始化
    init() {
        Debuger.Debuger.log("QTL_TX3016A init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("QTL_TX3016A uninit");
     }

    on_south_input_decode(p_hd: ICmdHead, p_pld: IPldTable): IDeviceBusDataPayload {
        const payload = super.on_south_input_decode(p_hd, p_pld);
        if (!payload) return;
        const hd = payload.hd;
        let pld = payload.pld;
        if (hd.cmd_id == CmdId.penet) {  
            const data = pld[PldTable.Keys.penet_data];
            const dataTable = DataTable.decode(data);
            pld = {data: dataTable };     

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
                                        device: device,
                                    },
                                    
                                }
                                this.events.north.output.emit(msg);
                            }
                        })
                    }
                }                
            })
        } 

        return {
            hd: hd,
            pld: pld
        };
    }     

}