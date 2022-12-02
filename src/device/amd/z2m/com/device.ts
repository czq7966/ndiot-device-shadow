
import { IDeviceBusEventData } from "../../../device.dts";
import { IZigbee2Mqtt, Zigbee2Mqtt } from "../base/device";

export type IZigbee2Mqtt_COM = IZigbee2Mqtt

export class Zigbee2Mqtt_COM extends Zigbee2Mqtt implements IZigbee2Mqtt_COM {

    on_config_get_response(msg: IDeviceBusEventData) {
        super.on_config_get_response(msg);
        let port = process.env.IOT_Z2M_PORT || "/dev/ttyUSB0";
        if (process.platform == "win32")
            port = "COM4";
        this.z2m.config.z2m.serial = {port: port}

        //1秒后启动
        setTimeout(() => {
            this.do_z2m_z2m_restart();
        }, 1000)
    }

    on_z2m_z2m_close(code) {
        //服务停止，10秒后重启
        setTimeout(() => {
            this.do_z2m_z2m_restart();
        }, 10000)
        
    }
}