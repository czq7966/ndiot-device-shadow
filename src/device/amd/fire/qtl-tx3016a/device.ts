import { Debuger } from "../../../device-base";
import { IDeviceBaseAttr, IDeviceBusDataPayloadHd, IDeviceBusEventData } from "../../../device.dts";
import { Cmd, CmdId } from "../../coders/dev-bin-json/cmd";
import { PldTable } from "../../coders/dev-bin-json/pld-table";
import { INDDevice, NDDevice } from "../../nd-device/device";
import { DataTable, IDataTable_App_Info_Op, IDataTable_App_Info_Status } from "./datatable";

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

        //这里检查控制单元命令：control.cmd=2(发送数据), app.type=2(部件运行状态)/4(设备操作信息)/9(通信线路上行测试)
        dataTable.forEach(value => {
            //发送数据
            if (value && value.control && value.control.cmd == 2) {
                //上传火灾自动报警系统部件运行状态
                if (value.app && value.app.type == 2 && value.app.infos) {
                    value.app.infos.forEach(info  => {
                        info = (info as IDataTable_App_Info_Status);
                        if (info.unit_addr) {
                            const _hd: IDeviceBusDataPayloadHd = {
                                entry:{
                                    type: "evt",
                                    id: "cus_fire"
                                },
                                stp: 0
                            }
                            
                            const _msg: IDeviceBusEventData = {
                                id: msg.id,
                                payload: {
                                    hd: _hd,
                                    pld: info,
                                    device: msg.device
                                },
                                
                            }
                            this.events.north.output.emit(_msg);
                        }
                    })
                }

                //上传火灾自动报警系统设备操作信息
                if (value.app && value.app.type == 4 && value.app.infos) {
                    value.app.infos.forEach(info  => {
                        info = (info as IDataTable_App_Info_Op);
                            const _hd: IDeviceBusDataPayloadHd = {
                                entry:{
                                    type: "evt",
                                    id: "cus_op"
                                },
                                stp: 0
                            }
                            
                            const _msg: IDeviceBusEventData = {
                                id: msg.id,
                                payload: {
                                    hd: _hd,
                                    pld: info,
                                    device: msg.device
                                },
                                
                            }
                            this.events.north.output.emit(_msg);
                    })
                }

                //通信线路上行测试
                if (value.app && value.app.type == 9) {
                    const _hd: IDeviceBusDataPayloadHd = {
                        entry:{
                            type: "evt",
                            id: "cus_test"
                        },
                        stp: 0
                    }
                    
                    const _msg: IDeviceBusEventData = {
                        id: msg.id,
                        payload: {
                            hd: _hd,
                            pld: {},
                            device: msg.device
                        },
                        
                    }
                    this.events.north.output.emit(_msg);
                }
            }                
        })

        msg.payload = {
            hd: hd,
            pld: {data: dataTable }
        }

    }

}