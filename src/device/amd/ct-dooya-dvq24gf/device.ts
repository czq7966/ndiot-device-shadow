import { CRC16 } from "../../../common/crc16";
import { Debuger, DeviceBase } from "../../device-base";
import { IDeviceBase, IDeviceBusDataPayload, IDeviceBusEventData, IDeviceShadow } from "../../device.dts";

export interface IDevice extends IDeviceBase {}

//杜亚窗帘，型号：dvq24gf
export class CT_DOOYA_DVQ24GF extends DeviceBase implements IDevice {
    //查询：0x55FEFE010010442E
    //初始化
    init() {
        Debuger.Debuger.log("CT_DOOYA_DVQ24GF init");
    }
     
    //反初始化
    uninit() {
        Debuger.Debuger.log("CT_DOOYA_DVQ24GF uninit");
     }

    //南向输入
    on_south_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("CT_DOOYA_DVQ24GF","on_south_input ");
        let payload: IDeviceBusDataPayload = msg.payload;
        if (payload.pld.raw) {
            //需要解码
            this.on_south_input_decode(msg);
        } else
            super.on_south_input(msg);
    }

    //北向输入
    on_north_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("CT_DOOYA_DVQ24GF  on_north_input");
        this.on_north_input_encode(msg);
    }    

    //子设备输入
    on_child_input(msg: IDeviceBusEventData) {
        Debuger.Debuger.log("CT_DOOYA_DVQ24GF  on_child_input");
        //todo...
        super.on_child_input(msg);       
    }  

//具体业务lql
    //透传输入解码
    on_south_input_decode(msg: IDeviceBusEventData) {
        let raw = msg.payload.pld.raw as String;
        let buf = Buffer.from(raw,'base64');
        let crc = CRC16.Modbus(buf, null, buf.length - 2);
        if (crc[0] == buf[buf.length - 2] && crc[1] == buf[buf.length - 1] || true) { //关闭校验
            if (buf[3] == 0x01 && buf[4] == 0x10) {
                this.on_south_input_decode_state(msg);
            }

            if (buf[3] == 0x03 ) {
                if (buf[4] == 0x01 || buf[4] == 0x02  || buf[4] == 0x03  || buf[4] == 0x04)
                this.on_north_input_encode_get_timout(msg);
            }

        } else {
            Debuger.Debuger.log("CT_DOOYA_DVQ24GF", "on_south_input_penet", "check sum error");
        }
    }

    //当前状态解码->北向输出
    on_south_input_decode_state(msg: IDeviceBusEventData) {
        let raw = msg.payload.pld.raw as String;
        let buf = Buffer.from(raw,'base64');
        let payload: IDeviceBusDataPayload = {
            hd: msg.payload.hd,
            pld: {
                open: buf[7],
                dir: buf[8],
                state: buf[10],
                angel: buf[11],
                angelDir: buf[12],
                angelFac: buf[13],
                travelState: buf[14],
                jogMode: buf[15],
                powerOnPrompt: buf[17]
            }
        } 
        //电机处于转动状态
        if (payload.pld.state === 1 || payload.pld.state == 2) {
            //定时查询
            this.on_north_input_encode_get_timout(msg);
        }
        super.on_south_input({payload: payload});
    }

    //控制指令编码
    on_north_input_encode(msg: IDeviceBusEventData) {
        let open = msg.payload.pld.open;
        if (open === null || open == -1) 
            this.on_north_input_encode_get(msg);
        else if (open === 0 || open == 102) {
            this.on_north_input_encode_close(msg);
            this.on_north_input_encode_get(msg);
        } else if (open === 100 || open === 101) {
            this.on_north_input_encode_open(msg);
            this.on_north_input_encode_get(msg);
        } else if (open > 0 && open < 100) {
            this.on_north_input_encode_pos(msg);
            this.on_north_input_encode_get(msg);    
        } else if (open === 103) {
            this.on_north_input_encode_stop(msg);    
            this.on_north_input_encode_get(msg);
        } else if (open === 200)
            this.on_north_input_encode_dir_default(msg);    
        else if (open === 201)
            this.on_north_input_encode_dir_revert(msg);    
        else if (open === 210)
            this.on_north_input_encode_travel_up(msg);   
        else if (open === 211)
            this.on_north_input_encode_travel_down(msg);               
        else if (open === 212)
            this.on_north_input_encode_travel_del(msg);
        else if (open === 212)
            this.on_north_input_encode_prompt_none(msg);
        else if (open === 212)
            this.on_north_input_encode_prompt_sound(msg);
        else if (open === 212)
            this.on_north_input_encode_prompt_turn(msg);
        else if (open === 212)
            this.on_north_input_encode_prompt_turn_sound(msg);
        else super.on_north_input(msg);
    }


    //
    start() {
        // let data = Buffer.from([0x55, 0xFE, 0xFE, 0x01, 0x00, 0x10, 0x44, 0x2E]);
        // this.penet(data);
        this.on_north_input_encode_open(null);
    }

    //状态查询
    on_north_input_encode_get(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x01, 0x00, 0x10]);
        this.penet(msg, cmd);        
    }

    on_north_input_encode_get_timout_handler: any = 0;
    on_north_input_encode_get_timout(msg: IDeviceBusEventData, timeout?: number) {
        clearTimeout(this.on_north_input_encode_get_timout_handler);
        timeout = timeout || 1000;
        this.on_north_input_encode_get_timout_handler = setTimeout(() => {
            this.on_north_input_encode_get(msg);
        }, timeout)

    }

    //完全打开
    on_north_input_encode_open(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x01]);
        this.penet(msg, cmd);
    }

    //完全关闭
    on_north_input_encode_close(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x02]);
        this.penet(msg, cmd);                        
    }

    //停止
    on_north_input_encode_stop(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x03]);
        this.penet(msg, cmd);        
    }

    //指定位置
    on_north_input_encode_pos(msg: IDeviceBusEventData) {
        let pos = msg.payload.pld.open;
        let cmd = Buffer.from([0x03, 0x04, pos]);
        this.penet(msg, cmd);        
    } 
    
    //默认方向
    on_north_input_encode_dir_default(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x03, 0x01, 0x00]);
        this.penet(msg, cmd);        
    }   
    
    //反方向
    on_north_input_encode_dir_revert(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x03, 0x01, 0x01]);
        this.penet(msg, cmd);        
    }   
    
    //设置上行程
    on_north_input_encode_travel_up(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x05, 0x01]);
        this.penet(msg, cmd);        
    }   
    
    //设置下行程
    on_north_input_encode_travel_down(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x05, 0x02]);
        this.penet(msg, cmd);        
    }   
    
    //删除行程
    on_north_input_encode_travel_del(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x03, 0x07, 0xFF]);
        this.penet(msg, cmd);        
    }   
    
    //上电提示-无提示
    on_north_input_encode_prompt_none(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x0C, 0x01, 0x00]);
        this.penet(msg, cmd);        
    }   
    
    //上电提示-只有声音
    on_north_input_encode_prompt_sound(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x0C, 0x01, 0x01]);
        this.penet(msg, cmd);        
    }   
    
    //上电提示-只有转动
    on_north_input_encode_prompt_turn(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x0C, 0x01, 0x02]);
        this.penet(msg, cmd);        
    }   
    
    //上电提示-转动加声音
    on_north_input_encode_prompt_turn_sound(msg: IDeviceBusEventData) {
        let cmd = Buffer.from([0x02, 0x0C, 0x01, 0x03]);
        this.penet(msg, cmd);        
    }       

    penet(msg: IDeviceBusEventData, cmd: Buffer) {
        let head = Buffer.from([0x55, 0xFE, 0xFE]);
        let data = Buffer.alloc(head.length + cmd.length + 2);
        head.copy(data);
        cmd.copy(data, head.length);
        let sum = CRC16.Modbus(data, null, data.length - 2);
        sum.copy(data, data.length - 2);
        
        let payload: IDeviceBusDataPayload = {
            hd: {
                entry: {
                    type: "svc",
                    id: "penet"
                }
            },
            pld: {
                raw: data.toString('base64')
            }
        }
        this.events.south.output.emit({payload: payload});
    }
}