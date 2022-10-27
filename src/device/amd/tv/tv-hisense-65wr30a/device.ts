import { Debuger } from "../../../device-base";
import { IDeviceBusDataPayload, IDeviceBusEventData } from "../../../device.dts";
import { NDDevice, INDDevice} from "../../nd-device";
import { CmdId } from "../../nd-device/cmd";
import { RegTable } from "../../nd-device/regtable";
import { Coder, DEVProtocal, ICoder, IDEVProtocal, IPLFProtocal } from "./coder";

export interface ITV_HISENSE_65WR30A extends INDDevice {
}

export class TV_HISENSE_65WR30A extends NDDevice implements ITV_HISENSE_65WR30A {
    
    coder = new Coder();
    //初始化
    init() {
        Debuger.Debuger.log("TV_HISENSE_65WR30A init");
        
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("TV_HISENSE_65WR30A uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("TV_HISENSE_65WR30A  on_south_input ");

        if (!msg.decoded && msg.payload) {
            if (this.recvcmd.decode(msg.payload)){
                if (this.recvcmd.decode(msg.payload)){
                    let hd = this.coder.head.decode(this.recvcmd.head);
                    let pld;
                    if (hd.cmd_id == CmdId.penet) {                        
                        let data = this.recvcmd.regtable.tables[RegTable.Keys.penet_data] as Buffer;
                        let devPro = new DEVProtocal();
                        if (data && devPro.decode(data)) {
                           pld = (this.coder.payload as IPLFProtocal).decode(devPro);
                        }

                    }

                    pld = pld ? pld : this.recvcmd.getPayload();
                    msg.payload = {
                        hd: hd,
                        pld: pld
                    }
                    msg.decoded = true;
                };

            };
        }

        super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("TV_HISENSE_65WR30A  on_north_input");
        console.log(msg.payload);
        if (!msg.encoded && msg.payload && !this.attrs.pid) {
            let payload = msg.payload as IDeviceBusDataPayload;
            
            this.coder.head.reset();
            this.coder.payload.reset();
            let hd = this.coder.head.encode(payload.hd);
            let pld = payload.pld;
            if (hd.cmd_id == CmdId.get || hd.cmd_id == CmdId.set) {
                let devPro = this.coder.payload.encode(hd.cmd_id == CmdId.get ? {} : payload.pld) as IDEVProtocal;
                if (devPro) {
                    hd.cmd_id = CmdId.penet;                
                    pld = {};
                    pld[RegTable.Keys.penet_data] = devPro.encode();   
                } else {
                    pld = NDDevice.Plf_coder.payload.encode(pld); 
                }
            } else {                
                pld = NDDevice.Plf_coder.payload.encode(pld);
            }                      

            this.sendcmd.reset();
            msg.payload = this.sendcmd.encode(hd, pld);
            msg.encoded = true;
            console.log(msg.payload);
        }        

        super.on_north_input(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("TV_HISENSE_65WR30A  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  
}