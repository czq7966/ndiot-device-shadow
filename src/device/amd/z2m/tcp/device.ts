
import { IDeviceBusEventData } from "../../../device.dts";
import { IZigbee2Mqtt, Zigbee2Mqtt } from "../base/device";

export interface IZigbee2Mqtt_TCP extends IZigbee2Mqtt {}

export class Zigbee2Mqtt_TCP extends Zigbee2Mqtt implements IZigbee2Mqtt_TCP {

    on_config_get_response(msg: IDeviceBusEventData) {
        super.on_config_get_response(msg);

        //1秒后启动
        setTimeout(() => {
            this.do_z2m_z2m_restart();
        }, 1000)
        
    }

    on_z2m_z2m_close(code) {
        //服务停止，2秒后重启
        setTimeout(() => {
            this.do_z2m_z2m_restart();
        }, 2000)
        
    }
}